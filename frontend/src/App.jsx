import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuthState } from './hooks/useAuthState';
import { ThemeProvider } from './context/ThemeContext';
import LoadingSpinner from './components/ui/LoadingSpinner';

const Toaster = lazy(() => import('react-hot-toast').then((m) => ({ default: m.Toaster })));

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MemoryTracker = lazy(() => import('./pages/MemoryTracker'));
const WeakTopicAnalyzer = lazy(() => import('./pages/WeakTopicAnalyzer'));
const RevisionScheduler = lazy(() => import('./pages/RevisionScheduler'));
const SkillGapPredictor = lazy(() => import('./pages/SkillGapPredictor'));
const CareerRoadmap = lazy(() => import('./pages/CareerRoadmap'));
const AIMentor = lazy(() => import('./pages/AIMentor'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const UpgradeSuccess = lazy(() => import('./pages/UpgradeSuccess'));

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthState();
  if (import.meta.env.DEV && !loading) {
    console.log('[ProtectedRoute]', { isAuthenticated, path: window.location.pathname });
  }
  if (loading) return <LoadingSpinner fullscreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthState();
  if (import.meta.env.DEV && !loading) {
    console.log('[PublicRoute]', { isAuthenticated, isGuest: user?.isGuest, path: window.location.pathname });
  }
  if (loading) return <LoadingSpinner fullscreen />;
  // Guests are "authenticated" but must still access login/signup to upgrade
  if (isAuthenticated && !user?.isGuest) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={(
          <Suspense fallback={<LoadingSpinner fullscreen />}>
            <LandingPage />
          </Suspense>
        )}
      />
      <Route
        path="/login"
        element={(
          <PublicRoute>
            <Suspense fallback={<LoadingSpinner fullscreen />}>
              <Login />
            </Suspense>
          </PublicRoute>
        )}
      />
      <Route
        path="/signup"
        element={(
          <PublicRoute>
            <Suspense fallback={<LoadingSpinner fullscreen />}>
              <Signup />
            </Suspense>
          </PublicRoute>
        )}
      />
      <Route
        path="/forgot-password"
        element={(
          <PublicRoute>
            <Suspense fallback={<LoadingSpinner fullscreen />}>
              <ForgotPassword />
            </Suspense>
          </PublicRoute>
        )}
      />

      <Route
        element={(
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner fullscreen />}>
              <DashboardLayout />
            </Suspense>
          </ProtectedRoute>
        )}
      >
        <Route path="dashboard" element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
        <Route path="memory-tracker" element={<Suspense fallback={<LoadingSpinner />}><MemoryTracker /></Suspense>} />
        <Route path="weak-topics" element={<Suspense fallback={<LoadingSpinner />}><WeakTopicAnalyzer /></Suspense>} />
        <Route path="revision-scheduler" element={<Suspense fallback={<LoadingSpinner />}><RevisionScheduler /></Suspense>} />
        <Route path="skill-gap" element={<Suspense fallback={<LoadingSpinner />}><SkillGapPredictor /></Suspense>} />
        <Route path="career-roadmap" element={<Suspense fallback={<LoadingSpinner />}><CareerRoadmap /></Suspense>} />
        <Route path="ai-mentor" element={<Suspense fallback={<LoadingSpinner />}><AIMentor /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<LoadingSpinner />}><Analytics /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<LoadingSpinner />}><Profile /></Suspense>} />
        <Route path="leaderboard" element={<Suspense fallback={<LoadingSpinner />}><Leaderboard /></Suspense>} />
      </Route>

      {/* Upgrade success page — public, no auth guard */}
      <Route
        path="/upgrade-success"
        element={(
          <Suspense fallback={<LoadingSpinner fullscreen />}>
            <UpgradeSuccess />
          </Suspense>
        )}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Suspense fallback={null}>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(19, 19, 31, 0.98)',
                  color: '#f1f5f9',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
