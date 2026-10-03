import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getOptimizedImageUrl, isProductNew, recordProductInteraction } from '../../utils/helpers';
import './ProductCard.css';

export default function ProductCard({ product, onProductClick }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const rawImages = product.images && product.images.length > 0 ? product.images : [];
  const sortedImages = rawImages.length > 0
    ? [...rawImages].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
    : [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=60' }];

  const hasMultipleImages = sortedImages.length > 1;
  const outOfStock = product.stockQuantity === 0 || product.isAvailable === false;
  const isNew = isProductNew(product.createdAt, product.isNewArrival);

  // Extract colours list
  const coloursList = (product.colours || [])
    .map((c) => (typeof c === 'string' ? c : c?.colour))
    .filter(Boolean);

  useEffect(() => {
    if (!hasMultipleImages) {
      setActiveImageIndex(0);
      return;
    }

    // Subtle staggered start so cards don't all flip at the exact same millisecond
    const seed = (product.id || product.slug || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const initialDelay = 1800 + (seed % 4) * 500; // 1.8s - 3.3s

    let intervalTimer;
    const startTimer = setTimeout(() => {
      setActiveImageIndex((prev) => (prev + 1) % sortedImages.length);

      intervalTimer = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % sortedImages.length);
      }, 2800);
    }, initialDelay);

    return () => {
      clearTimeout(startTimer);
      if (intervalTimer) clearInterval(intervalTimer);
    };
  }, [hasMultipleImages, sortedImages.length, product.id, product.slug]);

  const handleClick = (e) => {
    recordProductInteraction(product);
    if (onProductClick) {
      // Allow user to open in new tab with Cmd/Ctrl/Shift/middle-click
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
        return;
      }
      e.preventDefault();
      onProductClick(product);
    }
  };

  return (
    <article
      className={`product-card ${outOfStock ? 'product-card--out' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={`/product/${product.slug}`}
        onClick={handleClick}
        className="product-card__link"
        aria-label={`View ${product.name}`}
      >
        {/* Image Wrap */}
        <div className="product-card__image-wrap">
          {sortedImages.map((img, idx) => (
            <img
              key={img.id || img.url || idx}
              src={getOptimizedImageUrl(img.url, 600)}
              alt={`${product.name} - view ${idx + 1}`}
              className={`product-card__image ${idx === activeImageIndex ? 'product-card__image--active' : ''}`}
              loading={idx === 0 ? 'lazy' : 'eager'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=60';
              }}
            />
          ))}

          {/* Multiple Images Dots Indicator */}
          {hasMultipleImages && (
            <div className="product-card__image-dots" aria-hidden="true">
              {sortedImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`product-card__dot ${idx === activeImageIndex ? 'product-card__dot--active' : ''}`}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          {isNew && (
            <div className="product-card__badges">
              <span className="badge badge--new">New</span>
            </div>
          )}

          {outOfStock && (
            <div className="product-card__out-overlay">
              <span>Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-card__info">
          <span className="product-card__brand">{product.brand}</span>
          <h3 className="product-card__name">{product.name}</h3>

          {/* Available Colours */}
          {coloursList.length > 0 && (
            <div
              className="product-card__colours"
              title={coloursList.join(', ')}
            >
              <span className="product-card__colour-label">
                {coloursList.length === 1 ? '1 Colour' : `${coloursList.length} Colours`}
              </span>
            </div>
          )}

          <div className="price">
            <span className="price__current">{formatPrice(product.price)}</span>
            {product.previousPrice && product.previousPrice > product.price && (
              <span className="price__previous">{formatPrice(product.previousPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}


