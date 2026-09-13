import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit2, Trash2, FolderOpen, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import { getErrorMessage } from '../../utils/helpers';
import './Admin.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    getCategories().then(res => setCategories(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  const handleEdit = (cat) => { setEditingId(cat.id); setForm({ name: cat.name, description: cat.description || '' }); setShowForm(true); };

  const handleCancel = () => { setShowForm(false); setEditingId(null); setForm({ name: '', description: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      if (editingId) { await updateCategory(editingId, form); toast.success('Category updated'); }
      else { await createCategory(form); toast.success('Category created'); }
      handleCancel();
      loadCategories();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await deleteCategory(id); toast.success('Category deleted'); loadCategories(); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <>
      <Helmet><title>Categories — Luxurybyire Admin</title></Helmet>
      <div className="admin-page">
        <div className="admin-page__header">
          <h1 className="admin-page__title">Categories</h1>
          <button className="btn btn--primary" onClick={() => { handleCancel(); setShowForm(true); }}><Plus size={16} /> Add Category</button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-inline-form">
            <h3>{editingId ? 'Edit Category' : 'New Category'}</h3>
            <div className="admin-form__grid">
              <div className="input-group"><label className="input-label">Name *</label><input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Category name" /></div>
              <div className="input-group"><label className="input-label">Description</label><input className="input-field" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" /></div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button type="submit" className="btn btn--primary btn--sm" disabled={saving}><Save size={14} /> {saving ? 'Saving...' : 'Save'}</button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={handleCancel}><X size={14} /> Cancel</button>
            </div>
          </form>
        )}

        {categories.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px' }}>
            <FolderOpen size={48} className="empty-state__icon" />
            <h3 className="empty-state__title">No categories yet</h3>
            <p className="empty-state__message">Create your first category to organize products.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Slug</th><th>Products</th><th>Description</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 500 }}>{cat.name}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{cat.slug}</td>
                    <td>{cat._count?.products || 0}</td>
                    <td style={{ color: 'var(--color-text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description || '—'}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button className="btn btn--ghost btn--sm" onClick={() => handleEdit(cat)}><Edit2 size={14} /></button>
                        <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(cat.id, cat.name)} style={{ color: 'var(--color-error)' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
