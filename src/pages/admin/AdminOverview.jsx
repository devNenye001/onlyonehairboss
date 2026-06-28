import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../utils/supabase/client';
import { HiOutlineTrendingUp, HiOutlineShoppingBag, HiOutlineDatabase, HiOutlineCurrencyDollar } from 'react-icons/hi';
import './AdminOverview.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('hairboss_token');
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
      setStats(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fmt = (num) => '₦' + (num || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (loading) {
    return (
      <AdminLayout>
        <div className="ao-loading-container">
          <p>Loading analytics dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="ao-error-container">
          <h2>Overview Error</h2>
          <p>{error}</p>
          <button onClick={fetchStats} className="ao-retry-btn">Retry</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="overview-page">
        <div className="overview-header">
          <p className="overview-tag">Admin</p>
          <h1 className="overview-headline">Overview</h1>
        </div>

        {/* Dashboard Grid Cards */}
        <div className="overview-grid">
          <div className="metric-card">
            <div className="card-icon revenue-icon"><HiOutlineCurrencyDollar /></div>
            <div className="card-info">
              <span className="card-label">Total Revenue</span>
              <h2 className="card-value">{fmt(stats.revenue)}</h2>
            </div>
          </div>

          <div className="metric-card">
            <div className="card-icon orders-icon"><HiOutlineShoppingBag /></div>
            <div className="card-info">
              <span className="card-label">Total Orders</span>
              <h2 className="card-value">{stats.totalOrders}</h2>
            </div>
          </div>

          <div className="metric-card">
            <div className="card-icon products-icon"><HiOutlineDatabase /></div>
            <div className="card-info">
              <span className="card-label">Products Active</span>
              <h2 className="card-value">{stats.totalProducts}</h2>
            </div>
          </div>

          <div className="metric-card">
            <div className="card-icon aov-icon"><HiOutlineTrendingUp /></div>
            <div className="card-info">
              <span className="card-label">Avg Order Value</span>
              <h2 className="card-value">{fmt(stats.averageOrderValue)}</h2>
            </div>
          </div>
        </div>

        <div className="details-section-grid">
          {/* Recent Orders */}
          <div className="details-box">
            <h3>Recent Orders</h3>
            <div className="table-wrap">
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(o => (
                    <tr key={o.id}>
                      <td className="customer-name">{o.full_name}</td>
                      <td>{o.email}</td>
                      <td>{fmt(o.total)}</td>
                      <td>
                        <span className={`status-badge-mini ${o.status}`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                  {stats.recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-text">No orders yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales by Category */}
          <div className="details-box">
            <h3>Sales by Category</h3>
            <div className="category-sales-wrap">
              {stats.categorySales.map((cat, i) => (
                <div key={i} className="cat-sales-row">
                  <div className="cat-info">
                    <span className="cat-name">{cat.category || 'General'}</span>
                    <span className="cat-value">{fmt(cat.sales)}</span>
                  </div>
                  <div className="cat-progress-bar">
                    <div 
                      className="cat-progress-fill" 
                      style={{ 
                        width: `${Math.min(100, (parseFloat(cat.sales) / (stats.revenue || 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
              {stats.categorySales.length === 0 && (
                <p className="empty-text">No sales recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
