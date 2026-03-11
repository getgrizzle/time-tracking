export interface TimeEntry {
  id: string;
  user: { id: string; username: string };
  task: { id: string; name: string };
  client: string;
  deliveryRole: string;
  roleCategory: string;
  taskCategory: "automatable" | "strategic";
  duration: number; // ms
  start: number; // Unix ms
  end: number; // Unix ms
}

export type DatePreset = "7d" | "30d" | "90d" | "custom";

export interface DateRange {
  start: number; // Unix ms
  end: number; // Unix ms
  preset: DatePreset;
}
