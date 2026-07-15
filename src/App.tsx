import { useEffect } from 'react';
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Clients from './pages/Clients';
import ClientView from './pages/ClientView';
import Login from './pages/Login';
import ClientDashboard from './pages/ClientDashboard';
import { useUser } from './store';
import { seedDataIfNeeded } from './seed';

export default function App() {
  const { user } = useUser();

  useEffect(() => {
    seedDataIfNeeded();
  }, []);

  // If no user, always show login first
  if (!user) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/client-view/:shareLink" element={<ClientView />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Public route - client view (no auth needed) */}
        <Route path="/client-view/:shareLink" element={<ClientView />} />

        {/* Client role routes - separate from freelancer */}
        {user.role === 'client' ? (
          <>
            <Route path="/" element={<ClientDashboard />} />
            <Route path="/my-projects" element={<ClientDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          /* Freelancer routes - full system */
          <>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="clients" element={<Clients />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </HashRouter>
  );
}
