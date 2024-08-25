import { Issue } from "./issue";

export interface Worklog {
  id: string | null;
  project: string;
  task: string;
  startTime: Date;
  endTime: Date | null;
  note: string;
  issue?: Issue;
  isEditing?: boolean;
}
