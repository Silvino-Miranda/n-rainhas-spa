import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qs-no-solution-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './no-solution-alert.component.html',
  styleUrls: ['./no-solution-alert.component.scss']
})
export class NoSolutionAlertComponent {
  queensCount = input(0);
}
