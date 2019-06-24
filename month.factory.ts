import moment from 'moment/min/moment-with-locales';
import ko from 'knockout';

moment.locale('pl');
export const daysOfWeek = ['pn', 'wt', 'śr', 'cz', 'pt', 'so', 'nd'];

export function createMonth(day: number, month: number, year: number) {
  const newMonth = moment(`${year}-${month}-${day}`);
  const monthOfNewMonth = newMonth.format('MM');
  
  const startOfMonthString = newMonth.startOf('month').format('dd');
  const startOfMonth = moment(`${year}-${month}-${day}`).startOf('month');
  const endOfMonth = newMonth.endOf('month');
  let loopStarted = false;
  let loopFinished = false;
  const daysOfMonth = daysOfWeek
    .concat(daysOfWeek)
    .concat(daysOfWeek)
    .concat(daysOfWeek)
    .concat(daysOfWeek);

  let monthView = {
    label: `${newMonth.format('MMMM')} ${newMonth.format('YYYY')}`,
    num: newMonth.get('month'),
    collection: []
  }

  daysOfMonth.forEach(
    (value, index) => {
      let newDay = new DayView(value, index);

      if (startOfMonthString.toLowerCase() === value) {
        loopStarted = true;
        console.log('loopStarted ' + startOfMonthString.toLowerCase() + ' ' + value + ' ' + loopFinished);
      }

      if (loopStarted  && !loopFinished) {
        console.log(value + ' ' + newDay.name + ' = ' + startOfMonth.format('dd'));
        newDay.fullDate = startOfMonth.format('DD.MM.YYYY');
        newDay.label = startOfMonth.format('dd');
        newDay.dayOfMonth = Number(startOfMonth.format('D'));
        newDay.yearOfMonth = Number(startOfMonth.format('YYYY'));
        newDay.isVisible(true);
        newDay.disabled = false;
       startOfMonth.add(1, 'd');
       if (monthOfNewMonth !== startOfMonth.format('MM')) {
          loopFinished = true;
        }
      }
      
      monthView.collection.push(newDay);
     
      
    }
  )

  return monthView;
}

export class DayView {
  name = '';
  index: number;
  label = '';
  dayOfMonth: number;
  yearOfMonth: number;
  selected: KnockoutObservable<boolean> = ko.observable(false);
  isVisible: KnockoutObservable<boolean> = ko.observable(false);
  inRange: KnockoutObservable<boolean> = ko.observable(false);
  isStartRange: KnockoutObservable<boolean> = ko.observable(false);
  isEndRange: KnockoutObservable<boolean> = ko.observable(false);
  fullDate = '';
  disabled: boolean = true;

  constructor(value: string, index: number) {
    this.name = value;
    this.index = index;
  }
}


interface WeekView {
  collection: DayView[];
}

interface MonthView {
  label: string;
  num: number;
  collection: DayView[];
}

interface MonthsView {
  collection: MonthView[];
}
class Months implements MonthsView {
  collection: MonthView[] = [];
}
interface DatePickerInputParameters {
  currentDate?: string;
  firstMonth?: number;
  dateFrom?: KnockoutObservable<string>;
  dateTo?: KnockoutObservable<string>;
}
interface DatePickerOutputParameters {
  onSelectDay?: Function;
  onClose?: Function;
}
interface DatePickerParameters {
  input: DatePickerInputParameters,
  output: DatePickerOutputParameters
}

export class DatePickerComponent {
  onClose: Function;
  monthsView: MonthsView;
  dateFrom: KnockoutObservable<string> = ko.observable('');
  dateTo: KnockoutObservable<string> = ko.observable('');
  private selectedDateFrom: KnockoutObservable<string> = ko.observable('');
  private selectedDateTo: KnockoutObservable<string> = ko.observable('');
  private daysOfWeek: string[];

  onSelectDay?: Function;
  onSubmit?: Function;

  constructor(params: DatePickerParameters) {
    this.daysOfWeek = daysOfWeek;
    this.monthsView = new Months();
    this.setMonths();

    if (params.input && params.input.dateFrom) {
      this.selectedDateFrom(params.input.dateFrom());
      this.dateFrom = params.input.dateFrom;
    }
    if (params.input && params.input.dateTo) {
      this.selectedDateTo(params.input.dateTo());
      this.dateTo = params.input.dateTo;
    }

    if (params.output && params.output.onSelectDay) {
      this.onSelectDay = params.output.onSelectDay;
    }

    if (params.output && params.output.onClose) {
      this.onClose = params.output.onClose;
    }

    this.bindSelectDay();
  }

