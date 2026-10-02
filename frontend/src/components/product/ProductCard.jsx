import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getColorCode, getOptimizedImageUrl, isProductNew, recordProductInteraction } from '../../utils/helpers';
import './ProductCard.css';

export default function ProductCard({ product, onProductClick }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredColour, setHoveredColour] = useState(null);

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
    if (!isHovered || !hasMultipleImages) {
      setActiveImageIndex(0);
      return;
    }

    // Switch to second image after a brief hover (700ms) so customer immediately notices
    const initialTimer = setTimeout(() => {
      setActiveImageIndex(1);
    }, 700);

    // If customer continues hovering, smoothly cycle through all angles every 2 seconds
    let intervalTimer;
    const cycleTimer = setTimeout(() => {
      intervalTimer = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % sortedImages.length);
      }, 2000);
    }, 700);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(cycleTimer);
      if (intervalTimer) clearInterval(intervalTimer);
    };
  }, [isHovered, hasMultipleImages, sortedImages.length]);

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
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredColour(null);
      }}
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
              onMouseLeave={() => setHoveredColour(null)}
              title={coloursList.join(', ')}
            >
              <div className="product-card__colour-swatches" aria-label={`Available in: ${coloursList.join(', ')}`}>
                {coloursList.slice(0, 4).map((colourName, idx) => (
                  <span
                    key={idx}
                    className={`product-card__colour-swatch ${hoveredColour === colourName ? 'product-card__colour-swatch--active' : ''}`}
                    style={{ background: getColorCode(colourName) }}
                    title={colourName}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      setHoveredColour(colourName);
                    }}
                  />
                ))}
                {coloursList.length > 4 && (
                  <span className="product-card__colour-more">
                    +{coloursList.length - 4}
                  </span>
                )}
              </div>
              <span className="product-card__colour-label">
                {hoveredColour || (coloursList.length === 1 ? coloursList[0] : `${coloursList.length} Colours`)}
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

