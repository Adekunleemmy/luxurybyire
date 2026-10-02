import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Upload, X, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProduct, createProduct, updateProduct, getCategories, uploadImage } from '../../services/api';
import { getErrorMessage } from '../../utils/helpers';
import './Admin.css';

const GENDERS = [{ value: 'MEN', label: 'Men' }, { value: 'WOMEN', label: 'Women' }, { value: 'UNISEX', label: 'Unisex' }];
const ALL_SIZES = ['36','37','38','39','40','41','42','43','44','45'];

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: '', brand: '', description: '', price: '', previousPrice: '', gender: 'UNISEX',
    stockQuantity: '10', categoryId: '', sizes: [], colours: [], isAvailable: true, images: [],
  });
  const [colourInput, setColourInput] = useState('');

  useEffect(() => {
    getCategories().then(res => setCategories(res.data.data)).catch(() => {});
    if (isEdit) {
      getProduct(id).then(res => {
        const p = res.data.data.product;
        setForm({
          name: p.name, brand: p.brand, description: p.description,
          price: String(p.price), previousPrice: p.previousPrice ? String(p.previousPrice) : '',
          gender: p.gender, stockQuantity: String(p.stockQuantity), categoryId: p.categoryId,
          sizes: p.sizes?.map(s => s.size) || [],
          colours: p.colours?.map(c => c.colour) || [],
          isAvailable: p.isAvailable && p.stockQuantity > 0,
          images: p.images?.map(img => ({ url: img.url, publicId: img.publicId, isPrimary: img.isPrimary })) || [],
        });
      }).catch(err => { toast.error(getErrorMessage(err)); navigate('/admin/products'); }).finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleSize = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
    }));
  };

  const addColour = () => {
    const c = colourInput.trim();
    if (c && !form.colours.includes(c)) { updateField('colours', [...form.colours, c]); }
    setColourInput('');
  };

  const removeColour = (colour) => updateField('colours', form.colours.filter(c => c !== colour));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const res = await uploadImage(file);
        const imgData = res.data.data;
        setForm(prev => ({
          ...prev,
          images: [...prev.images, { url: imgData.url, publicId: imgData.publicId, isPrimary: prev.images.length === 0 }],
        }));
      }
      toast.success('Images uploaded');
    } catch (err) { toast.error('Failed to upload image. Check your Cloudinary settings.'); }
    finally { setUploading(false); }
  };

  const removeImage = (idx) => {
    setForm(prev => {
      const imgs = prev.images.filter((_, i) => i !== idx);
      if (imgs.length > 0 && !imgs.some(i => i.isPrimary)) imgs[0].isPrimary = true;
      return { ...prev, images: imgs };
    });
  };

  const setPrimaryImage = (idx) => {
    setForm(prev => {
      const selected = prev.images[idx];
      const others = prev.images.filter((_, i) => i !== idx);
      const reordered = [
        { ...selected, isPrimary: true },
        ...others.map(img => ({ ...img, isPrimary: false })),
      ];
      return { ...prev, images: reordered };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.brand || !form.price || !form.categoryId || !form.description) {
      toast.error('Please fill in all required fields'); return;
    }
    if (form.sizes.length === 0) { toast.error('Please select at least one size'); return; }

    setSaving(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        previousPrice: form.previousPrice ? parseFloat(form.previousPrice) : null,
        stockQuantity: form.isAvailable ? (parseInt(form.stockQuantity) > 0 ? parseInt(form.stockQuantity) : 10) : 0,
        isAvailable: form.isAvailable,
      };

      if (isEdit) { await updateProduct(id, data); toast.success('Product updated'); }
      else { await createProduct(data); toast.success('Product created'); }
      navigate('/admin/products');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="admin-page" style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;

  return (
    <>
      <Helmet><title>{`${isEdit ? 'Edit' : 'Add'} Product — Luxurybyire Admin`}</title></Helmet>
      <div className="admin-page">
        <button className="btn btn--ghost btn--sm" onClick={() => navigate('/admin/products')} style={{ marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Products
        </button>
        <h1 className="admin-page__title">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

        <form onSubmit={handleSubmit} className="admin-form">
          {/* Basic Information */}
          <div className="admin-form__section">
            <h3 className="admin-form__section-title">Basic Information</h3>
            <div className="admin-form__grid">
              <div className="input-group"><label className="input-label">Product Name *</label><input className="input-field" value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Nike Air Max 90" /></div>
              <div className="input-group"><label className="input-label">Brand *</label><input className="input-field" value={form.brand} onChange={e => updateField('brand', e.target.value)} placeholder="e.g. Nike" /></div>
              <div className="input-group"><label className="input-label">Category *</label>
                <select className="input-field" value={form.categoryId} onChange={e => updateField('categoryId', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="input-group"><label className="input-label">Gender</label>
                <select className="input-field" value={form.gender} onChange={e => updateField('gender', e.target.value)}>
                  {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="admin-form__section">
            <h3 className="admin-form__section-title">Pricing</h3>
            <div className="admin-form__grid">
              <div className="input-group"><label className="input-label">Current Price (₦) *</label><input className="input-field" type="number" min="0" value={form.price} onChange={e => updateField('price', e.target.value)} placeholder="150000" /></div>
              <div className="input-group"><label className="input-label">Previous Price (₦)</label><input className="input-field" type="number" min="0" value={form.previousPrice} onChange={e => updateField('previousPrice', e.target.value)} placeholder="180000" /><span className="input-hint">Leave empty if no discount</span></div>
            </div>
          </div>

          {/* Description */}
          <div className="admin-form__section">
            <h3 className="admin-form__section-title">Description</h3>
            <div className="input-group"><textarea className="input-field" value={form.description} onChange={e => updateField('description', e.target.value)} rows={4} placeholder="Describe the product..." /></div>
          </div>

          {/* Sizes */}
          <div className="admin-form__section">
            <h3 className="admin-form__section-title">Available Sizes *</h3>
            <div className="size-grid">
              {ALL_SIZES.map(s => (
                <button key={s} type="button" className={`size-option ${form.sizes.includes(s) ? 'size-option--selected' : ''}`} onClick={() => toggleSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* Colours */}
          <div className="admin-form__section">
            <h3 className="admin-form__section-title">Colours</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input className="input-field" value={colourInput} onChange={e => setColourInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addColour(); } }} placeholder="e.g. Black" style={{ flex: 1 }} />
              <button type="button" className="btn btn--secondary btn--sm" onClick={addColour}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {form.colours.map(c => (
                <span key={c} className="active-filter">{c}<button type="button" onClick={() => removeColour(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><X size={12} /></button></span>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="admin-form__section">
            <h3 className="admin-form__section-title">Product Images</h3>
            <div className="admin-images">
              {form.images.map((img, idx) => (
                <div key={idx} className={`admin-image-item ${img.isPrimary ? 'admin-image-item--primary' : ''}`}>
                  <img src={img.url} alt="" />
                  {img.isPrimary && <span className="admin-image-item__badge">Primary</span>}
                  <div className="admin-image-item__actions">
                    {!img.isPrimary && <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPrimaryImage(idx)}>Set Primary</button>}
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeImage(idx)} style={{ color: 'var(--color-error)' }}><X size={14} /></button>
                  </div>
                </div>
              ))}
              <label className="admin-image-upload">
                <Upload size={24} />
                <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} hidden />
              </label>
            </div>
          </div>

          {/* Availability & Stock Status */}
          <div className="admin-form__section">
            <h3 className="admin-form__section-title">Stock & Availability</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Control whether this product is currently in stock. Out-of-stock items will not appear in the customer shop.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label className="toggle">
                <input
                  type="checkbox"
                  className="toggle__input"
                  checked={form.isAvailable}
                  onChange={e => {
                    const checked = e.target.checked;
                    setForm(prev => ({
                      ...prev,
                      isAvailable: checked,
                      stockQuantity: checked ? (parseInt(prev.stockQuantity) > 0 ? prev.stockQuantity : '10') : '0',
                    }));
                  }}
                />
                <span className="toggle__track"><span className="toggle__thumb" /></span>
                <span className="toggle__label" style={{ fontWeight: 600 }}>
                  {form.isAvailable ? (
                    <span style={{ color: 'var(--color-success)' }}>In Stock (Visible in Shop)</span>
                  ) : (
                    <span style={{ color: 'var(--color-error)' }}>Out of Stock (Hidden from Shop)</span>
                  )}
                </span>
              </label>

              {form.isAvailable && (
                <div className="input-group" style={{ maxWidth: '200px' }}>
                  <label className="input-label">Stock Quantity</label>
                  <input
                    className="input-field"
                    type="number"
                    min="1"
                    value={form.stockQuantity}
                    onChange={e => updateField('stockQuantity', e.target.value)}
                    placeholder="10"
                  />
                  <span className="input-hint">Units available for sale</span>
                </div>
              )}
            </div>
          </div>

          <div className="admin-form__footer">
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin/products')}>Cancel</button>
            <button type="submit" className="btn btn--primary btn--lg" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}</button>
          </div>
        </form>
      </div>
    </>
  );
}
