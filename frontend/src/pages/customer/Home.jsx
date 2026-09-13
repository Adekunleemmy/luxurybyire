import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Shield, Truck, Star, HeadphonesIcon, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProducts, getCategories, getSettings } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import '../../components/product/ProductCard.css';
import './Home.css';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ isFeatured: 'true', limit: 8 }),
      getProducts({ isNewArrival: 'true', sort: 'newest', limit: 8 }),
      getCategories(),
      getSettings(),
    ])
      .then(([featuredRes, newRes, catRes, settingsRes]) => {
        setFeatured(featuredRes.data.data.products);
        setNewArrivals(newRes.data.data.products);
        setCategories(catRes.data.data);
        setSettings(settingsRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const brands = ['Nike', 'Adidas', 'New Balance', 'Puma', 'Converse', 'Timberland'];

  return (
    <>
      <Helmet>
        <title>Luxurybyire — Premium Footwear for Men & Women</title>
        <meta name="description" content="Shop authentic premium footwear from Nigeria's trusted luxury shoe store. Nike, Adidas, and more — delivered to your doorstep." />
      </Helmet>

      {/* ── Hero Section ──────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg">
          <img
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&q=80"
            alt="Premium footwear collection"
            className="hero__bg-image"
          />
          <div className="hero__overlay" />
        </div>

        <div className="hero__content container">
          <motion.div className="hero__text" {...fadeInUp}>
            <span className="hero__eyebrow">Premium Footwear</span>
            <h1 className="hero__title">Luxurybyire</h1>
            <p className="hero__subtitle">
              Curated footwear for men and women who demand quality, style, and authenticity.
            </p>
            <div className="hero__actions">
              <Link to="/shop" className="btn btn--primary btn--lg hero__cta">
                Shop Collection
                <ArrowRight size={18} />
              </Link>
              <Link to="/shop?isNewArrival=true" className="btn btn--secondary btn--lg hero__cta hero__cta--secondary">
                New Arrivals
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Collection ───────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div className="section-header" {...fadeInUp} viewport={{ once: true }}>
            <span className="section-eyebrow">Curated Selection</span>
            <div className="section-header__row">
              <h2 className="section-title">Featured Collection</h2>
              <Link to="/shop?isFeatured=true" className="section-link">
                View All <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {loading ? (
            <div className="product-grid-skeleton">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="product-card-skeleton__image" />
                  <div className="product-card-skeleton__brand" />
                  <div className="product-card-skeleton__name" />
                  <div className="product-card-skeleton__price" />
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {featured.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Just In</span>
              <div className="section-header__row">
                <h2 className="section-title">New Arrivals</h2>
                <Link to="/shop?isNewArrival=true&sort=newest" className="section-link">
                  View All <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="product-grid">
              {newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Shop by Category ─────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <span className="section-eyebrow">Browse</span>
            <h2 className="section-title">Shop by Category</h2>
          </div>

          <div className="category-grid">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="category-card">
                <div className="category-card__overlay" />
                <div className="category-card__content">
                  <h3 className="category-card__name">{cat.name}</h3>
                  <span className="category-card__count">
                    {cat._count?.products || 0} products
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brands ────────────────────────────────────── */}
      <section className="section brands-section" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <span className="section-eyebrow">We Carry</span>
            <h2 className="section-title">Featured Brands</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Authentic footwear from the world's most respected brands.
            </p>
          </div>

          <div className="brands-grid">
            {brands.map((brand) => (
              <Link
                key={brand}
                to={`/shop?brand=${encodeURIComponent(brand)}`}
                className="brand-item"
              >
                <span className="brand-item__name">{brand}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Luxurybyire ───────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <span className="section-eyebrow">Why Us</span>
            <h2 className="section-title">The Luxurybyire Difference</h2>
          </div>

          <div className="values-grid">
            <div className="value-item">
              <div className="value-item__icon">
                <Shield size={24} />
              </div>
              <h4 className="value-item__title">Authentic Quality</h4>
              <p className="value-item__text">
                Every pair is carefully sourced and verified for authenticity. No compromises.
              </p>
            </div>
            <div className="value-item">
              <div className="value-item__icon">
                <Star size={24} />
              </div>
              <h4 className="value-item__title">Curated Style</h4>
              <p className="value-item__text">
                A carefully selected collection of the finest footwear from premium brands.
              </p>
            </div>
            <div className="value-item">
              <div className="value-item__icon">
                <Truck size={24} />
              </div>
              <h4 className="value-item__title">Reliable Delivery</h4>
              <p className="value-item__text">
                Swift and secure delivery across Lagos and throughout Nigeria.
              </p>
            </div>
            <div className="value-item">
              <div className="value-item__icon">
                <HeadphonesIcon size={24} />
              </div>
              <h4 className="value-item__title">Personal Service</h4>
              <p className="value-item__text">
                Direct WhatsApp communication for a personalised shopping experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────── */}
      <section className="cta-section">
        <div className="container cta-section__inner">
          <h2 className="cta-section__title">Ready to Step Up Your Style?</h2>
          <p className="cta-section__text">
            Browse our collection or reach out directly on WhatsApp.
          </p>
          <div className="cta-section__actions">
            <Link to="/shop" className="btn btn--primary btn--lg">
              Browse Collection
            </Link>
            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--secondary btn--lg cta-section__wa"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
