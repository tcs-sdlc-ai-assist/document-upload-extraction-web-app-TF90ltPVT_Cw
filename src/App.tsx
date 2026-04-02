import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/store';
import { toggleDebugPanel } from '@/store/uiSlice';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import DebugPanel from '@/components/DebugPanel';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import styles from './App.module.css';

function AppContent() {
  const dispatch = useAppDispatch();

  const handleToggleDebug = () => {
    dispatch(toggleDebugPanel());
  };

  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <DebugPanel />
      <button
        className={styles.debugToggle}
        onClick={handleToggleDebug}
        type="button"
        aria-label="Toggle debug panel"
      >
        🐛
      </button>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}