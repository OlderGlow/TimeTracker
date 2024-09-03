import { Component, effect, inject, WritableSignal, signal } from '@angular/core';
import { Worklog } from '../../../models/worklog';
import { MatCardModule } from '@angular/material/card';
import { WorklogService } from '../../../services/worklog.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-summary',
  standalone: true,
  template: `
    <mat-card class="summary">
      <div class="summary-content">
        <p><strong>Total de ce jour :</strong> {{ totalDayTime }}h</p>
        <p><strong>Total hebdomadaire :</strong> {{ totalWeekTime }}h</p>
      </div>
    </mat-card>
  `,
  styles: [`
    .summary {
      width: 100%;
      padding: 20px;
      display: flex;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(100px);
      margin-bottom: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .summary-content {
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
      font-size: 1.1em;
      color: #f3f3f3;
      background: transparent;
    }
    mat-card {
      border-radius: 8px;
      background: transparent;
    }
    p{
      margin: 0;
    }
  `],
  imports: [MatCardModule]
})
export class SummaryComponent {
  totalDayTime = '0:00';
  totalWeekTime = '0:00';
  worklogService = inject(WorklogService);
  currentWeek = this.worklogService.currentDate();

  worklogs = this.worklogService.worklogs;
  weeklyWorklogs = this.worklogService.weeklyWorklogs;

  ngDoCheck(){
    this.totalDayTime = this.calculateTotalDayTime();
  }

  calculateTotalDayTime() {
    const total = this.worklogs().reduce((acc, worklog) => {
      return acc + this.calculateDuration(worklog.startTime, worklog.endTime);
    }, 0);
    this.calculateTotalWeekTime();
    return this.formatTime(total);
  }

  calculateTotalWeekTime() {
    if(this.weeklyWorklogs().length === 0){
      this.totalWeekTime = '0:00';
      return;
    }
    const total = this.weeklyWorklogs().reduce((acc, worklog) => {
      return acc + this.calculateDuration(worklog.startTime, worklog.endTime);
    }, 0);
    this.totalWeekTime = this.formatTime(total);
  }

  calculateDuration(startTime: Date, endTime: Date | null) {
    if (!endTime) {
      return 0;
    }
    return (endTime.getTime() - startTime.getTime()) / 1000 / 60 / 60;
  }

  formatTime(hours: number) {
    const hoursInt = Math.floor(hours);
    const minutes = Math.round((hours - hoursInt) * 60);
    return `${hoursInt}:${minutes < 10 ? '0' + minutes : minutes}`;
  }
}
