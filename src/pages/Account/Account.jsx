import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiArrowRight, HiOutlineLogout } from 'react-icons/hi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase/client';
import './Account.css';

const Account = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate('/auth?redirect=account');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from('orders')
      .select('id, created_at, total, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) { setOrders(data ?? []); setOrdersLoading(false); }
      });
    return () => { cancelled = true; };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) return null;

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User';
  const initial = displayName.trim().charAt(0).toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="account-page">
      <Navbar />
      <main className="account-container">
        <Motion.div
          className="account-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="account-avatar-lg">{initial}</div>
          <div className="account-info">
            <p className="account-tag">My Account</p>
            <h1 className="account-name">{displayName}</h1>
            <p className="account-email">{user?.email}</p>
            {memberSince && <p className="account-since">Member since {memberSince}</p>}
          </div>
          <button className="account-signout-btn" onClick={handleSignOut}>
            <HiOutlineLogout />
            Sign Out
          </button>
        </Motion.div>

        <Motion.section
          className="account-orders"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className="account-section-title">My Orders</h2>

          {ordersLoading ? (
            <p className="account-loading">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="account-empty-orders">
              <HiOutlineShoppingBag className="account-empty-icon" />
              <p>No orders yet.</p>
              <Link to="/shop" className="account-shop-link">
                Shop Now <HiArrowRight />
              </Link>
            </div>
          ) : (
            <div className="account-orders-list">
              {orders.map(order => (
                <Link key={order.id} to={`/order/${order.id}`} className="account-order-row">
                  <div>
                    <p className="account-order-id">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="account-order-date">
                      {new Date(order.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="account-order-right">
                    <span className={`account-order-status account-status-${order.status}`}>
                      {order.status}
                    </span>
                    <p className="account-order-total">₦{order.total?.toLocaleString()}</p>
                    <HiArrowRight className="account-order-arrow" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Motion.section>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
