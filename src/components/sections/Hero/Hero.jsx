import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineSearch, HiOutlineUser, HiMenu, HiX } from 'react-icons/hi';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import './Hero.css';

const Hero = () => {
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

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const menuVariants = {
    closed: { x: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    opened: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  return (
    <section className="hero-container">
      <div className="video-overlay"></div>
      <img src="/hero-image.webp" alt="Hero Background" className="bg-video" />

      <div className="announcement-bar">
        Please note that order processing takes 3 working days.
      </div>

      <nav className="navbar">
        <div className="nav-logo">
          <Link to="/">
            <img src="/logo.svg" alt="OnlyOne Hairboss Logo" className="logo-img" />
          </Link>
        </div>

        {/* Desktop menu */}
        <ul className="nav-menu desktop-only">
          {navLinks.map((link, index) => (
            <li key={index}>
              <Link to={link.path}>{link.name}</Link>
            </li>
          ))}
        </ul>

        {/* Mobile drawer with backdrop */}
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
                className="nav-menu mobile-only"
                initial="closed"
                animate="opened"
                exit="closed"
                variants={menuVariants}
              >
                <div className="mobile-close" onClick={() => setIsOpen(false)}>
                  <HiX />
                </div>
                {navLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path} onClick={() => setIsOpen(false)}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </Motion.ul>
            </>
          )}
        </AnimatePresence>

        <div className="nav-icons">
          <HiOutlineSearch className="icon hide-mobile" onClick={() => navigate('/search')} />
          {user ? (
            <div className="hero-avatar hide-mobile" onClick={() => navigate('/account')} title={user.user_metadata?.full_name || user.email}>
              {userInitial}
            </div>
          ) : (
            <HiOutlineUser className="icon hide-mobile" onClick={() => navigate('/auth')} />
          )}
          <div className="cart-icon" onClick={() => navigate('/cart')}>
            <HiOutlineShoppingBag className="icon" />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </div>
          <div className="mobile-toggle" onClick={() => setIsOpen(true)}>
            <HiMenu />
          </div>
        </div>
      </nav>

      <div className="hero-content">
        <Motion.h2
          className="headline"
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Luxury Hair That Speaks Before You Do.
        </Motion.h2>

        <Motion.p
          className="subheadline"
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Luxury wigs made for bold women who love quality, elegance, and attention-grabbing styles.
        </Motion.p>

        <Motion.div
          className="hero-btn-container"
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link to="/shop" className="btn-primary">Shop Now</Link>
        </Motion.div>
      </div>
    </section>
  );
};

export default Hero;
