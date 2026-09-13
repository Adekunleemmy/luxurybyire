import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, PackageCheck, PackageX, Star, ShoppingCart } from 'lucide-react';
import { getAdminProducts, getRecentOrders, getOrderStats } from '../../services/api';
import { getProductStats } from '../../services/api';
import { formatPrice, formatDate, getStatusLabel } from '../../utils/helpers';
import './Admin.css';

export default function AdminDashboard() {
  const [productStats, setProductStats] = useState({ total: 0, inStock: 0, outOfStock: 0, featured: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProductStats(),
      getOrderStats(),
      getRecentOrders(),
    ]).then(([prodRes, ordRes, recentRes]) => {
      setProductStats(prodRes.data.data);
      setOrderStats(ordRes.data.data);
      setRecentOrders(recentRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Products', value: productStats.total, icon: Package, color: 'var(--color-accent)' },
    { label: 'In Stock', value: productStats.inStock, icon: PackageCheck, color: 'var(--color-success)' },
    { label: 'Out of Stock', value: productStats.outOfStock, icon: PackageX, color: 'var(--color-error)' },
    { label: 'Featured', value: productStats.featured, icon: Star, color: 'var(--color-warning)' },
  ];

  return (
    <>
      <Helmet><title>Dashboard — Luxurybyire Admin</title></Helmet>
      <div className="admin-page">
        <h1 className="admin-page__title">Dashboard</h1>
        <p className="admin-page__subtitle">Welcome back. Here's an overview of your store.</p>

        <div className="admin-stats-grid">
          {statCards.map(card => (
            <div key={card.label} className="admin-stat-card">
              <div className="admin-stat-card__icon" style={{ color: card.color }}>
                <card.icon size={22} />
              </div>
              <div>
                <span className="admin-stat-card__value">{loading ? '—' : card.value}</span>
                <span className="admin-stat-card__label">{card.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-section">
          <div className="admin-section__header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="btn btn--ghost btn--sm">View All</Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <ShoppingCart size={40} className="empty-state__icon" />
              <p className="empty-state__title">No orders yet</p>
              <p className="empty-state__message">Orders will appear here when customers check out.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td><Link to={`/admin/orders/${order.id}`} style={{ fontWeight: 500 }}>{order.reference}</Link></td>
                      <td>{order.customerName}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{formatPrice(order.total)}</td>
                      <td><span className={`badge badge--status-${order.status.toLowerCase()}`}>{getStatusLabel(order.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
