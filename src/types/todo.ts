export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  priority: "high" | "medium" | "low";
  createdAt: string;
  dueDate: string | null;
}

export interface TodoData {
  version: number;
  lastModified: string;
  items: TodoItem[];
}
