export interface TrackerResult<T> {
  isSuccess: boolean;
  data?: T | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}
