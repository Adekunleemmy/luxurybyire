import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../contexts/CartContext';
import { createOrder as createOrderApi, getDeliveryZones, getSettings } from '../../services/api';
import { formatPrice, generateWhatsAppUrl, getErrorMessage } from '../../utils/helpers';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();

  const [zones, setZones] = useState([]);
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', deliveryLocation: '', note: '' });
  const [errors, setErrors] = useState({});
  const [selectedZone, setSelectedZone] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) { navigate('/cart'); return; }
    Promise.all([getDeliveryZones(), getSettings()])
      .then(([zonesRes, settingsRes]) => {
        setZones(zonesRes.data.data);
        setSettings(settingsRes.data.data);
      })
      .catch(() => toast.error('Failed to load checkout details'));
  }, [items.length, navigate]);

  const handleLocationChange = (zoneName) => {
    setForm(prev => ({ ...prev, deliveryLocation: zoneName }));
    const zone = zones.find(z => z.name === zoneName);
    setSelectedZone(zone || null);
    if (errors.deliveryLocation) setErrors(prev => ({ ...prev, deliveryLocation: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim() || form.customerName.trim().length < 2) errs.customerName = 'Please enter your full name';
    if (!form.customerPhone.trim()) errs.customerPhone = 'Please enter your phone number';
    else if (!/^(\+?234|0)[789]\d{9}$/.test(form.customerPhone.replace(/\s/g, ''))) errs.customerPhone = 'Please enter a valid Nigerian phone number';
    if (!form.deliveryLocation) errs.deliveryLocation = 'Please select a delivery location';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const deliveryFee = selectedZone?.fee || 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const orderData = {
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.replace(/\s/g, ''),
        deliveryLocation: form.deliveryLocation,
        deliveryFee,
        note: form.note.trim() || undefined,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          brand: item.brand,
          size: item.size,
          colour: item.colour,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await createOrderApi(orderData);

      const whatsappUrl = generateWhatsAppUrl(settings?.whatsappNumber || '2348012345678', {
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone,
        deliveryLocation: form.deliveryLocation,
        items: orderData.items,
        subtotal,
        deliveryFee,
        total,
        note: form.note.trim(),
      });

      clearCart();
      window.open(whatsappUrl, '_blank');
      toast.success('Order placed! Redirecting to WhatsApp...');
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <Helmet><title>Checkout — Luxurybyire</title></Helmet>
      <div className="checkout-page container">
        <Link to="/cart" className="checkout-back"><ArrowLeft size={16} /> Back to Cart</Link>
        <h1 className="checkout-page__title">Checkout</h1>

        <form onSubmit={handleSubmit} className="checkout-layout" noValidate>
          <div className="checkout-form">
            <h2 className="checkout-form__heading">Customer Information</h2>

            <div className="input-group">
              <label className="input-label" htmlFor="customerName">Full Name *</label>
              <input id="customerName" className={`input-field ${errors.customerName ? 'input-field--error' : ''}`} type="text" value={form.customerName} onChange={e => { setForm(p => ({ ...p, customerName: e.target.value })); if (errors.customerName) setErrors(p => ({ ...p, customerName: '' })); }} placeholder="Your full name" />
              {errors.customerName && <p className="input-error">{errors.customerName}</p>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="customerPhone">Phone Number *</label>
              <input id="customerPhone" className={`input-field ${errors.customerPhone ? 'input-field--error' : ''}`} type="tel" value={form.customerPhone} onChange={e => { setForm(p => ({ ...p, customerPhone: e.target.value })); if (errors.customerPhone) setErrors(p => ({ ...p, customerPhone: '' })); }} placeholder="080XXXXXXXX" />
              {errors.customerPhone && <p className="input-error">{errors.customerPhone}</p>}
            </div>

            <div className="input-group">
              <label className="input-label">Delivery Location *</label>
              <div className="delivery-zones">
                {zones.map(zone => (
                  <button key={zone.id} type="button" className={`delivery-zone ${form.deliveryLocation === zone.name ? 'delivery-zone--selected' : ''}`} onClick={() => handleLocationChange(zone.name)}>
                    <div>
                      <strong>{zone.name}</strong>
                      {zone.description && <p>{zone.description}</p>}
                    </div>
                    <span className="delivery-zone__fee">{formatPrice(zone.fee)}</span>
                  </button>
                ))}
              </div>
              {errors.deliveryLocation && <p className="input-error">{errors.deliveryLocation}</p>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="note">Additional Note (optional)</label>
              <textarea id="note" className="input-field" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Any special instructions..." rows={3} />
            </div>
          </div>

          <aside className="checkout-summary">
            <h3 className="checkout-summary__title">Order Summary</h3>
            <div className="checkout-summary__items">
              {items.map(item => (
                <div key={`${item.productId}-${item.size}-${item.colour}`} className="checkout-summary__item">
                  <img src={item.image} alt="" className="checkout-summary__item-img" />
                  <div className="checkout-summary__item-info">
                    <span className="checkout-summary__item-name">{item.productName}</span>
                    <span className="checkout-summary__item-meta">
                      {item.size && `Size ${item.size}`}{item.colour && ` • ${item.colour}`} × {item.quantity}
                    </span>
                  </div>
                  <span className="checkout-summary__item-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="checkout-summary__totals">
              <div className="checkout-summary__row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="checkout-summary__row"><span>Delivery</span><span>{selectedZone ? formatPrice(deliveryFee) : '—'}</span></div>
              <div className="checkout-summary__divider" />
              <div className="checkout-summary__row checkout-summary__row--total"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>

            <button type="submit" className="btn btn--primary btn--lg btn--full checkout-submit" disabled={submitting}>
              <MessageCircle size={18} />
              {submitting ? 'Processing...' : 'Checkout via WhatsApp'}
            </button>

            <p className="checkout-note">
              <AlertCircle size={14} /> Your order will be sent to our WhatsApp for confirmation.
              Payment details will be provided there.
            </p>
          </aside>
        </form>
      </div>
    </>
  );
}
