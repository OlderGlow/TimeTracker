import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  template: `
    <mat-form-field appearance="outline" class="date-time-item">
      <mat-label>{{ label }}</mat-label>
      <input matInput type="time" (change)="onDateTimeChange($event)" #dateInput>
    </mat-form-field>
  `,
  styles: [`
    mat-form-field {
      width: 90%;
    }
  `],
  imports: [MatFormFieldModule, MatInputModule]
})
export class DateTimePickerComponent {
  @Input() label: string = '';
  @ViewChild('dateInput') dateInput!: ElementRef<HTMLInputElement>; // Ajoutez ViewChild ici
  dateTime = input<Date | null>(null);
  dateTimeChange = output<Date | null>();

  onDateTimeChange(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value; // "HH:mm"
    if (!inputValue) {
      return;
    }

    const [hours, minutes] = inputValue.split(':').map(Number);
    let updatedDateTime: Date;

    if (this.dateTime()) {
      updatedDateTime = new Date(this.dateTime() ?? new Date());
      updatedDateTime.setHours(hours, minutes);
    } else {
      updatedDateTime = new Date();
      updatedDateTime.setHours(hours, minutes, 0, 0);
    }

    this.dateTimeChange.emit(updatedDateTime);
  }

  clearValues() {
    this.dateTimeChange.emit(null);
    if (this.dateInput) {
      this.dateInput.nativeElement.value = ''; // Réinitialiser la valeur de l'entrée
    }
  }
}
