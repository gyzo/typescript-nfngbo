// Import stylesheets
import './style.css';
import ko from 'knockout';
import moment from 'moment';
import { DatePickerComponent } from './month.factory';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');

DatePickerComponent.register();

ko.applyBindings({
  from: ko.observable((moment().add(1, 'd')).format('DD.MM.YYYY')),
  to: ko.observable(null),
  selectDay: () => console.log('final sd')
});
