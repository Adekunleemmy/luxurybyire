import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingCart, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrders, getOrder, updateOrderStatus } from '../../services/api';
import { formatPrice, formatDateTime, getStatusLabel, getErrorMessage } from '../../utils/helpers';
import './Admin.css';

const STATUSES = ['PENDING', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id).then(res => setOrder(res.data.data)).catch(err => { toast.error(getErrorMessage(err)); navigate('/admin/orders'); }).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async (status) => {
    try {
      const res = await updateOrderStatus(id, status);
      setOrder(res.data.data);
      toast.success(`Status updated to ${getStatusLabel(status)}`);
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  if (loading || !order) return <div className="admin-page" style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;

  return (
    <div className="admin-page">
      <button className="btn btn--ghost btn--sm" onClick={() => navigate('/admin/orders')} style={{ marginBottom: '16px' }}><ArrowLeft size={16} /> Back to Orders</button>
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Order {order.reference}</h1>
          <p className="admin-page__subtitle">{formatDateTime(order.createdAt)}</p>
        </div>
        <select className="input-field" value={order.status} onChange={e => handleStatusChange(e.target.value)} style={{ width: 'auto' }}>
          {STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
        </select>
      </div>

      <div className="admin-order-detail">
        <div className="admin-order-detail__section">
          <h3>Customer</h3>
          <p><strong>{order.customerName}</strong></p>
          <p>{order.customerPhone}</p>
          <p>Delivery: {order.deliveryLocation}</p>
          {order.note && <p style={{ marginTop: '8px', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Note: {order.note}</p>}
          <a href={`https://wa.me/${order.customerPhone.replace(/^0/, '234')}`} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm" style={{ marginTop: '12px' }}><MessageCircle size={14} /> Contact on WhatsApp</a>
        </div>

        <div className="admin-order-detail__section">
          <h3>Items</h3>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Size</th><th>Colour</th><th>Qty</th><th>Price</th></tr></thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.productName}</strong><br /><small style={{ color: 'var(--color-text-muted)' }}>{item.brand}</small></td>
                    <td>{item.size || '—'}</td>
                    <td>{item.colour || '—'}</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-order-detail__totals">
          <div><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div><span>Delivery ({order.deliveryLocation})</span><span>{formatPrice(order.deliveryFee)}</span></div>
          <div className="admin-order-detail__total"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
      </div>
    </div>
  );
}

function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadOrders = (page = 1) => {
    setLoading(true);
    getOrders({ status: statusFilter || undefined, page, limit: 20 })
      .then(res => { setOrders(res.data.data.orders); setPagination(res.data.data.pagination); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, [statusFilter]);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Orders</h1>
        <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', minWidth: '150px' }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px' }}><ShoppingCart size={48} className="empty-state__icon" /><h3 className="empty-state__title">No orders found</h3><p className="empty-state__message">Orders will appear here when customers check out.</p></div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Reference</th><th>Customer</th><th>Location</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td><Link to={`/admin/orders/${order.id}`} style={{ fontWeight: 500 }}>{order.reference}</Link></td>
                    <td>{order.customerName}<br /><small style={{ color: 'var(--color-text-muted)' }}>{order.customerPhone}</small></td>
                    <td>{order.deliveryLocation}</td>
                    <td style={{ fontWeight: 500 }}>{formatPrice(order.total)}</td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td><span className={`badge badge--status-${order.status.toLowerCase()}`}>{getStatusLabel(order.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="shop-pagination" style={{ marginTop: '20px' }}>
              <button className="btn btn--ghost btn--sm" disabled={pagination.page <= 1} onClick={() => loadOrders(pagination.page - 1)}>Previous</button>
              <span className="shop-pagination__info">Page {pagination.page} of {pagination.pages}</span>
              <button className="btn btn--ghost btn--sm" disabled={pagination.page >= pagination.pages} onClick={() => loadOrders(pagination.page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const { id } = useParams();
  return (
    <>
      <Helmet><title>{`${id ? 'Order Detail' : 'Orders'} — Luxurybyire Admin`}</title></Helmet>
      {id ? <OrderDetail /> : <OrdersList />}
    </>
  );
}
