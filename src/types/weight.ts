export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  note?: string;
}

export interface WeightData {
  version: number;
  lastModified: string;
  height?: number;
  goalWeight?: number;
  entries: WeightEntry[];
}
