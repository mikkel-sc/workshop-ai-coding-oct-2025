import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, updateTask } from '../api/tasksApi';
import { getUsers } from '../api/usersApi';
import type { Task, User } from '../types';

export function TasksPage() {
  const queryClient = useQueryClient();

  // 1. useQuery to fetch the data
  const { data: tasks, error, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'], // Unique key for this query
    queryFn: getTasks,   // The async function to fetch data
  });

  // Fetch users for assignment dropdown
  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // 2. useMutation to update a task (mark as complete)
  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      // When mutation is successful, invalidate the 'tasks' query
      // This tells TanStack to re-fetch the data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleToggleComplete = (task: Task) => {
    updateTaskMutation.mutate({
      ...task,
      completed: !task.completed,
    });
  };

  const handleUserAssignment = (task: Task, userId: string) => {
    updateTaskMutation.mutate({
      ...task,
      assignedUserId: userId || undefined,
    });
  };

  // 3. Render logic
  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const openTasks = tasks?.filter(t => !t.completed) || [];
  const completedTasks = tasks?.filter(t => t.completed) || [];

  return (
    <div>
      <h2>Actionable Tasks (TanStack Query)</h2>

      <h3>Open Tasks</h3>
      {openTasks.length === 0 && <p>No open tasks. Well done!</p>}
      <ul>
        {openTasks.map((task) => (
          <li key={task.id} style={{ marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleComplete(task)}
              />
              {task.description}
            </label>
            {users && (
              <select
                value={task.assignedUserId || ''}
                onChange={(e) => handleUserAssignment(task, e.target.value)}
                style={{ marginLeft: '10px' }}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            )}
          </li>
        ))}
      </ul>

      <h3>Completed Tasks</h3>
      {completedTasks.length === 0 && <p>No completed tasks yet.</p>}
      <ul>
        {completedTasks.map((task) => (
          <li key={task.id} style={{ textDecoration: 'line-through', opacity: 0.6, marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleComplete(task)}
              />
              {task.description}
            </label>
            {users && (
              <select
                value={task.assignedUserId || ''}
                onChange={(e) => handleUserAssignment(task, e.target.value)}
                style={{ marginLeft: '10px' }}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
