import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Minus, Plus, ChevronRight, AlertCircle } from 'lucide-react';
import { getProduct } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { formatPrice, calcDiscount, getGenderLabel, getOptimizedImageUrl } from '../../utils/helpers';
import ProductCard from '../../components/product/ProductCard';
import '../../components/product/ProductCard.css';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColour, setSelectedColour] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelectedImage(0);
    setSelectedSize('');
    setSelectedColour('');
    setQuantity(1);
    setSizeError('');

    getProduct(slug)
      .then((res) => {
        setProduct(res.data.data.product);
        setRelated(res.data.data.related);
        // Auto-select colour if only one
        if (res.data.data.product.colours?.length === 1) {
          setSelectedColour(res.data.data.product.colours[0].colour);
        }
      })
      .catch((err) => {
        setError(err.response?.status === 404 ? 'Product not found.' : 'Failed to load product.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError('Please select a size');
      return;
    }
    setSizeError('');
    addItem(product, selectedSize, selectedColour, quantity);
  };

  if (loading) {
    return (
      <div className="pdp-skeleton container">
        <div className="pdp-skeleton__gallery">
          <div className="skeleton skeleton--image" />
        </div>
        <div className="pdp-skeleton__info">
          <div className="skeleton skeleton--text" style={{ width: '60px' }} />
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--text" style={{ width: '120px' }} />
          <div className="skeleton" style={{ height: '80px', marginTop: '20px' }} />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <AlertCircle size={48} className="empty-state__icon" />
        <h2 className="empty-state__title">{error || 'Product not found'}</h2>
        <p className="empty-state__message">This product may no longer be available.</p>
        <Link to="/shop" className="btn btn--primary">Browse Products</Link>
      </div>
    );
  }

  const discount = calcDiscount(product.price, product.previousPrice);
  const outOfStock = product.stockQuantity === 0;
  const images = product.images?.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', isPrimary: true }];

  return (
    <>
      <Helmet>
        <title>{`${product.name} by ${product.brand} — Luxurybyire`}</title>
        <meta name="description" content={`Shop ${product.name} by ${product.brand} at Luxurybyire. ${product.description?.substring(0, 120)}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            brand: { '@type': 'Brand', name: product.brand },
            description: product.description,
            image: images[0]?.url,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'NGN',
              availability: outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
            },
          })}
        </script>
      </Helmet>

      <div className="pdp">
        {/* Breadcrumb */}
        <nav className="pdp-breadcrumb container" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop">Shop</Link>
          <ChevronRight size={14} />
          <Link to={`/shop?category=${product.category?.slug}`}>{product.category?.name}</Link>
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </nav>

        <div className="pdp__main container">
          {/* Gallery */}
          <div className="pdp-gallery">
            <div className="pdp-gallery__main">
              <img
                src={getOptimizedImageUrl(images[selectedImage]?.url, 1000)}
                alt={product.name}
                className="pdp-gallery__image"
              />
              {discount > 0 && <span className="badge badge--sale pdp-gallery__badge">-{discount}%</span>}
              {product.isNewArrival && <span className="badge badge--new pdp-gallery__badge-new">New</span>}
            </div>

            {images.length > 1 && (
              <div className="pdp-gallery__thumbs">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`pdp-gallery__thumb ${idx === selectedImage ? 'pdp-gallery__thumb--active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={getOptimizedImageUrl(img.url, 160)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="pdp-info">
            <span className="pdp-info__brand">{product.brand}</span>
            <h1 className="pdp-info__name">{product.name}</h1>

            <div className="pdp-info__meta">
              <Link to={`/shop?category=${product.category?.slug}`} className="pdp-info__category">
                {product.category?.name}
              </Link>
              <span className="pdp-info__gender">{getGenderLabel(product.gender)}</span>
            </div>

            {/* Price */}
            <div className="pdp-info__price price">
              <span className="price__current" style={{ fontSize: 'var(--text-2xl)' }}>
                {formatPrice(product.price)}
              </span>
              {product.previousPrice && product.previousPrice > product.price && (
                <>
                  <span className="price__previous">{formatPrice(product.previousPrice)}</span>
                  <span className="price__discount">-{discount}% off</span>
                </>
              )}
            </div>

            {/* Stock Status */}
            {outOfStock ? (
              <div className="pdp-info__stock pdp-info__stock--out">
                <AlertCircle size={16} /> Out of Stock
              </div>
            ) : (
              <div className="pdp-info__stock pdp-info__stock--in">
                {product.stockQuantity <= 5 ? `Only ${product.stockQuantity} left` : 'In Stock'}
              </div>
            )}

            {/* Description */}
            <p className="pdp-info__description">{product.description}</p>

            {!outOfStock && (
              <>
                {/* Colour Selection */}
                {product.colours?.length > 0 && (
                  <div className="pdp-info__section">
                    <h4 className="pdp-info__section-title">
                      Colour: <span>{selectedColour || 'Select a colour'}</span>
                    </h4>
                    <div className="size-grid">
                      {product.colours.map((c) => (
                        <button
                          key={c.id}
                          className={`size-option ${selectedColour === c.colour ? 'size-option--selected' : ''}`}
                          onClick={() => setSelectedColour(c.colour)}
                        >
                          {c.colour}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {product.sizes?.length > 0 && (
                  <div className="pdp-info__section">
                    <h4 className="pdp-info__section-title">
                      Size: <span>{selectedSize || 'Select a size'}</span>
                    </h4>
                    <div className="size-grid">
                      {product.sizes.map((s) => (
                        <button
                          key={s.id}
                          className={`size-option ${selectedSize === s.size ? 'size-option--selected' : ''}`}
                          onClick={() => { setSelectedSize(s.size); setSizeError(''); }}
                        >
                          {s.size}
                        </button>
                      ))}
                    </div>
                    {sizeError && <p className="input-error" style={{ marginTop: '8px' }}>{sizeError}</p>}
                  </div>
                )}

                {/* Quantity */}
                <div className="pdp-info__section">
                  <h4 className="pdp-info__section-title">Quantity</h4>
                  <div className="qty-selector">
                    <button
                      className="qty-selector__btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="qty-selector__value">{quantity}</span>
                    <button
                      className="qty-selector__btn"
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      disabled={quantity >= product.stockQuantity}
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <button className="btn btn--primary btn--lg btn--full pdp-info__add-btn" onClick={handleAddToCart}>
                  <ShoppingBag size={18} />
                  Add to Cart — {formatPrice(product.price * quantity)}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <span className="section-eyebrow">You May Also Like</span>
                <h2 className="section-title">Related Products</h2>
              </div>
              <div className="product-grid">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
