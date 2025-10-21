import { Routes, Route } from 'react-router-dom';
import { ChecklistPage } from './pages/ChecklistPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TasksPage } from './pages/TasksPage';
import { Layout } from './components/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ChecklistPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
