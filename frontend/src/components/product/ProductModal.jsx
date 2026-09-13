import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Minus, Plus, MessageCircle, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { getProduct, getSettings } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { formatPrice, calcDiscount, getGenderLabel, getOptimizedImageUrl } from '../../utils/helpers';
import { useScrollLock } from '../../hooks/useCommon';
import './ProductModal.css';

export default function ProductModal({ product, onClose }) {
  const { addItem } = useCart();

  const [fullProduct, setFullProduct] = useState(product);
  const [settings, setSettings] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColour, setSelectedColour] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Lock body scroll while modal is open
  useScrollLock(true);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch full details and business settings
  useEffect(() => {
    if (!product?.slug) return;

    getProduct(product.slug)
      .then((res) => {
        const p = res.data.data.product;
        setFullProduct(p);
        if (p.colours?.length === 1) {
          setSelectedColour(p.colours[0].colour);
        }
      })
      .catch((err) => console.error('Failed to load full product for modal:', err));

    getSettings()
      .then((res) => setSettings(res.data.data))
      .catch(() => {});
  }, [product?.slug]);

  if (!product) return null;

  const activeProduct = fullProduct || product;
  const discount = calcDiscount(activeProduct.price, activeProduct.previousPrice);
  const outOfStock = activeProduct.stockQuantity === 0;
  const images = activeProduct.images?.length > 0
    ? activeProduct.images
    : [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', isPrimary: true }];

  const handleAddToCart = () => {
    if (activeProduct.sizes?.length > 0 && !selectedSize) {
      setSizeError('Please choose a size');
      return;
    }
    setSizeError('');
    addItem(activeProduct, selectedSize, selectedColour, quantity);

    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 2000);
  };

  const handleWhatsAppOrder = () => {
    const number = settings?.whatsappNumber || '2348012345678';
    let text = `Hello Luxurybyire,\n\nI want to order: *${activeProduct.name}* (${activeProduct.brand})\n`;
    text += `Price: ${formatPrice(activeProduct.price)}\n`;
    if (selectedSize) text += `Size: ${selectedSize}\n`;
    if (selectedColour) text += `Colour: ${selectedColour}\n`;
    if (quantity > 1) text += `Quantity: ${quantity}\n`;
    text += `\nPlease confirm availability and payment details. Thank you!`;

    const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return createPortal(
    <div className="product-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="product-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="product-modal__close"
          onClick={onClose}
          aria-label="Close product quick view"
        >
          <X size={20} />
        </button>

        <div className="product-modal__body">
          {/* Left Column: Gallery */}
          <div className="product-modal__gallery">
            <div className="product-modal__image-wrap">
              <img
                src={getOptimizedImageUrl(images[selectedImage]?.url, 800)}
                alt={activeProduct.name}
                className="product-modal__image"
              />
              <div className="product-modal__badges">
                {activeProduct.isNewArrival && <span className="badge badge--new">New</span>}
                {discount > 0 && <span className="badge badge--sale">-{discount}%</span>}
              </div>
            </div>

            {images.length > 1 && (
              <div className="product-modal__thumbs">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`product-modal__thumb ${idx === selectedImage ? 'product-modal__thumb--active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                    aria-label={`View angle ${idx + 1}`}
                  >
                    <img src={getOptimizedImageUrl(img.url, 140)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="product-modal__info">
            <div className="product-modal__header">
              <span className="product-modal__brand">{activeProduct.brand}</span>
              <h2 className="product-modal__title">{activeProduct.name}</h2>

              <div className="product-modal__meta">
                {activeProduct.category?.name && (
                  <span className="product-modal__tag">{activeProduct.category.name}</span>
                )}
                {activeProduct.gender && (
                  <span className="product-modal__tag">{getGenderLabel(activeProduct.gender)}</span>
                )}
              </div>
            </div>

            {/* Price & Stock */}
            <div className="product-modal__pricing">
              <div className="price">
                <span className="price__current" style={{ fontSize: 'var(--text-2xl)' }}>
                  {formatPrice(activeProduct.price)}
                </span>
                {activeProduct.previousPrice && activeProduct.previousPrice > activeProduct.price && (
                  <>
                    <span className="price__previous">{formatPrice(activeProduct.previousPrice)}</span>
                    <span className="price__discount">-{discount}%</span>
                  </>
                )}
              </div>

              {outOfStock ? (
                <span className="stock-badge stock-badge--out">
                  <AlertCircle size={14} /> Out of Stock
                </span>
              ) : (
                <span className="stock-badge stock-badge--in">
                  {activeProduct.stockQuantity <= 5
                    ? `Only ${activeProduct.stockQuantity} left`
                    : 'In Stock'}
                </span>
              )}
            </div>

            {/* Brief Description */}
            {activeProduct.description && (
              <p className="product-modal__desc">{activeProduct.description}</p>
            )}

            {!outOfStock && (
              <>
                {/* Colour Options */}
                {activeProduct.colours?.length > 0 && (
                  <div className="product-modal__section">
                    <label className="product-modal__section-title">
                      Colour: <span>{selectedColour || 'Select a colour'}</span>
                    </label>
                    <div className="product-modal__options">
                      {activeProduct.colours.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`product-modal__option ${selectedColour === c.colour ? 'product-modal__option--active' : ''}`}
                          onClick={() => setSelectedColour(c.colour)}
                        >
                          {c.colour}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Options */}
                {activeProduct.sizes?.length > 0 && (
                  <div className="product-modal__section">
                    <div className="product-modal__section-header">
                      <label className="product-modal__section-title">
                        Size (EU): <span>{selectedSize || 'Select a size'}</span>
                      </label>
                    </div>
                    <div className="product-modal__options product-modal__sizes">
                      {activeProduct.sizes.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={`product-modal__option product-modal__size-btn ${selectedSize === s.size ? 'product-modal__option--active' : ''}`}
                          onClick={() => {
                            setSelectedSize(s.size);
                            setSizeError('');
                          }}
                        >
                          {s.size}
                        </button>
                      ))}
                    </div>
                    {sizeError && <p className="input-error product-modal__error">{sizeError}</p>}
                  </div>
                )}

                {/* Quantity */}
                <div className="product-modal__section">
                  <label className="product-modal__section-title">Quantity</label>
                  <div className="qty-selector">
                    <button
                      type="button"
                      className="qty-selector__btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-selector__value">{quantity}</span>
                    <button
                      type="button"
                      className="qty-selector__btn"
                      onClick={() => setQuantity(Math.min(activeProduct.stockQuantity || 99, quantity + 1))}
                      disabled={quantity >= (activeProduct.stockQuantity || 99)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Add to Cart & WhatsApp */}
                <div className="product-modal__actions">
                  <button
                    type="button"
                    className={`btn btn--primary btn--lg btn--full product-modal__cart-btn ${addedAnimation ? 'btn--success' : ''}`}
                    onClick={handleAddToCart}
                  >
                    {addedAnimation ? (
                      <>
                        <Check size={18} /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} /> Add to Cart — {formatPrice(activeProduct.price * quantity)}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn--outline btn--lg btn--full product-modal__wa-btn"
                    onClick={handleWhatsAppOrder}
                  >
                    <MessageCircle size={18} /> Order via WhatsApp
                  </button>
                </div>
              </>
            )}

            {/* View Full Product Page Link */}
            <div className="product-modal__footer">
              <Link
                to={`/product/${activeProduct.slug}`}
                className="product-modal__full-link"
                onClick={onClose}
              >
                View full product details <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
