import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  HiOutlineShoppingBag, 
  HiOutlineClipboardList, 
  HiOutlineLogout, 
  HiOutlineHome,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineCog,
  HiOutlineMenu,
  HiX
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <div className="admin-layout">
      {/* Mobile Top Header */}
      <header className="admin-mobile-header">
        <button className="admin-burger-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Navigation Menu">
          {isOpen ? <HiX /> : <HiOutlineMenu />}
        </button>
        <img src="/logo.svg" alt="OnlyOne Hairboss" className="admin-mobile-logo" />
      </header>

      {/* Mobile Sidebar Overlay */}
      {isOpen && <div className="admin-sidebar-overlay" onClick={closeSidebar} />}

      {/* Sidebar Panel */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-top">
          <img src="/logo.svg" alt="OnlyOne Hairboss" className="admin-sidebar-logo" />
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin/overview" onClick={closeSidebar} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <HiOutlineChartBar /> Overview
          </NavLink>
          <NavLink to="/admin/products" onClick={closeSidebar} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <HiOutlineShoppingBag /> Products
          </NavLink>
          <NavLink to="/admin/orders" onClick={closeSidebar} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <HiOutlineClipboardList /> Orders
          </NavLink>
          <NavLink to="/admin/content" onClick={closeSidebar} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <HiOutlineDocumentText /> Content Manager
          </NavLink>
          <NavLink to="/admin/settings" onClick={closeSidebar} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <HiOutlineCog /> Settings
          </NavLink>
        </nav>

        <div className="admin-sidebar-bottom">
          <NavLink to="/" onClick={closeSidebar} className="admin-nav-link">
            <HiOutlineHome /> View Site
          </NavLink>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <HiOutlineLogout /> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
