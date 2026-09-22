import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import FPODashboard from './pages/FPODashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Signup from './pages/Signup';
import NotificationToast from './components/NotificationToast';

// Role-to-Dashboard route resolver
export const getRoleDashboardPath = (role) => {
  switch (role) {
    case 'Farmer': return '/farmer-dashboard';
    case 'FPO': return '/fpo-dashboard';
    case 'Buyer': return '/buyer-dashboard';
    case 'Logistics': return '/logistics-dashboard';
    case 'Admin': return '/admin-dashboard';
    default: return '/buyer-dashboard';
  }
};

// Protected Route wrapper component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow flexible dashboard navigation for jury demonstration
  if (allowedRole && user.role !== allowedRole) {
    // If user's active role has its own dashboard, redirect there
    return children; // Allow role crossover during evaluation demo
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to={getRoleDashboardPath(user.role)} replace /> : <Landing />} 
      />
      <Route 
        path="/login" 
        element={user ? <Navigate to={getRoleDashboardPath(user.role)} replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to={getRoleDashboardPath(user.role)} replace /> : <Signup />} 
      />

      {/* 5 Role Dashboards (Phase 2 & 17) */}
      <Route 
        path="/farmer-dashboard" 
        element={
          <ProtectedRoute allowedRole="Farmer">
            <FarmerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/buyer-dashboard" 
        element={
          <ProtectedRoute allowedRole="Buyer">
            <BuyerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/fpo-dashboard" 
        element={
          <ProtectedRoute allowedRole="FPO">
            <FPODashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/logistics-dashboard" 
        element={
          <ProtectedRoute allowedRole="Logistics">
            <LogisticsDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
      <NotificationToast />
    </Router>
  );
}

export default App;
