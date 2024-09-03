import { Issue } from "./issue";

export interface WorklogDto {
  id?: string;
  project: string;
  name: string;
  startTime: Date;
  endTime: Date | null;
  notes: string;
  category: number;
  isCompleted: boolean;
  issue?: Issue;
}
