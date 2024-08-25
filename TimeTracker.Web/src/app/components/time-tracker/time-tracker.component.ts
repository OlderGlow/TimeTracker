import { Component, inject, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { SummaryComponent } from "./summary/summary.component";
import { ProjectSelectorComponent } from "./project-selector/project-selector.component";
import { TaskSelectorComponent } from "./task-selector/task-selector.component";
import { DateTimePickerComponent } from "./date-time-picker/date-time-picker.component";
import { NoteComponent } from "./note-component/note-component.component";
import { WorklogListComponent } from "../worklog-list/worklog-list.component";
import { CommonModule } from '@angular/common';
import { Worklog } from '../../models/worklog';
import { DatePickerComponent } from "./date-picker/date-picker.component";
import { WorklogService } from '../../services/worklog-service.service';
import { format } from 'date-fns';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { JiraService } from '../../services/jira-service.service';

@Component({
  selector: 'app-time-tracker',
  standalone: true,
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.css'],
  imports: [
    SummaryComponent,
    ProjectSelectorComponent,
    TaskSelectorComponent,
    DateTimePickerComponent,
    NoteComponent,
    WorklogListComponent,
    CommonModule,
    DatePickerComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
})
export class TimeTrackerComponent {
  selectedDate: Date = new Date();
  currentDate = new Date();
  selectedProject: string = 'GRC3';
  selectedTask: string | null = null;
  startTime = signal<Date | null>(new Date());
  endTime = signal<Date | null>(null);
  note: string = '';
  worklogs: Worklog[] = [];
  @ViewChild(WorklogListComponent) worklogListComponent: WorklogListComponent | undefined;
  @ViewChild(TaskSelectorComponent) taskSelectorComponent: TaskSelectorComponent | undefined;
  @ViewChildren(DateTimePickerComponent) dateTimePickers!: QueryList<DateTimePickerComponent>;
  worklogService = inject(WorklogService);
  jiraService = inject(JiraService);
  currentDate$ = this.worklogService.currentDate;
  isEndTimeInvalid = false;
  isAlreadyTaskInProgress = signal<boolean>(false);

  onProjectSelected(project: string) {
    this.selectedProject = project;
  }

  onTaskSelected(task: string) {
    this.selectedTask = task;
  }

  onDateSelected(date: Date) {
    this.selectedDate = date;
    const formattedDate = format(this.selectedDate, 'dd-MM-yyyy');
    this.currentDate$.set(formattedDate);
    this.loadWorklogsForSelectedDate();
    this.currentDate = new Date(date);
  }

  loadWorklogsForSelectedDate() {
    const formattedDate = format(this.selectedDate, 'dd-MM-yyyy');
    this.worklogService.getWorklogs(formattedDate);
  }

  constructor() {
    this.loadWorklogsForSelectedDate();
  }

  submitWorklog() {
    if (this.isEndTimeInvalid) return;

    if (this.hasOverlappingWorklog(this.startTime(), this.endTime())) {
      this.isAlreadyTaskInProgress.set(true);
      return;
    }

    const normalizedStartTime = this.normalizeTime(this.startTime());
    const normalizedEndTime = this.normalizeTime(this.endTime());

    const worklog: Worklog = {
      id: this.selectedTask ?? '1',
      project: this.selectedProject ?? 'GRC2',
      task: this.selectedTask ?? 'Développement',
      startTime: normalizedStartTime ?? new Date(),
      endTime: normalizedEndTime ?? null,
      note: this.note
    };

    const formattedDate = format(this.currentDate, 'dd-MM-yyyy');
    this.worklogService.submitWorklog(worklog, formattedDate).subscribe(() => {
      this.loadWorklogsForSelectedDate();
      this.resetFields();
      this.worklogListComponent?.stopPreviousWorklog();
    });
  }

  private hasOverlappingWorklog(newStartTime: Date | null, newEndTime: Date | null): boolean {
    if (!newStartTime || !newEndTime) return false;

    return this.worklogService.worklogs().some(worklog => {
      const existingStartTime = worklog.startTime;
      const existingEndTime = worklog.endTime || new Date();
      return (newStartTime < existingEndTime && newEndTime > existingStartTime);
    });
  }


  private normalizeTime(date: Date | null): Date | null {
    if (!date) return null;
    const normalizedDate = new Date(date);
    normalizedDate.setSeconds(0, 0); // Définit les secondes et millisecondes à zéro
    return normalizedDate;
  }

  private resetFields() {
    this.selectedTask = null;
    this.startTime.set(null);
    this.endTime.set(null);
    this.note = '';
    this.jiraService.clearIssue();
    this.taskSelectorComponent?.clearIssue();
    this.dateTimePickers?.forEach(element => {
      element.clearValues();
    });
  }

  validateEndTime() {
    if (this.startTime && this.endTime) {
      this.isEndTimeInvalid = this.endTime < this.startTime;
    } else {
      this.isEndTimeInvalid = false;
    }
    this.isAlreadyTaskInProgress.set(false);
  }
}
