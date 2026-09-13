import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminProducts, deleteProduct } from '../../services/api';
import { formatPrice, getErrorMessage } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useCommon';
import './Admin.css';

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 400);

  const loadProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAdminProducts({ search: debouncedSearch || undefined, page, limit: 20 });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(); }, [debouncedSearch]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      loadProducts(pagination.page);
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <>
      <Helmet><title>Products — Luxurybyire Admin</title></Helmet>
      <div className="admin-page">
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">Products</h1>
            <p className="admin-page__subtitle">{pagination.total || 0} total products</p>
          </div>
          <Link to="/admin/products/new" className="btn btn--primary"><Plus size={16} /> Add Product</Link>
        </div>

        <div className="admin-search">
          <Search size={16} />
          <input type="text" className="admin-search__input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px' }}>
            <Package size={48} className="empty-state__icon" />
            <h3 className="empty-state__title">No products found</h3>
            <p className="empty-state__message">{search ? 'Try a different search term.' : 'Add your first product to get started.'}</p>
            {!search && <Link to="/admin/products/new" className="btn btn--primary"><Plus size={16} /> Add Product</Link>}
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => {
                    const img = product.images?.find(i => i.isPrimary) || product.images?.[0];
                    return (
                      <tr key={product.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {img && (
                              <img
                                src={img.url}
                                alt=""
                                style={{ width: 40, height: 40, objectFit: 'cover', background: 'var(--color-bg-secondary)', borderRadius: '4px' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=60';
                                }}
                              />
                            )}
                            <div>
                              <Link to={`/admin/products/${product.id}`} style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{product.name}</Link>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{product.category?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td>{product.brand}</td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{formatPrice(product.price)}</span>
                          {product.previousPrice && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>{formatPrice(product.previousPrice)}</div>}
                        </td>
                        <td>
                          <span style={{ color: product.stockQuantity === 0 ? 'var(--color-error)' : 'inherit' }}>
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {product.isFeatured && <span className="badge badge--featured">Featured</span>}
                            {product.isNewArrival && <span className="badge badge--new">New</span>}
                            {product.isSale && <span className="badge badge--sale">Sale</span>}
                            {product.stockQuantity === 0 && <span className="badge badge--status-cancelled">Out of Stock</span>}
                          </div>
                        </td>
                        <td>
                          <div className="admin-table__actions">
                            <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/admin/products/${product.id}`)}><Edit2 size={14} /></button>
                            <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(product.id, product.name)} style={{ color: 'var(--color-error)' }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pagination.pages > 1 && (
              <div className="shop-pagination" style={{ marginTop: '20px' }}>
                <button className="btn btn--ghost btn--sm" disabled={pagination.page <= 1} onClick={() => loadProducts(pagination.page - 1)}>Previous</button>
                <span className="shop-pagination__info">Page {pagination.page} of {pagination.pages}</span>
                <button className="btn btn--ghost btn--sm" disabled={pagination.page >= pagination.pages} onClick={() => loadProducts(pagination.page + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
