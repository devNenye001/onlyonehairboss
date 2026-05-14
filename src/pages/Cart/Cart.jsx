import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { HiOutlineTrash, HiOutlineShoppingBag } from 'react-icons/hi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, removeItem, updateQty, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (!cart.length) return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-empty">
        <HiOutlineShoppingBag className="cart-empty-icon" />
        <h2 className="cart-empty-title">Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="cart-shop-btn">Browse Collection</Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="cart-page">
      <Navbar />
      <main className="cart-container">
        <h1 className="cart-headline">Your Cart</h1>

        <div className="cart-grid">
          {/* Items */}
          <div className="cart-items">
            {cart.map(item => (
              <Motion.div
                key={item.id}
                className="cart-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
              >
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-price">₦{item.price.toLocaleString()}</p>
                  <div className="cart-qty-row">
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div className="cart-item-right">
                  <p className="cart-item-subtotal">₦{(item.price * item.quantity).toLocaleString()}</p>
                  <button className="cart-remove-btn" onClick={() => removeItem(item.id)}>
                    <HiOutlineTrash />
                  </button>
                </div>
              </Motion.div>
            ))}
            <button className="cart-clear-btn" onClick={clearCart}>Clear Cart</button>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3 className="cart-summary-title">Order Summary</h3>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <button className="cart-checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
            <Link to="/shop" className="cart-continue-link">← Continue Shopping</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
