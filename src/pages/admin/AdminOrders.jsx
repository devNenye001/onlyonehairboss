import { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { HiX, HiOutlineEye } from 'react-icons/hi';
import AdminLayout from './AdminLayout';
import { supabase } from '../../utils/supabase/client';
import './AdminOrders.css';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    supabase.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) { setOrders(data ?? []); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  const viewOrder = async (order) => {
    setSelected(order);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setItems(data ?? []);
  };

  const updateStatus = async (orderId, status) => {
    setUpdating(true);
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setUpdating(false);
    setSelected(o => o ? { ...o, status } : o);
    fetchOrders();
  };

  const statusColor = (s) => ({
    pending: '#f39c12', processing: '#3498db', shipped: '#9b59b6',
    delivered: '#27ae60', cancelled: '#e74c3c',
  }[s] ?? '#888');

  const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <AdminLayout>
      <div className="ao-page">
        <div className="ao-header">
          <p className="ao-tag">Admin</p>
          <h1 className="ao-headline">Orders</h1>
        </div>

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
                  <tr key={o.id}>
                    <td className="ao-mono">{o.id.slice(0, 8).toUpperCase()}</td>
                    <td className="ao-name">{o.full_name}</td>
                    <td>{o.email}</td>
                    <td>₦{o.total?.toLocaleString()}</td>
                    <td>
                      <span className="ao-status-badge" style={{ background: `${statusColor(o.status)}22`, color: statusColor(o.status) }}>
                        {o.status}
                      </span>
                    </td>
                    <td>{fmt(o.created_at)}</td>
                    <td>
                      <button className="ao-view-btn" onClick={() => viewOrder(o)}><HiOutlineEye /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Panel */}
        {selected && (
          <div className="ao-modal-backdrop" onClick={() => setSelected(null)}>
            <Motion.div
              className="ao-modal"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="ao-modal-header">
                <h2>Order #{selected.id.slice(0, 8).toUpperCase()}</h2>
                <button className="ao-close-btn" onClick={() => setSelected(null)}><HiX /></button>
              </div>

              <div className="ao-detail-section">
                <h4>Customer Info</h4>
                <p><strong>Name:</strong> {selected.full_name}</p>
                <p><strong>Email:</strong> {selected.email}</p>
                <p><strong>Phone:</strong> {selected.phone}</p>
                <p><strong>Address:</strong> {selected.address}, {selected.city}, {selected.state}</p>
                {selected.notes && <p><strong>Notes:</strong> {selected.notes}</p>}
              </div>

              <div className="ao-detail-section">
                <h4>Order Items</h4>
                {items.map(i => (
                  <div key={i.id} className="ao-item-row">
                    {i.product_image && <img src={i.product_image} alt={i.product_name} className="ao-item-img" />}
                    <div>
                      <p className="ao-item-name">{i.product_name}</p>
                      <p className="ao-item-meta">Qty: {i.quantity} · ₦{i.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <p className="ao-total"><strong>Total: ₦{selected.total?.toLocaleString()}</strong></p>
              </div>

              <div className="ao-detail-section">
                <h4>Update Status</h4>
                <div className="ao-status-btns">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      className={`ao-status-btn ${selected.status === s ? 'current' : ''}`}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={updating}
                      style={selected.status === s ? { background: statusColor(s), color: '#fff', borderColor: statusColor(s) } : {}}
                    >
                      {s}
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
