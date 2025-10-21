import { useState, useEffect } from 'react';
import type { ChecklistEntry } from '../types';
import { API_URL } from '../config';
import './AnalyticsPage.css';

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
    <div className="analytics-container">
      <h2>Coffee Machine Analytics (Fetch API)</h2>
      <div className="analytics-stats">
        <p>Total Checks Performed: <strong>{totalChecks}</strong></p>
        <p className="stat-success">
          Successful (All OK): <strong>{successfulChecks}</strong>
        </p>
        <p className="stat-warning">
          Problems Logged: <strong>{problemChecks}</strong>
        </p>
      </div>

      <h3>Results Table:</h3>
      <table className="results-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Beans</th>
            <th>Water</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id}>
              <td>
                {new Date(entry.date).toLocaleDateString()}
              </td>
              <td className={entry.beans_full ? 'status-ok' : 'status-fail'}>
                {entry.beans_full ? 'OK' : 'FAIL'}
              </td>
              <td className={entry.water_filled ? 'status-ok' : 'status-fail'}>
                {entry.water_filled ? 'OK' : 'FAIL'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
