export interface ChecklistEntry {
  id: string;
  date: string;
  cleanliness: boolean;
  beans_full: boolean;
  water_filled: boolean;
}

export interface User {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
  sourceChecklistId?: string;
  assignedUserId?: string;
}

// For creating new items (ID is handled by json-server)
export type NewChecklistEntry = Omit<ChecklistEntry, 'id'>;
export type NewTask = Omit<Task, 'id'>;
