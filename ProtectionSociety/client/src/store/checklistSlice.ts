import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ChecklistEntry, NewChecklistEntry } from '../types';
import { API_URL } from '../config';
import { createTask } from '../api/tasksApi'; // Importing from our API file!

interface ChecklistState {
  entries: ChecklistEntry[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ChecklistState = {
  entries: [],
  status: 'idle',
  error: null,
};

// Async Thunk to fetch all checklist entries
export const fetchChecklistEntries = createAsyncThunk(
  'checklist/fetchEntries',
  async () => {
    const response = await fetch(`${API_URL}/checklist`);
    return (await response.json()) as ChecklistEntry[];
  }
);

// Async Thunk to create a new entry AND create tasks if needed
export const submitChecklist = createAsyncThunk(
  'checklist/submit',
  async (newEntry: NewChecklistEntry) => {
    // 1. Post the new checklist entry
    const checklistRes = await fetch(`${API_URL}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });
    const savedEntry = (await checklistRes.json()) as ChecklistEntry;

    // 2. Check for problems and create tasks
    const tasksToCreate: string[] = [];
    if (!savedEntry.cleanliness) {
      tasksToCreate.push('Clean the coffee machine');
    }
    if (!savedEntry.beans_full) {
      tasksToCreate.push('Fill the coffee beans');
    }
    if (!savedEntry.water_filled) {
      tasksToCreate.push('Fill the water tank');
    }

    // 3. Create tasks in parallel
    await Promise.all(
      tasksToCreate.map((desc) =>
        createTask({
          description: desc,
          completed: false,
          sourceChecklistId: savedEntry.id,
        })
      )
    );

    // 4. Return the new entry to be added to the Redux state
    return savedEntry;
  }
);

const checklistSlice = createSlice({
  name: 'checklist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetching
      .addCase(fetchChecklistEntries.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChecklistEntries.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.entries = action.payload;
      })
      .addCase(fetchChecklistEntries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch';
      })
      // Submitting
      .addCase(submitChecklist.pending, (state) => {
        // You could set a different 'submitting' status here
        state.status = 'loading';
      })
      .addCase(submitChecklist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.entries.push(action.payload); // Add new entry to the list
      })
      .addCase(submitChecklist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to submit';
      });
  },
});

export default checklistSlice.reducer;
