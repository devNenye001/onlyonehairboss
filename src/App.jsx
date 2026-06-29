import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home/Home';
import ShopPage from './pages/Shop/ShopPage';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Cart from './pages/Cart/Cart';
import Auth from './pages/Auth/Auth';
import Search from './pages/Search/Search';
import Checkout from './pages/Checkout/Checkout';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import Account from './pages/Account/Account';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import NotFound from './pages/NotFound/NotFound';

import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOverview from './pages/admin/AdminOverview';
import AdminRevenueAnalytics from './pages/admin/AdminRevenueAnalytics';
import AdminContent from './pages/admin/AdminContent';
import AdminSettings from './pages/admin/AdminSettings';

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/search" element={<Search />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderConfirmation />} />
        <Route path="/account" element={<Account />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
        <Route path="/admin/overview" element={<AdminRoute><AdminOverview /></AdminRoute>} />
        <Route path="/admin/revenue" element={<AdminRoute><AdminRevenueAnalytics /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/content" element={<AdminRoute><AdminContent /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
