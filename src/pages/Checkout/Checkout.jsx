import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase/client';
import './Checkout.css';

const FLUTTERWAVE_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
const makeTxRef = () => `ohb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentState, setPaymentState] = useState('');
  const [txRef, setTxRef] = useState(makeTxRef);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    notes: '',
    country: 'Nigeria',
  });

  const currency = useMemo(() => {
    return form.country?.trim().toLowerCase() === 'nigeria' ? 'NGN' : 'USD';
  }, [form.country]);

  const totalWeightGrams = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.weight_g || 1000) * (Number(item.quantity) || 1)), 0);
  }, [cart]);

  const totalWeightKg = useMemo(() => {
    return Math.ceil(totalWeightGrams / 1000);
  }, [totalWeightGrams]);

  const shippingCostNgn = useMemo(() => {
    const isLocal = form.country?.trim().toLowerCase() === 'nigeria';
    return isLocal ? 10000 * totalWeightKg : 86000 * totalWeightKg;
  }, [form.country, totalWeightKg]);

  const conversionRate = 1600; // 1 USD = 1600 NGN

  const subtotal = useMemo(() => {
    return currency === 'USD' ? Math.ceil(cartTotal / conversionRate) : cartTotal;
  }, [currency, cartTotal]);

  const shippingCost = useMemo(() => {
    return currency === 'USD' ? Math.ceil(shippingCostNgn / conversionRate) : shippingCostNgn;
  }, [currency, shippingCostNgn]);

  const finalTotal = useMemo(() => {
    return subtotal + shippingCost;
  }, [subtotal, shippingCost]);

  const formatPrice = (amount) => {
    return currency === 'USD' 
      ? `USD $${amount.toLocaleString('en-US')}` 
      : `NGN ₦${amount.toLocaleString('en-US')}`;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/checkout');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(f => ({
        ...f,
        fullName: f.fullName || user.user_metadata?.full_name || user.user_metadata?.name || '',
        email: f.email || user.email || '',
      }));
    }
  }, [user]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const flutterwaveConfig = useMemo(() => ({
    public_key: FLUTTERWAVE_KEY || '',
    tx_ref: txRef,
    amount: finalTotal,
    currency: currency,
    payment_options: 'card,ussd,account',
    customer: {
      email: form.email || 'guest@onlyonehairboss.com',
      phone_number: form.phone,
      name: form.fullName,
    },
    customizations: {
      title: 'OnlyOne Hairboss',
      description: 'Payment for wigs order',
      logo: window.location.origin + '/logo.svg',
    },
  }), [finalTotal, currency, form.email, form.fullName, form.phone, txRef]);

  const handleFlutterPayment = useFlutterwave(flutterwaveConfig);

  const verifyAndCreateOrder = async (paymentRef, responseTxRef) => {
    setLoading(true);
    setError('');
    setPaymentState('Verifying payment...');

    try {
      const token = localStorage.getItem('hairboss_token');
      const res = await fetch(`${supabase.API_URL}/checkout/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          transaction_id: paymentRef,
          payload: {
            full_name: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            country: form.country.trim(),
            notes: form.notes.trim(),
            total: Number(finalTotal),
            currency: currency,
            tx_ref: responseTxRef || txRef,
            shipping_method: form.country?.trim().toLowerCase() === 'nigeria' ? 'local' : 'international',
            shipping_fee: Number(shippingCost),
            items: cart.map(i => ({
              id: i.id,
              name: i.name,
              image: i.image ?? '',
              quantity: i.quantity,
              price: currency === 'USD' ? Math.ceil(i.price / conversionRate) : i.price,
            })),
          },
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Payment verification failed.');

      clearCart();
      navigate(`/order/${body.data.id}`);
    } catch (err) {
      setError(`Payment received but order confirmation failed. Contact support with ref: ${paymentRef}. ${err.message}`);
      setTxRef(makeTxRef());
    } finally {
      setLoading(false);
      setPaymentState('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cart.length || loading) return;
    if (!FLUTTERWAVE_KEY) {
      setError('Payment is not configured yet. Contact the store owner.');
      return;
    }

    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'country'];
    if (required.some(key => !form[key]?.trim())) {
      setError('Please complete all required shipping fields.');
      return;
    }
    if (!Number.isFinite(Number(cartTotal)) || Number(cartTotal) <= 0) {
      setError('Your cart total is invalid. Please refresh and try again.');
      return;
    }

    setError('');
    setPaymentState('Opening secure Flutterwave checkout...');

    handleFlutterPayment({
      callback: (response) => {
        if (response.status === 'successful' || response.status === 'completed') {
          verifyAndCreateOrder(response.transaction_id?.toString() || response.tx_ref, response.tx_ref);
        } else {
          setError('Payment was not successful. Status: ' + response.status);
          setPaymentState('');
        }
        closePaymentModal();
      },
      onClose: () => {
        setPaymentState('');
        setError('Payment was cancelled before completion.');
      },
    });
  };

  if (authLoading) return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-empty">Verifying authentication state...</div>
      <Footer />
    </div>
  );

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
              <label>Country</label>
              <input name="country" value={form.country} onChange={handleChange} required placeholder="Nigeria" />
            </div>
            <div className="co-field">
              <label>Order Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" placeholder="Any special instructions..." />
            </div>

            {error && <p className="co-error">{error}</p>}
            {paymentState && <p className="co-secure-note">{paymentState}</p>}

            <button type="submit" className="co-place-btn" disabled={loading}>
              {loading ? 'Confirming payment...' : `Pay ${formatPrice(finalTotal)}`}
            </button>

            <p className="co-secure-note">
              Secured by Flutterwave - Cards, Bank Transfer, USSD accepted
            </p>
          </Motion.form>

          <Motion.div
            className="co-summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="co-summary-title">Order Summary</h3>
            {cart.map(item => {
              const itemPrice = currency === 'USD' ? Math.ceil(item.price / conversionRate) : item.price;
              return (
                <div key={item.id} className="co-item" style={{ borderBottom: '1px solid rgba(153,85,68,0.1)' }}>
                  <img src={item.image} alt={item.name} className="co-item-img" />
                  <div className="co-item-info">
                    <p className="co-item-name" style={{ color: '#1a120e', fontWeight: '600' }}>{item.name}</p>
                    <p className="co-item-qty" style={{ color: '#7d6259' }}>Qty: {item.quantity} ({(item.weight_g || 1000)}g)</p>
                  </div>
                  <p className="co-item-price" style={{ color: '#1a120e', fontWeight: '700' }}>{formatPrice(itemPrice * item.quantity)}</p>
                </div>
              );
            })}
            <div className="co-summary-calc" style={{ marginTop: '20px', borderTop: '1px solid rgba(153,85,68,0.15)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem', color: '#554440' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span style={{ color: '#1a120e', fontWeight: '600' }}>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping ({currency === 'USD' ? 'DHL Express' : 'GIG Doorstep'})</span>
                <span style={{ color: '#1a120e', fontWeight: '600' }}>{formatPrice(shippingCost)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#7d6259' }}>
                <span>Total Weight</span>
                <span>{totalWeightGrams >= 1000 ? `${(totalWeightGrams / 1000).toFixed(1)}kg` : `${totalWeightGrams}g`}</span>
              </div>
            </div>
            <div className="co-total" style={{ borderTop: '1px solid rgba(153,85,68,0.15)', marginTop: '12px', paddingTop: '15px', color: '#1a120e', display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '700' }}>
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </Motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
