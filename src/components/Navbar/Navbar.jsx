import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineSearch, HiOutlineUser, HiMenu, HiX } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userInitial = user
    ? (user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'U')
        .trim().charAt(0).toUpperCase()
    : null;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About Us', path: '/#about' },
    { name: 'Contact', path: '/#contact' },
  ];

  const menuVariants = {
    closed: { x: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    opened: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  return (
    <nav className="page-navbar">
      <div className="page-nav-inner">
        <Link to="/" className="page-nav-logo">
          <img src="/logo1.svg" alt="OnlyOne Hairboss" className="page-logo-img" />
        </Link>

        <ul className="page-nav-menu desktop-only">
          {navLinks.map((link, i) => (
            <li key={i}>
              <Link to={link.path}>{link.name}</Link>
            </li>
          ))}
        </ul>

        <div className="page-nav-icons">
          <HiOutlineSearch className="page-icon hide-mobile" onClick={() => navigate('/search')} />
          {user ? (
            <div className="nav-avatar hide-mobile" onClick={() => navigate('/auth')} title={user.user_metadata?.full_name || user.email}>
              {userInitial}
            </div>
          ) : (
            <HiOutlineUser className="page-icon hide-mobile" onClick={() => navigate('/auth')} />
          )}
          <div className="page-cart-icon" onClick={() => navigate('/cart')}>
            <HiOutlineShoppingBag className="page-icon" />
            {cartCount > 0 && <span className="page-cart-count">{cartCount}</span>}
          </div>
          <div className="page-mobile-toggle" onClick={() => setIsOpen(true)}>
            <HiMenu />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <Motion.div
              className="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <Motion.ul
              className="page-mobile-menu"
              initial="closed"
              animate="opened"
              exit="closed"
              variants={menuVariants}
            >
              <div className="page-mobile-close" onClick={() => setIsOpen(false)}><HiX /></div>
              {navLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} onClick={() => setIsOpen(false)}>{link.name}</Link>
                </li>
              ))}
              <li>
                <Link to={user ? '/account' : '/auth'} onClick={() => setIsOpen(false)}>
                  {user ? 'My Account' : 'Login / Sign Up'}
                </Link>
              </li>
              <li>
                <Link to="/cart" onClick={() => setIsOpen(false)}>
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              </li>
            </Motion.ul>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
