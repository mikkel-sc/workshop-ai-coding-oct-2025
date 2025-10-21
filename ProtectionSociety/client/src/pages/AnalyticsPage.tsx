import { useState, useEffect } from 'react';
import type { ChecklistEntry } from '../types';
import { API_URL } from '../config';

export function AnalyticsPage() {
  const [entries, setEntries] = useState<ChecklistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Standard fetch with useEffect
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/checklist`);
        if (!response.ok) {
          throw new Error('Data fetching failed');
        }
        const data = (await response.json()) as ChecklistEntry[];
        setEntries(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []); // Empty dependency array = runs once on mount

  // Derived state: calculate stats from the fetched data
  const totalChecks = entries.length;
  const successfulChecks = entries.filter(
    (e) => e.cleanliness && e.beans_full && e.water_filled
  ).length;
  const problemChecks = totalChecks - successfulChecks;

  if (isLoading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Coffee Machine Analytics (Fetch API)</h2>
      <div style={{ fontSize: '1.2em' }}>
        <p>Total Checks Performed: <strong>{totalChecks}</strong></p>
        <p style={{ color: 'green' }}>
          Successful (All OK): <strong>{successfulChecks}</strong>
        </p>
        <p style={{ color: 'orange' }}>
          Problems Logged: <strong>{problemChecks}</strong>
        </p>
      </div>

      <h3>Raw Data Log:</h3>
      <ul>
        {entries.map(entry => (
          <li key={entry.id}>
            {new Date(entry.date).toLocaleDateString()}
            - Beans: {entry.beans_full ? 'OK' : 'FAIL'}
            - Water: {entry.water_filled ? 'OK' : 'FAIL'}
          </li>
        ))}
      </ul>
    </div>
  );
}
