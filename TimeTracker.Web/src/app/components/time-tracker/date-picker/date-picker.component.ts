import { Component, Output, EventEmitter, LOCALE_ID } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CustomDateAdapter } from '../../../directives/date-adapter'; // Assurez-vous d'importer votre adaptateur personnalisé

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [MatCardModule, MatNativeDateModule, CommonModule, MatDatepickerModule],
  template: `
    <mat-card class="demo-inline-calendar-card">
      <mat-calendar [(selected)]="selectedDate"
                    (selectedChange)="onDateChange($event)"
                    [dateClass]="dateClass">
      </mat-calendar>
    </mat-card>
  `,
  styles: [`
    .demo-inline-calendar-card {
      width: 100%;
      max-width: 320px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(100px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      color: #272727;
      margin-bottom: 1rem;
    }
    mat-calendar {
      width: 100%;
      color: #272727;
    }
    .grayscale {
      color: gray;
      color: #272727;
    }
    .red{
      color: #272727;
    }
  `],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: LOCALE_ID, useValue: 'fr' },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ]
})
export class DatePickerComponent {
  selectedDate: Date = new Date();

  @Output() dateChange = new EventEmitter<Date>();

  dateClass = (d: Date): string => {
    const day = d.getDay();
    return (day === 0 || day === 6) ? 'grayscale' : 'red';
  }

  onDateChange(event: Date | null) {
    if (event) {
      this.dateChange.emit(event);
    }
  }
}
