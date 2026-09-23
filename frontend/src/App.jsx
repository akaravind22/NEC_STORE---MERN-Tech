import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BackgroundBlobs from './components/common/BackgroundBlobs';
import ToastContainer from './components/common/ToastContainer';
import { useAuthStore } from './store/useAuthStore';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import OTPVerifyPage from './pages/public/OTPVerifyPage';

// Customer Pages
import ProductsPage from './pages/customer/ProductsPage';
import ProductDetailsPage from './pages/customer/ProductDetailsPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailsPage from './pages/customer/OrderDetailsPage';
import NotificationsPage from './pages/customer/NotificationsPage';
import ProfilePage from './pages/customer/ProfilePage';

// Retailer Pages
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import ProductListPage from './pages/retailer/ProductListPage';
import AddEditProductPage from './pages/retailer/AddEditProductPage';
import InventoryPage from './pages/retailer/InventoryPage';
import StockHistoryPage from './pages/retailer/StockHistoryPage';
import OrderListPage from './pages/retailer/OrderListPage';
import SalesAnalyticsPage from './pages/retailer/SalesAnalyticsPage';
import TransactionsPage from './pages/retailer/TransactionsPage';
import ReportsPage from './pages/retailer/ReportsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect unauthorized access to user's home dashboard
    if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user?.role === 'RETAILER') return <Navigate to="/retailer" replace />;
    return <Navigate to="/customer/products" replace />;
  }

  return children;
};

function App() {
  const { fetchMe, theme } = useAuthStore();

  useEffect(() => {
    fetchMe();
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <Router>
      <BackgroundBlobs />
      <ToastContainer />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OTPVerifyPage />} />

        {/* Customer Routes */}
        <Route path="/customer/products" element={<ProductsPage />} />
        <Route path="/customer/products/:id" element={<ProductDetailsPage />} />
        <Route path="/customer/cart" element={<CartPage />} />
        <Route
          path="/customer/checkout"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'RETAILER', 'ADMIN']}>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/notifications"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'RETAILER', 'ADMIN']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'RETAILER', 'ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Retailer Routes */}
        <Route
          path="/retailer"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <RetailerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/products"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <ProductListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/products/add"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <AddEditProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/products/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <AddEditProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/stock"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/stock/history"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <StockHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/orders"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <OrderListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/sales"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <SalesAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/transactions"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/reports"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/notifications"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/profile"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
