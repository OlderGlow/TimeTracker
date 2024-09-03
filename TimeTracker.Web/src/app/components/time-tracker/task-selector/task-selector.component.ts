import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { JiraService } from '../../../services/jira.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-task-selector',
  standalone: true,
  template: `
    <mat-form-field appearance="outline" class="task-selector-field">
      <mat-label>Numéro du ticket Jira</mat-label>
      <input matInput
             [ngClass]="{'badge-input': issue$()}"
             [(ngModel)]="task"
             (change)="onTaskSelected($event)"
             placeholder="Entrez le numéro du ticket"
             [readonly]="issue$() !== null"
             (click)="showIssue()"
             />
             @if (issue$()) {
              <button matSuffix mat-icon-button aria-label="Clear" (click)="task=''; issue$.set(null)">
                <mat-icon>close</mat-icon>
              </button>
            }
      <!-- Tooltip or Badge with issue details -->
      <div *ngIf="issue$()" class="badge-tooltip">
        {{ issue$()?.summary }}
      </div>
    </mat-form-field>
  `,
  styles: [`
    .task-selector-field {
      width: 100%;
      position: relative;
    }

    .badge-input {
      background: linear-gradient(90deg, #d53369 0%, #cc9622 100%);
      color: white !important;
      border-radius: 4px;
      padding-left: 8px;
      width: 40%;
      padding: 0.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      cursor: pointer;
    }

    .badge-tooltip {
      visibility: hidden;
      background-color: #333;
      color: #fff;
      text-align: center;
      border-radius: 4px;
      padding: 8px;
      position: absolute;
      left: 0;
      width: 91%;
      opacity: 0;
      transition: opacity 0.3s, visibility 0.3s;
      z-index: 3000;
      bottom: 87%;
    }

    .task-selector-field:hover .badge-tooltip {
      visibility: visible;
      opacity: 1;
    }

    button {
      background: transparent;
      border: none;
    }

    button:hover{
      cursor: pointer;
    }
  `],
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatIconModule]
})
export class TaskSelectorComponent {
  @Input() project: string | null = null;
  @Output() taskSelected = new EventEmitter<string>();
  task: string = '';
  issueService = inject(JiraService);
  issue$ = this.issueService.issue;

  onTaskSelected(event: Event) {
    const selectedTask = (event.target as HTMLInputElement).value;
    if(this.project) {
      const taskComplete = this.project + '-' + selectedTask;
      this.issueService.getIssue(selectedTask, this.project).subscribe((r) => {
        this.task = r?.key || taskComplete;
        this.taskSelected.emit(this.task);
      });
    } else {
      this.issueService.getIssue(this.task).subscribe((r) => {
        this.task = r?.key || this.task;
        this.taskSelected.emit(this.task);
      });
    }
  }

  clearIssue() {
    this.issueService.clearIssue();
    this.task = '';
  }

  showIssue() {
    if(this.issue$()) {
      window.open(`${this.issue$()?.url}`, '_blank');
    }
  }
}
