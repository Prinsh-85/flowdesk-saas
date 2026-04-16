import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { SocketProvider } from './context/SocketContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Board } from './pages/Project/Board';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Inner wrapper: can access TaskContext to pass real-time updater into SocketProvider
function AppInner() {
  const { handleRealtimeTaskUpdate } = useTasks();
  return (
    <SocketProvider onTaskUpdate={handleRealtimeTaskUpdate}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="board/:projectId" element={<Board />} />
          <Route path="board" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes — TaskProvider wraps everything inside */}
          <Route path="/*" element={
            <ProtectedRoute>
              <TaskProvider>
                <AppInner />
              </TaskProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
