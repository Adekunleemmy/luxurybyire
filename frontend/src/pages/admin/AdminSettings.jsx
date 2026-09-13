import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSettings, updateSettings, getDeliveryZones, updateDeliveryZones } from '../../services/api';
import { getErrorMessage } from '../../utils/helpers';
import './Admin.css';

export default function AdminSettings() {
  const [form, setForm] = useState({ businessName: '', whatsappNumber: '', phone: '', email: '', address: '', instagramUrl: '', tiktokUrl: '', facebookUrl: '' });
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getSettings(), getDeliveryZones()])
      .then(([settingsRes, zonesRes]) => {
        const s = settingsRes.data.data;
        setForm({ businessName: s.businessName || '', whatsappNumber: s.whatsappNumber || '', phone: s.phone || '', email: s.email || '', address: s.address || '', instagramUrl: s.instagramUrl || '', tiktokUrl: s.tiktokUrl || '', facebookUrl: s.facebookUrl || '' });
        setZones(zonesRes.data.data.map(z => ({ ...z })));
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateZone = (idx, field, value) => {
    setZones(prev => prev.map((z, i) => i === idx ? { ...z, [field]: value } : z));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        updateSettings(form),
        updateDeliveryZones(zones),
      ]);
      toast.success('Settings saved');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="admin-page" style={{ textAlign: 'center', padding: '60px' }}>Loading settings...</div>;

  return (
    <>
      <Helmet><title>Settings — Luxurybyire Admin</title></Helmet>
      <div className="admin-page">
        <h1 className="admin-page__title">Settings</h1>
        <p className="admin-page__subtitle">Manage your store information and delivery pricing.</p>

        <form onSubmit={handleSave} className="admin-form">
          <div className="admin-form__section">
            <h3 className="admin-form__section-title">Business Information</h3>
            <div className="admin-form__grid">
              <div className="input-group"><label className="input-label">Business Name</label><input className="input-field" value={form.businessName} onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))} /></div>
              <div className="input-group"><label className="input-label">WhatsApp Number</label><input className="input-field" value={form.whatsappNumber} onChange={e => setForm(p => ({ ...p, whatsappNumber: e.target.value }))} placeholder="2348012345678" /><span className="input-hint">International format, no + or spaces</span></div>
              <div className="input-group"><label className="input-label">Phone</label><input className="input-field" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="input-group"><label className="input-label">Email</label><input className="input-field" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            </div>
            <div className="input-group" style={{ marginTop: '12px' }}><label className="input-label">Address</label><input className="input-field" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
          </div>

          <div className="admin-form__section">
            <h3 className="admin-form__section-title">Social Media</h3>
            <div className="admin-form__grid">
              <div className="input-group"><label className="input-label">TikTok URL</label><input className="input-field" value={form.tiktokUrl} onChange={e => setForm(p => ({ ...p, tiktokUrl: e.target.value }))} /></div>
            </div>
          </div>

          <div className="admin-form__section">
            <h3 className="admin-form__section-title">Delivery Pricing</h3>
            <div className="admin-delivery-zones">
              {zones.map((zone, idx) => (
                <div key={idx} className="admin-delivery-zone">
                  <div className="input-group" style={{ flex: 2 }}><label className="input-label">Zone Name</label><input className="input-field" value={zone.name} onChange={e => updateZone(idx, 'name', e.target.value)} /></div>
                  <div className="input-group" style={{ flex: 1 }}><label className="input-label">Fee (₦)</label><input className="input-field" type="number" value={zone.fee} onChange={e => updateZone(idx, 'fee', e.target.value)} /></div>
                  <div className="input-group" style={{ flex: 2 }}><label className="input-label">Description</label><input className="input-field" value={zone.description || ''} onChange={e => updateZone(idx, 'description', e.target.value)} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-form__footer">
            <button type="submit" className="btn btn--primary btn--lg" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}</button>
          </div>
        </form>
      </div>
    </>
  );
}
