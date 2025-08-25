import type { ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { authService } from './services/authService';
import Login from './pages/Login';
import Home from './pages/Home';

// Protected route wrapper
function RequireAuth({ children }: { children: ReactElement }) {
  const location = useLocation();
  const authed = authService.isAuthenticated();
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function App() {
  const isAuthed = authService.isAuthenticated();

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* On app open, redirect based on auth */}
        <Route path="/" element={<Navigate to={isAuthed ? '/home' : '/login'} replace />} />
        {/* Login route - if already logged in, send to home */}
        <Route
          path="/login"
          element={isAuthed ? <Navigate to="/home" replace /> : <Login />}
        />
        {/* Home (protected) */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
