import { Link } from 'react-router-dom';
import { formatPrice, calcDiscount, getOptimizedImageUrl } from '../../utils/helpers';
import './ProductCard.css';

export default function ProductCard({ product, onProductClick }) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const imageUrl = getOptimizedImageUrl(primaryImage?.url, 600) || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=60';
  const discount = calcDiscount(product.price, product.previousPrice);
  const outOfStock = product.stockQuantity === 0;

  const handleClick = (e) => {
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
    <article className={`product-card ${outOfStock ? 'product-card--out' : ''}`}>
      <Link
        to={`/product/${product.slug}`}
        onClick={handleClick}
        className="product-card__link"
        aria-label={`View ${product.name}`}
      >
        {/* Image */}
        <div className="product-card__image-wrap">
          <img
            src={imageUrl}
            alt={product.name}
            className="product-card__image"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=60';
            }}
          />

          {/* Badges */}
          <div className="product-card__badges">
            {product.isNewArrival && <span className="badge badge--new">New</span>}
            {discount > 0 && <span className="badge badge--sale">-{discount}%</span>}
          </div>

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
