// Import stylesheets
import './style.css';
import ko from 'knockout';
import { DatePickerComponent } from './month.factory';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');

DatePickerComponent.register();

ko.applyBindings({
  from: ko.observable(null),
  to: ko.observable(null),
  selectDay: () => console.log('final sd')
});
