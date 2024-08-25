import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-note',
  standalone: true,
  template: `
    <mat-form-field appearance="outline" class="note">
      <mat-label>Note</mat-label>
      <input matInput id="note" placeholder="Ajouter une note..." [(ngModel)]="note" (ngModelChange)="onNoteChange($event)" />
    </mat-form-field>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
    }
  `],
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule]
})
export class NoteComponent {
  @Input() note: string = '';
  @Output() noteChange = new EventEmitter<string>();

  onNoteChange(newNote: string) {
    this.note = newNote;
    this.noteChange.emit(this.note);
  }
}
