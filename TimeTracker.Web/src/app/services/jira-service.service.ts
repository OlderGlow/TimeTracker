import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environments';
import { Issue } from '../models/issue';
import { HttpClient } from '@angular/common/http';
import { TrackerResult } from '../models/tracker-result';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JiraService {
  private baseUrl: string = environment.API_URL;
  issue = signal<Issue | null>(null);
  private http = inject(HttpClient);

  getIssue(key: string, projectId?: string): Observable<Issue | null | undefined> {
    const url = `${this.baseUrl}/TimeTracker/Jira/${key}?projectId=${projectId}`;
    return this.http.get<TrackerResult<Issue>>(url).pipe(
      map(result => {
        if (result.isSuccess) {
          this.issue.set(result.data ?? null);
        } else {
          this.issue.set(null);
        }
        console.log(result.data);
        return result.data;
      })
    );
  }

  clearIssue(): void {
    this.issue.set(null);
  }
}
