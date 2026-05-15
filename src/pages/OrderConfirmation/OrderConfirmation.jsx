import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { HiCheckCircle } from 'react-icons/hi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { supabase } from '../../utils/supabase/client';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: o } = await supabase.from('orders').select('*').eq('id', id).single();
      const { data: i } = await supabase.from('order_items').select('*').eq('order_id', id);
      setOrder(o);
      setItems(i ?? []);
    };
    fetch();
  }, [id]);

  return (
    <div className="oc-page">
      <Navbar />
      <main className="oc-container">
        <Motion.div
          className="oc-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HiCheckCircle className="oc-check-icon" />
          <p className="oc-tag">Order Placed</p>
          <h1 className="oc-headline">Thank You!</h1>
          <p className="oc-sub">
            Your order has been received. We'll process it within 3 working days.
          </p>

          {order && (
            <div className="oc-details">
              <div className="oc-detail-row">
                <span>Order ID</span>
                <span className="oc-mono">{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="oc-detail-row">
                <span>Name</span>
                <span>{order.full_name}</span>
              </div>
              <div className="oc-detail-row">
                <span>Email</span>
                <span>{order.email}</span>
              </div>
              <div className="oc-detail-row">
                <span>Total</span>
                <span>₦{order.total?.toLocaleString()}</span>
              </div>
              <div className="oc-detail-row">
                <span>Status</span>
                <span className="oc-status">{order.status}</span>
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="oc-items">
              <h3 className="oc-items-title">Items Ordered</h3>
              {items.map(item => (
                <div key={item.id} className="oc-item">
                  {item.product_image && <img src={item.product_image} alt={item.product_name} className="oc-item-img" />}
                  <div>
                    <p className="oc-item-name">{item.product_name}</p>
                    <p className="oc-item-meta">Qty: {item.quantity} · ₦{item.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="oc-processing-note">
            <p>Payment received via Paystack. Your order will be processed within 3 working days — check your email for confirmation.</p>
          </div>

          <div className="oc-actions">
            <Link to="/shop" className="oc-shop-btn">Continue Shopping</Link>
          </div>
        </Motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
