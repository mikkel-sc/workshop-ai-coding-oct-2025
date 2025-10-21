import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { submitChecklist } from '../store/checklistSlice';

export function ChecklistPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.checklist);

  // Local state for the form
  const [cleanliness, setCleanliness] = useState(true);
  const [beansFull, setBeansFull] = useState(true);
  const [waterFilled, setWaterFilled] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      date: new Date().toISOString(),
      cleanliness: cleanliness,
      beans_full: beansFull,
      water_filled: waterFilled,
    };

    // Dispatch the thunk to submit the checklist and create tasks
    dispatch(submitChecklist(newEntry));

    // Reset form
    setCleanliness(true);
    setBeansFull(true);
    setWaterFilled(true);
  };

  return (
    <div>
      <h2>Coffee machine Checklist</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={cleanliness}
              onChange={(e) => setCleanliness(e.target.checked)}
            />
            Machine is clean
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={beansFull}
              onChange={(e) => setBeansFull(e.target.checked)}
            />
            Beans are full
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={waterFilled}
              onChange={(e) => setWaterFilled(e.target.checked)}
            />
            Water is filled
          </label>
        </div>
        <button type="submit" disabled={status === 'loading'} style={{ marginTop: '10px' }}>
          {status === 'loading' ? 'Submitting...' : 'Submit Daily Check'}
        </button>
        {status === 'failed' && <p style={{ color: 'red' }}>Error: {error}</p>}
      </form>
    </div>
  );
}
