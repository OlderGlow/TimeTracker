import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-project-selector',
  standalone: true,
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Projet</mat-label>
      <mat-select [value]="selectedProject" (selectionChange)="onProjectChange($event)">
        <mat-option *ngFor="let project of projects" [value]="project">{{ project }}</mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
    }
  `],
  imports: [CommonModule, MatFormFieldModule, MatSelectModule]
})
export class ProjectSelectorComponent {
  @Output() projectSelected = new EventEmitter<string>();

  projects = ['GRC3', 'GRC2', 'FRDV'];
  selectedProject = this.projects[0];

  constructor() {
    this.projectSelected.emit(this.selectedProject);
  }

  onProjectChange(event: any) {
    const selectedProject = event.value;
    this.projectSelected.emit(selectedProject);
  }
}
