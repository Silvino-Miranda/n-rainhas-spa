import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-qs-no-solution-alert',
  templateUrl: './no-solution-alert.component.html',
  styleUrls: ['./no-solution-alert.component.scss']
})
export class NoSolutionAlertComponent {
  @Input() queensCount = 0;
}
