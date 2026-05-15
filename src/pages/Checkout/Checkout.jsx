import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { usePaystackPayment } from 'react-paystack';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase/client';
import './Checkout.css';

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? '',
    email:    user?.email ?? '',
    phone:    '',
    address:  '',
    city:     '',
    state:    '',
    notes:    '',
  });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Paystack config — amount is in kobo (1 NGN = 100 kobo)
  const paystackConfig = {
    reference:  `ohb_${Date.now()}`,
    email:      form.email || 'guest@onlyonehairboss.com',
    amount:     cartTotal * 100,
    publicKey:  PAYSTACK_KEY || '',
    currency:   'NGN',
    label:      form.fullName,
    metadata: {
      custom_fields: [
        { display_name: 'Customer Name', variable_name: 'full_name', value: form.fullName },
        { display_name: 'Phone',         variable_name: 'phone',     value: form.phone   },
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const saveOrder = async (paymentRef) => {
    setLoading(true);
    setError('');

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id:        user?.id ?? null,
        full_name:      form.fullName,
        email:          form.email,
        phone:          form.phone,
        address:        form.address,
        city:           form.city,
        state:          form.state,
        notes:          form.notes,
        total:          cartTotal,
        status:         'paid',
        payment_method: 'paystack',
        payment_proof:  paymentRef,
      })
      .select()
      .single();

    if (orderErr) {
      setError('Payment received but order save failed. Contact support with ref: ' + paymentRef);
      setLoading(false);
      return;
    }

    const items = cart.map(i => ({
      order_id:      order.id,
      product_id:    typeof i.id === 'string' && i.id.includes('-') ? i.id : null,
      product_name:  i.name,
      product_image: i.image ?? '',
      quantity:      i.quantity,
      price:         i.price,
    }));

    await supabase.from('order_items').insert(items);
    clearCart();
    navigate(`/order/${order.id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cart.length) return;
    if (!PAYSTACK_KEY) {
      setError('Payment is not configured yet. Contact the store owner.');
      return;
    }
    setError('');

    initializePayment({
      onSuccess: (response) => {
        saveOrder(response.reference || response.trxref);
      },
      onClose: () => {
        // User closed the Paystack modal — do nothing
      },
    });
  };

  if (!cart.length) return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-empty">Your cart is empty. <Link to="/shop">Shop now</Link></div>
      <Footer />
    </div>
  );

  return (
    <div className="checkout-page">
      <Navbar />
      <main className="checkout-container">
        <p className="checkout-tag">Almost there</p>
        <h1 className="checkout-headline">Checkout</h1>

        <div className="checkout-grid">
          {/* Form */}
          <Motion.form
            className="checkout-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="form-section-title">Shipping Information</h3>

            <div className="co-row">
              <div className="co-field">
                <label>Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Your full name" />
              </div>
              <div className="co-field">
                <label>Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
              </div>
            </div>
            <div className="co-field">
              <label>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+234 800 000 0000" />
            </div>
            <div className="co-field">
              <label>Street Address</label>
              <input name="address" value={form.address} onChange={handleChange} required placeholder="House number, street name" />
            </div>
            <div className="co-row">
              <div className="co-field">
                <label>City</label>
                <input name="city" value={form.city} onChange={handleChange} required placeholder="City" />
              </div>
              <div className="co-field">
                <label>State</label>
                <input name="state" value={form.state} onChange={handleChange} required placeholder="State" />
              </div>
            </div>
            <div className="co-field">
              <label>Order Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" placeholder="Any special instructions..." />
            </div>

            {error && <p className="co-error">{error}</p>}

            <button type="submit" className="co-place-btn" disabled={loading}>
              {loading ? 'Saving order...' : `Pay ₦${cartTotal.toLocaleString()} with Paystack`}
            </button>

            <p className="co-secure-note">
              Secured by Paystack · Cards, Bank Transfer, USSD accepted
            </p>
          </Motion.form>

          {/* Order Summary */}
          <Motion.div
            className="co-summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="co-summary-title">Order Summary</h3>
            {cart.map(item => (
              <div key={item.id} className="co-item">
                <img src={item.image} alt={item.name} className="co-item-img" />
                <div className="co-item-info">
                  <p className="co-item-name">{item.name}</p>
                  <p className="co-item-qty">Qty: {item.quantity}</p>
                </div>
                <p className="co-item-price">₦{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div className="co-total">
              <span>Total</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
          </Motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
