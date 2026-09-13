import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, Settings, LogOut, Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/layout/Navbar';
import './Admin.css';

export default function AdminLayout() {
  const { isAuthenticated, loading, logout } = useAuth();

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <nav className="admin-sidebar__nav">
            <span className="admin-sidebar__label">Store</span>
            <NavLink to="/admin" end className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/admin/products" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
              <Package size={18} /> Products
            </NavLink>
            <NavLink to="/admin/categories" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
              <FolderOpen size={18} /> Categories
            </NavLink>
            <NavLink to="/admin/orders" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
              <ShoppingCart size={18} /> Orders
            </NavLink>
            <div className="admin-sidebar__divider" />
            <span className="admin-sidebar__label">Configuration</span>
            <NavLink to="/admin/settings" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
              <Settings size={18} /> Settings
            </NavLink>
            <NavLink to="/" className="admin-sidebar__link">
              <Store size={18} /> View Store
            </NavLink>
            <button className="admin-sidebar__link" onClick={logout} style={{ width: '100%', cursor: 'pointer' }}>
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </aside>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
