export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
}

export interface ScheduleData {
  version: number;
  lastModified: string;
  events: ScheduleEvent[];
}
