import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import { AdminLayout } from './components/layout/AdminLayout';
import { StaffLayout } from './components/layout/StaffLayout';
import { MobileAdminLayout } from './components/layout/MobileAdminLayout';

// Pages
import { Login } from './pages/auth/Login';

// Admin Desktop Pages
import { Dashboard } from './pages/admin/Dashboard';
import { Products } from './pages/admin/Products';
import { Categories } from './pages/admin/Categories';
import { Inventory } from './pages/admin/Inventory';
import { Transactions } from './pages/admin/Transactions';
import { Returns } from './pages/admin/Returns';
import { Staff } from './pages/admin/Staff';
import { Suppliers } from './pages/admin/Suppliers';
import { Ledger } from './pages/admin/Ledger';
import { Reports } from './pages/admin/Reports';

// Staff Pages
import { PosBilling } from './pages/staff/PosBilling';
import { StaffTransactions } from './pages/staff/StaffTransactions';

// Mobile Admin Pages
import { MobileDashboard } from './pages/mobile/MobileDashboard';
import { MobileProducts } from './pages/mobile/MobileProducts';
import { MobileMenu } from './pages/mobile/MobileMenu';

// Protected Route Helpers
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs">
        Authenticating terminal session...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/staff/pos" replace />;

  return <>{children}</>;
};

const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs">
        Authenticating terminal session...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs">
        Initializing POS Billing System...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin/dashboard' : '/staff/pos'} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Admin Desktop Portal */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="returns" element={<Returns />} />
        <Route path="staff" element={<Staff />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="ledger" element={<Ledger />} />
        <Route path="reports" element={<Reports />} />
        <Route path="pos" element={<PosBilling />} />
      </Route>

      {/* Dedicated Mobile Admin Portal (/admin/mobile) */}
      <Route
        path="/admin/mobile"
        element={
          <AdminRoute>
            <MobileAdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<MobileDashboard />} />
        <Route path="products" element={<MobileProducts />} />
        <Route path="menu" element={<MobileMenu />} />
      </Route>

      {/* Staff Counter Portal */}
      <Route
        path="/staff"
        element={
          <StaffRoute>
            <StaffLayout />
          </StaffRoute>
        }
      >
        <Route index element={<Navigate to="/staff/pos" replace />} />
        <Route path="pos" element={<PosBilling />} />
        <Route path="transactions" element={<StaffTransactions />} />
      </Route>

      {/* Default Catch-all */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin/dashboard' : '/staff/pos'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