  private getRangeForSelectedDatesAndNewDate(newDate: string): { firstDate: string, lastDate: string } {
    let firstDate = this.selectedDateFrom();
    let lastDate = this.selectedDateTo();

    let mFirstDate = moment(firstDate, 'DD.MM.YYYY');
    let mLastDate = moment(lastDate, 'DD.MM.YYYY');
    let mNewDate = moment(newDate, 'DD.MM.YYYY');

    if (lastDate) {
      firstDate = newDate;
      lastDate = null;
    } else {
      if (firstDate) {
        if (mNewDate > mFirstDate) {
          lastDate = newDate;
        } else {
          lastDate = firstDate;
          firstDate = newDate;
        }
      } else {
        firstDate = newDate;
      }
    }

    return {
      firstDate: firstDate,
      lastDate: lastDate
    }
  }

  submit() {
    this.dateFrom(this.selectedDateFrom());
    this.dateTo(this.selectedDateTo());
    alert('submit');
  }

  close() {
    if (this.onClose) {
      this.onClose();
    }
  }

  private bindSelectDay() {
    if (!this.onSelectDay) {
      return;
    }
    const copyOnSelectDay = this.onSelectDay;

    this.onSelectDay = ({ day }: { day: DayView }) => {
      if (day.disabled) {
        return;
      }

      let dates: { firstDate: string, lastDate: string } = this.getRangeForSelectedDatesAndNewDate(day.fullDate);
      let mFirstDate = moment(dates.firstDate, 'DD.MM.YYYY');
      let mLasttDate = moment(dates.lastDate, 'DD.MM.YYYY');

      this.monthsView.collection.forEach(
        (month: MonthView) => {
          month.collection.forEach(
            (dayView: DayView) => {
              let mFullDate = moment(dayView.fullDate, 'DD.MM.YYYY');

              if (
                (dates.firstDate && mFullDate.format('DD.MM.YYYY') == mFirstDate.format('DD.MM.YYYY')) ||
                (dates.lastDate && mFullDate.format('DD.MM.YYYY') == mLasttDate.format('DD.MM.YYYY'))
              ) {
                dayView.selected(true);
              } else {
                dayView.selected(false);
              }

              if (dates.firstDate && dates.lastDate && mFullDate > mFirstDate && mFullDate < mLasttDate) {
                dayView.inRange(true);
              } else {
                dayView.inRange(false);
              }
            }
          )
        }
      )

      this.selectedDateFrom(dates.firstDate);
      this.selectedDateTo(dates.lastDate);

      copyOnSelectDay.call({ day: day });
    };
  }

  private setMonths(): void {
    const firstMonth = moment();
    let newMonth = createMonth(Number(firstMonth.format('D')), Number(firstMonth.format('MM')), Number(firstMonth.format('YYYY')));


    this.monthsView.collection.push(newMonth);
    for (let i = 0; i < 11; i++) {
      let month = firstMonth.add(1, 'M');
      let newMonth = createMonth(Number(month.format('D')), Number(month.format('MM')), Number(month.format('YYYY')));
      this.monthsView.collection.push(newMonth);
    }
  }

  public static register(): void {
    ko.components.register('date-cmp', DateComponentConfig);
    ko.components.register('day-component', DayComponentConfig);
    ko.components.register('month-component', monthComponentConfig);
    ko.components.register('months-component', monthsComponentConfig);
    ko.components.register('datepicker-component', datePickerComponentConfig);
  }
}

interface MonthsInputParameters {
  months: MonthsView;
}

interface MonthsOutputParameters {
  onSelectDay?: Function;
}

interface MonthsParameters {
  input: MonthsInputParameters,
  output: MonthsOutputParameters
}

interface MonthInputParameters {
  month: MonthView;
}

interface MonthOutputParameters {
  onSelectDay?: Function;
}

interface MonthParameters {
  input: MonthInputParameters,
  output: MonthOutputParameters
}

class MonthsComponent {
  private monthsView: MonthsView;
  onSelectDay?: Function;

  constructor(params: MonthsParameters) {
    this.monthsView = params.input.months

    if (params.output && params.output.onSelectDay) {
      this.onSelectDay = params.output.onSelectDay;
    }
  }

}

class MonthComponent {
  private monthView: MonthView;
  onSelectDay?: Function;

  constructor(params: MonthParameters) {
    this.monthView = params.input.month;

    if (params.output && params.output.onSelectDay) {
      this.onSelectDay = params.output.onSelectDay;
    }
  }
}

interface DayInputParameters {
  day: DayView;
}

interface DayOutputParameters {
  selectDay?: Function;
}

interface DayParameters {
  input: DayInputParameters,
  output: DayOutputParameters
}

class DayCmp {
  private dayView: DayView;
  onSelectDay?: Function;
  constructor(params: any) {
    this.dayView = params.input.day;

    if (params.output && params.output.onSelectDay) {
      this.onSelectDay = params.output.onSelectDay;
    }
  }

