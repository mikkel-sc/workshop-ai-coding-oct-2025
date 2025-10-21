import { API_URL } from '../config';
import type { Task, NewTask } from '../types';

// --- Functions for TanStack Query ---

export const getTasks = async (): Promise<Task[]> => {
  const res = await fetch(`${API_URL}/tasks`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
};

export const updateTask = async (task: Task): Promise<Task> => {
  const res = await fetch(`${API_URL}/tasks/${task.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
};

// --- Function to be used by Redux Thunk ---

export const createTask = async (newTask: NewTask): Promise<Task> => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTask),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
};
