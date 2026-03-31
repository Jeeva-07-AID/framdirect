import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Signup from './pages/Signup';

// Protected Route wrapper component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Safety check: If role is missing, redirect to login to re-authenticate properly
  if (!user.role) {
    console.error('User role missing, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
     const fallback = user.role === 'Farmer' ? '/farmer-dashboard' : '/buyer-dashboard';
     return <Navigate to={fallback} replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to={user.role === 'Farmer' ? '/farmer-dashboard' : '/buyer-dashboard'} replace /> : <Landing />} 
      />
      <Route 
        path="/login" 
        element={user ? <Navigate to={user.role === 'Farmer' ? '/farmer-dashboard' : '/buyer-dashboard'} replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to={user.role === 'Farmer' ? '/farmer-dashboard' : '/buyer-dashboard'} replace /> : <Signup />} 
      />
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
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import NotificationToast from './components/NotificationToast';

function App() {
  return (
    <Router>
      <AppRoutes />
      <NotificationToast />
    </Router>
  );
}

export default App;
