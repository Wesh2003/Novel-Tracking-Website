import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import LibraryPage from './pages/LibraryPage';
import LoginPage from './pages/LoginPage';
import NovelDetailPage from './pages/NovelDetailPage';
import NotesPage from './pages/NotesPage';
import ProfilePage from './pages/ProfilePage';
import ReadingGoalsPage from './pages/ReadingGoalsPage';
import RegisterPage from './pages/RegisterPage';
import SessionsPage from './pages/SessionsPage';
import SettingsPage from './pages/SettingsPage';
import StatisticsPage from './pages/StatisticsPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('novelTrackerToken');

    if (!token) {
      setLoading(false);
      return;
    }

    const bootstrap = async () => {
      try {
        const response = await api.getMe();
        setUser(response.user);
      } catch (error) {
        localStorage.removeItem('novelTrackerToken');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (credentials) => {
    const response = await api.login(credentials);
    localStorage.setItem('novelTrackerToken', response.token);
    setUser(response.user);
    return response.user;
  };

  const register = async (payload) => {
    const response = await api.register(payload);
    localStorage.setItem('novelTrackerToken', response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem('novelTrackerToken');
    setUser(null);
  };

  const authContext = useMemo(
    () => ({ user, login, register, logout, loading }),
    [user, loading],
  );

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={login} />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage onRegister={register} />} />
        <Route path="/" element={user ? <Layout user={user} logout={logout}><DashboardPage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/library" element={user ? <Layout user={user} logout={logout}><LibraryPage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/novels/:id" element={user ? <Layout user={user} logout={logout}><NovelDetailPage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/goals" element={user ? <Layout user={user} logout={logout}><ReadingGoalsPage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/sessions" element={user ? <Layout user={user} logout={logout}><SessionsPage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/statistics" element={user ? <Layout user={user} logout={logout}><StatisticsPage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/notes" element={user ? <Layout user={user} logout={logout}><NotesPage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={user ? <Layout user={user} logout={logout}><ProfilePage user={user} /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/settings" element={user ? <Layout user={user} logout={logout}><SettingsPage /></Layout> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
