import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { Worklog } from '../models/worklog';
import { TrackerResult } from '../models/tracker-result';
import { WorklogDto } from '../models/worklog-dto';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class WorklogService {
  private baseUrl: string = environment.API_URL;
  worklogs = signal<Worklog[]>([]);
  weeklyWorklogs = signal<Worklog[]>([]);
  currentDate = signal<string>(format(new Date(), 'dd-MM-yyyy'));

  constructor(private http: HttpClient) {
    this.loadWeeklyWorklogs(this.currentDate());
  }

  getWorklogs(date: string): void {
    const url = this.buildUrlForDate(date);
    this.http.get<TrackerResult<any[]>>(url).pipe(
      map(result => this.mapToWorklogs(result))
    ).subscribe(worklogs => {
      this.worklogs.set(worklogs);
      this.checkAndLoadWeeklyWorklogs(date);
    });
  }

  submitWorklog(worklog: Worklog, date: string): Observable<any> {
    const transformedWorklog = this.transformWorklog(worklog);
    const url = this.buildUrlForDate(date);
    this.worklogs.set([...this.worklogs(), worklog]);
    return this.http.post(url, transformedWorklog);
  }

  updateWorklog(id: number, worklog: any): Observable<any> {
    const url = `${this.baseUrl}/TimeTracker/${id}`;
    return this.http.put(url, worklog);
  }

  deleteWorklog(id: string): Observable<any> {
    const url = this.buildUrlForDateWithId(id);
    return this.http.delete(url);
  }

  getWeeklyWorklogs(startDate: string, endDate: string): Observable<Worklog[]> {
    const url = this.buildUrlForWeeklyWorklogs(startDate, endDate);
    return this.http.get<TrackerResult<WorklogDto[]>>(url).pipe(
      map(result => this.mapToWorklogs(result))
    );
  }

  // Private methods

  private loadWeeklyWorklogs(date: string): void {
    const formattedStartDate = this.getFirstDayOfWeek(date);
    const formattedEndDate = this.getLastDayOfWeek(date);
    this.getWeeklyWorklogs(formattedStartDate, formattedEndDate).subscribe(worklogs => {
      this.weeklyWorklogs.set(worklogs);
    });
  }

  private checkAndLoadWeeklyWorklogs(date: string): void {
    const newWorklogWeek = this.getFirstDayOfWeek(date);
    const existingWorklogWeek = this.getExistingWorklogWeek();
    const currentWeek = this.getFirstDayOfWeek(this.currentDate());

    if (this.shouldReloadWeeklyWorklogs(existingWorklogWeek, newWorklogWeek, currentWeek)) {
      this.loadWeeklyWorklogs(date);
    }
  }

  private shouldReloadWeeklyWorklogs(
    existingWorklogWeek: string | null,
    newWorklogWeek: string,
    currentWeek: string
  ): boolean {
    return !existingWorklogWeek || newWorklogWeek !== existingWorklogWeek || newWorklogWeek === currentWeek;
  }

  private getExistingWorklogWeek(): string | null {
    return this.worklogs().length > 0
      ? this.getFirstDayOfWeek(format(this.worklogs()[0].startTime, 'dd-MM-yyyy'))
      : null;
  }

  private buildUrlForDate(date: string): string {
    return `${this.baseUrl}/TimeTracker/${date}`;
  }

  private buildUrlForDateWithId(id: string): string {
    return `${this.baseUrl}/TimeTracker/${this.currentDate()}/${id}`;
  }

  private buildUrlForWeeklyWorklogs(startDate: string, endDate: string): string {
    return `${this.baseUrl}/TimeTracker/weeklyDurationWorklog?startDate=${startDate}&endDate=${endDate}`;
  }

  private mapToWorklogs(result: TrackerResult<any[]>): Worklog[] {
    if (result.isSuccess && result.data) {
      return result.data.map(worklog => this.transformToWorklog(worklog));
    }
    return [];
  }

  private transformWorklog(worklog: Worklog): WorklogDto {
    return {
      name: worklog.task,
      category: 0,
      startTime: worklog.startTime,
      endTime: worklog.endTime ?? null,
      isPaused: worklog.endTime !== null,
      notes: worklog.note,
      project: worklog.project,
    };
  }

  private transformToWorklog(worklog: WorklogDto): Worklog {
    return {
      id: worklog.id ?? null,
      project: worklog.project,
      task: worklog.name,
      startTime: new Date(worklog.startTime),
      endTime: worklog.endTime ? new Date(worklog.endTime) : null,
      note: worklog.notes,
      issue: worklog.issue ?? undefined,
    };
  }

  private getFirstDayOfWeek(date: string): string {
    const dateObj = this.parseDateString(date);
    const day = dateObj.getDay();
    const diff = dateObj.getDate() - day + (day == 0 ? -6 : 1);
    return format(new Date(dateObj.setDate(diff)), 'dd-MM-yyyy');
  }

  private getLastDayOfWeek(date: string): string {
    const dateObj = this.parseDateString(date);
    const day = dateObj.getDay();
    const diff = dateObj.getDate() - day + (day == 0 ? -6 : 1);
    return format(new Date(dateObj.setDate(diff + 6)), 'dd-MM-yyyy');
  }

  private parseDateString(date: string): Date {
    const [day, month, year] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
