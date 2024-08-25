import { Routes } from '@angular/router';
import { TimeTrackerComponent } from './components/time-tracker/time-tracker.component';

export const routes: Routes = [
  {
    path: 'timetracker',
    component: TimeTrackerComponent
  },
  {
    path: '',
    redirectTo: '/timetracker',
    pathMatch: 'full'
  }
];
