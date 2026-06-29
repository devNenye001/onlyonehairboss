import { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { HiX, HiOutlineEye } from 'react-icons/hi';
import AdminLayout from './AdminLayout';
import { supabase } from '../../utils/supabase/client';
import './AdminOrders.css';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const shortId = (id) => (typeof id === 'string' ? id.slice(0, 8).toUpperCase() : 'UNKNOWN');

const resolveImageUrl = (img) => {
  if (!img) return '/wig1.svg';
  if (img.startsWith('http')) return img;
  if (img.startsWith('/api/')) {
    const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
    const backendUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
    return `${backendUrl}${img}`;
  }
  if (img.startsWith('/')) return img;
  const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
  return `${apiBase}/storage/files/${img}`;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const fetchOrders = async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    const { data, error: fetchError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (fetchError) {
      setError(fetchError.message || 'Failed to load orders.');
    } else {
      setOrders(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    supabase.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) setError(fetchError.message || 'Failed to load orders.');
        setOrders(data ?? []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selected) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  const viewOrder = async (order) => {
    setSelected(order);
    setError('');
    const { data, error: itemError } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    if (itemError) setError(itemError.message || 'Failed to load order items.');
    setItems(data ?? []);
  };

  const updateStatus = async (orderId, status) => {
    if (!STATUSES.includes(status) || updatingStatus) return;
    const previousSelected = selected;
    const previousOrders = orders;
    setUpdatingStatus(status);
    setError('');
    setNotice('');

    setSelected(o => o ? { ...o, status } : o);
    setOrders(list => list.map(order => order.id === orderId ? { ...order, status } : order));

    const { data, error: updateError } = await supabase.from('orders').update({ status }).eq('id', orderId);
    setUpdatingStatus('');

    if (updateError) {
      setSelected(previousSelected);
      setOrders(previousOrders);
      setError(updateError.message || 'Failed to update order status.');
      return;
    }

    setSelected(o => o ? { ...o, ...data } : o);
    setOrders(list => list.map(order => order.id === orderId ? { ...order, ...data } : order));
    setNotice(`Order status updated to ${status}.`);
    fetchOrders({ showLoading: false });
  };

  const statusColor = (s) => ({
    pending: '#f39c12', processing: '#3498db', shipped: '#9b59b6',
    delivered: '#27ae60', cancelled: '#e74c3c',
  }[s] ?? '#888');

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  return (
    <AdminLayout>
      <div className="ao-page">
        <div className="ao-header">
          <p className="ao-tag">Admin</p>
          <h1 className="ao-headline">Orders</h1>
        </div>

        {notice && <p className="ao-toast success" role="status">{notice}</p>}
        {error && <p className="ao-toast error" role="alert">{error}</p>}

        {loading ? <p className="ao-loading">Loading orders...</p> : (
          <div className="ao-table-wrap">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Email</th>
                  <th>Total</th><th>Status</th><th>Date</th><th>View</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id || `${o.email}-${o.created_at}`}>
                    <td className="ao-mono">{shortId(o.id)}</td>
                    <td className="ao-name">{o.full_name || '-'}</td>
                    <td>{o.email || '-'}</td>
                    <td>NGN {Number(o.total || 0).toLocaleString()}</td>
                    <td>
                      <span className="ao-status-badge" style={{ background: `${statusColor(o.status)}22`, color: statusColor(o.status) }}>
                        {o.status || 'pending'}
                      </span>
                    </td>
                    <td>{fmt(o.created_at)}</td>
                    <td>
                      <button className="ao-view-btn" onClick={() => viewOrder(o)} aria-label={`View order ${shortId(o.id)}`}><HiOutlineEye /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div className="ao-modal-backdrop" onClick={() => setSelected(null)}>
            <Motion.div
              className="ao-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-detail-title"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="ao-modal-header">
                <h2 id="order-detail-title">Order #{shortId(selected.id)}</h2>
                <button className="ao-close-btn" onClick={() => setSelected(null)} aria-label="Close order details"><HiX /></button>
              </div>

              <div className="ao-detail-section">
                <h4>Customer Info</h4>
                <p><strong>Name:</strong> {selected.full_name || '-'}</p>
                <p><strong>Email:</strong> {selected.email || '-'}</p>
                <p><strong>Phone:</strong> {selected.phone || '-'}</p>
                <p><strong>Address:</strong> {selected.address}, {selected.city}, {selected.state}</p>
                {selected.notes && <p><strong>Notes:</strong> {selected.notes}</p>}
              </div>

              <div className="ao-detail-section">
                <h4>Order Items</h4>
                {items.map(i => (
                  <div key={i.id || i.product_name} className="ao-item-row">
                    <img 
                      src={resolveImageUrl(i.product_image)} 
                      alt={i.product_name} 
                      className="ao-item-img" 
                      onError={(e) => { e.target.src = '/wig1.svg'; }}
                    />
                    <div>
                      <p className="ao-item-name">{i.product_name}</p>
                      <p className="ao-item-meta">Qty: {i.quantity} - NGN {Number(i.price || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <p className="ao-total"><strong>Total: NGN {Number(selected.total || 0).toLocaleString()}</strong></p>
              </div>

              <div className="ao-detail-section">
                <h4>Update Status</h4>
                <div className="ao-status-btns">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      className={`ao-status-btn ${selected.status === s ? 'current' : ''}`}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={Boolean(updatingStatus) || selected.status === s}
                      style={selected.status === s ? { background: statusColor(s), color: '#fff', borderColor: statusColor(s) } : {}}
                    >
                      {updatingStatus === s ? 'Updating...' : s}
                    </button>
                  ))}
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
