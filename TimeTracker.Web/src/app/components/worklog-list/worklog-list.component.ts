import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, Input } from '@angular/core';
import { Worklog } from '../../models/worklog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SummaryComponent } from "../time-tracker/summary/summary.component";
import { MatCardModule } from '@angular/material/card';
import { WorklogService } from '../../services/worklog-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-worklog-list',
  standalone: true,
  templateUrl: './worklog-list.component.html',
  styleUrls: ['./worklog-list.component.css'],
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, SummaryComponent, MatCardModule, FormsModule]
})
export class WorklogListComponent {

  worklogService = inject(WorklogService);
  worklogs = this.worklogService.worklogs;
  displayedColumns: string[] = ['project', 'task', 'startTime', 'endTime', 'duration', 'note', 'actions'];
  currentDate = this.worklogService.currentDate;
  currentDateDisplay = computed(() => this.currentDate().replace(/-/g, '/'));

  calculateDuration(startTime: Date, endTime: Date | null): string {
    if (!startTime || !endTime) return '';
    const diff = new Date(endTime).getTime() - new Date(startTime).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  editWorklog(worklog: Worklog) {
    worklog.isEditing = true;
  }

  deleteWorklog(worklog: Worklog) {
    if(!worklog.id) return;

    this.worklogService.deleteWorklog(worklog.id).subscribe(() => {
      this.worklogs.set(this.worklogs().filter(w => w.id !== worklog.id));
    });
  }

  saveWorklog(worklog: Worklog) {
    worklog.isEditing = false;
    console.log(worklog);
  }

  resumeWorklog(worklog: Worklog) {
    if (worklog.endTime !== null) {
      worklog.endTime = null;
      console.log('Resume worklog', worklog);
    }
  }

  stopWorklog(worklog: Worklog) {
    if (!worklog.endTime) {
      worklog.endTime = new Date();
      this.worklogService.worklogs.set(this.worklogs().map(w => w.id === worklog.id ? worklog : w));
    }
  }

  stopPreviousWorklog() {
    const lastWorklog = this.worklogs.length > 1 && this.worklogs().find(w => !w.endTime);
    if (lastWorklog) {
      this.stopWorklog(lastWorklog);
    }
  }

  onIssueClick(worklog: Worklog) {
    console.log(worklog)
    const issueUrl = worklog.issue?.url;

    if (issueUrl && this.isValidUrl(issueUrl)) {
      window.open(issueUrl, '_blank');
    } else {
      console.error('Invalid URL:', issueUrl);
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }
}
