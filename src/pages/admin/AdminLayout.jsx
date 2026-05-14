import { NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineClipboardList, HiOutlineLogout, HiOutlineHome } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <img src="/logo.svg" alt="OnlyOne Hairboss" className="admin-sidebar-logo" />
          <p className="admin-sidebar-label">Admin</p>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <HiOutlineShoppingBag /> Products
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <HiOutlineClipboardList /> Orders
          </NavLink>
        </nav>

        <div className="admin-sidebar-bottom">
          <NavLink to="/" className="admin-nav-link">
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