  selectDay() {
    if (this.onSelectDay) {
      this.onSelectDay({
        day: this.dayView
      });
    }
  }
}

const datePickerComponentConfig: KnockoutComponentTypes.ComponentConfig = {
  template: `
  <header>
  <input type='hidden' data-bind="value: selectedDateFrom">
  <input type='hidden' data-bind="value: selectedDateTo">
  <svg class='ft-dp__close' data-bind='click: close' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path class="st0" d="M13.3 16L25.1 4.2 21.9 1l-15 15 15 15 3.2-3.2z"></path></svg>
  <h3 class='ft-dp__header'>Kalendarz</h3>
  <div class='ft-dp__dates'>
    <date-cmp params="input: { date: selectedDateFrom, label: 'Wylot od' }"></date-cmp>
    <div class='ft-dp__dates-icon'>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path class="st0" d="M31.5 15.5L19 2.9c-.3-.3-.8-.3-1.1 0-.3.3-.3.8 0 1.1l11.3 11.3H1c-.4 0-.7.3-.7.8 0 .4.3.7.7.7h28.2L17.9 28c-.3.3-.3.8 0 1.1.3.3.8.3 1.1 0l12.5-12.5c.3-.4.3-.8 0-1.1z"></path></svg>
    </div>
    <date-cmp params="input: { date: selectedDateTo, label: 'Przylot do' }"></date-cmp>
  </div>
  <div class='ft-dp__days' data-bind='foreach: daysOfWeek'>
    <div class='ft-dp__day' data-bind='text: $data'></div>
  </div>
  </header>
  <months-component params='input: { months: monthsView }, output: { onSelectDay: onSelectDay }'></months-component>
  <footer class='ft-dp__footer'>
  <button data-bind="click: submit" class='ft-btn-primary'>Wybierz</button>
  </footer>
  `,
  viewModel: (params: DatePickerParameters) => new DatePickerComponent(params)
};

const monthsComponentConfig: KnockoutComponentTypes.ComponentConfig = {
  template: `<!-- ko foreach: monthsView.collection -->
  <month-component params='input: { month: $data}, output: { onSelectDay: $parent.onSelectDay }' ></month-component>
  <!-- /ko -->`,
  viewModel: (params: MonthsParameters) => new MonthsComponent(params)
};

const monthComponentConfig: KnockoutComponentTypes.ComponentConfig = {
  template: `
  <div class='ft-dpmonth__header' data-bind='text: monthView.label'></div>
  <!-- ko foreach: monthView.collection -->
  <day-component params="input: { day: $data }, output: { onSelectDay: $parent.onSelectDay }"></day-component>
  <!-- /ko -->`,
  viewModel: (params: MonthParameters) => new MonthComponent(params)
};

const DayComponentConfig: KnockoutComponentTypes.ComponentConfig = {
  template: `<div data-bind="css: { 'green': dayView.selected(),  'light-blue': dayView.inRange() }, click: selectDay"><!-- ko text: dayView.dayOfMonth --><!-- /ko --></div>`,
  viewModel: (params: DayParameters) => new DayCmp(params)
};

class DateComponent {
  date: KnockoutObservable<string>;
  label: string;
  day: KnockoutObservable<string> = ko.observable();
  dayString: KnockoutObservable<string> = ko.observable();
  month: KnockoutObservable<string> = ko.observable();;


  constructor(params: DateParameters) {
    this.date = params.input.date;
    this.label = params.input.label;

    const mValue = moment(this.date(), 'DD.MM.YYYY');

    this.day(mValue.format('DD'));
    this.dayString(mValue.format('dd'));
    this.month(mValue.format('MMM'));

    this.date.subscribe(
      value => {
        const mValue = moment(value, 'DD.MM.YYYY');
        this.day(mValue.format('DD'));
        this.dayString(mValue.format('dd'));
        this.month(mValue.format('MMM'));
      }
    )
  }
}


interface DateInputParameters {
  date: KnockoutObservable<string>;
  label: string;
}
interface DateParameters {
  input: DateInputParameters
}
const DateComponentConfig: KnockoutComponentTypes.ComponentConfig = {
  template: `
    <div class='ft-dpdate'>
      <div class='ft-dpdate__label' data-bind='text: label'>
      </div>
      <div class='ft-dpdate__date' data-bind="attr: { 'style': (date() ? '' : 'display: none;') }">
        <div class='ft-dpdate__num' data-bind='text: day()'>
        </div>
        <div class='ft-dpdate__strings'>
        <div class='ft-dpdate__day'  data-bind='text: dayString()'></div>
        <div class='ft-dpdate__month'  data-bind='text: month()'></div>
        </div>
      </div>
    </div>
  `,
  viewModel: (params: DateParameters) => new DateComponent(params)
};
