import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useDebounce, useMediaQuery, useScrollLock, useClickOutside } from '../../hooks/useCommon';
import { getCategories } from '../../services/api';
import './Navbar.css';

const DEFAULT_CATEGORIES = [
  { id: 'cat-boots', name: 'Boots', slug: 'boots' },
  { id: 'cat-casual', name: 'Casual', slug: 'casual' },
  { id: 'cat-formal', name: 'Formal', slug: 'formal' },
  { id: 'cat-sandals', name: 'Sandals', slug: 'sandals' },
  { id: 'cat-sneakers', name: 'Sneakers', slug: 'sneakers' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  const searchInputRef = useRef(null);
  const categoriesRef = useRef(null);
  const debouncedSearch = useDebounce(searchQuery, 400);

  useScrollLock(mobileMenuOpen);
  useClickOutside(categoriesRef, () => setCategoriesOpen(false));

  // Load categories for dropdown & mobile drawer
  useEffect(() => {
    let isMounted = true;
    getCategories()
      .then((res) => {
        if (isMounted && Array.isArray(res?.data?.data) && res.data.data.length > 0) {
          setCategories(res.data.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const displayCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories
      : DEFAULT_CATEGORIES;

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Close mobile menu if resized to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setCategoriesOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Navigate to shop with search query
  useEffect(() => {
    if (debouncedSearch) {
      navigate(`/shop?search=${encodeURIComponent(debouncedSearch)}`);
    }
  }, [debouncedSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">
          {/* Logo */}
          <Link to="/" className="navbar__logo" aria-label="Luxurybyire Home">
            <span className="navbar__logo-text">Luxurybyire</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="navbar__nav" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                  }
                  end={link.to === '/'}
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Categories Dropdown */}
              <div className="navbar__dropdown" ref={categoriesRef}>
                <button
                  type="button"
                  className="navbar__link navbar__link--dropdown"
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  aria-expanded={categoriesOpen}
                >
                  Categories
                  <ChevronDown size={14} className={categoriesOpen ? 'rotate-180' : ''} />
                </button>

                {categoriesOpen && (
                  <div className="navbar__dropdown-menu">
                    <Link
                      to="/shop"
                      className="navbar__dropdown-item"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      All Categories
                    </Link>
                    {displayCategories.map((cat) => (
                      <Link
                        key={cat.id || cat.slug}
                        to={`/shop?category=${cat.slug}`}
                        className="navbar__dropdown-item"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* Actions */}
          <div className="navbar__actions">
            {/* Search Toggle */}
            <button
              type="button"
              className="navbar__action-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search products"
            >
              <Search size={20} />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              className="navbar__action-btn navbar__theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="navbar__action-btn navbar__cart-btn"
              aria-label={`Cart (${itemCount} items)`}
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="navbar__cart-count">{itemCount > 9 ? '9+' : itemCount}</span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="navbar__action-btn navbar__menu-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="navbar__search">
            <form onSubmit={handleSearchSubmit} className="navbar__search-form container">
              <Search size={18} className="navbar__search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="navbar__search-input"
                placeholder="Search shoes, brands, styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
              />
              <button
                type="button"
                className="navbar__search-close"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer Portal */}
      {mobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="navbar__mobile-overlay"
            onClick={() => setMobileMenuOpen(false)}
            aria-modal="true"
            role="dialog"
          >
            <nav
              className="navbar__mobile-menu"
              onClick={(e) => e.stopPropagation()}
              aria-label="Mobile navigation"
            >
              <div className="navbar__mobile-header">
                <Link
                  to="/"
                  className="navbar__mobile-logo"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Luxurybyire
                </Link>
                <button
                  type="button"
                  className="navbar__mobile-close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="navbar__mobile-body">
                <div className="navbar__mobile-links">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                      end={link.to === '/'}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>

                <div className="navbar__mobile-divider" />

                <div className="navbar__mobile-categories">
                  <span className="navbar__mobile-heading">Categories</span>
                  {displayCategories.map((cat) => (
                    <NavLink
                      key={cat.id || cat.slug}
                      to={`/shop?category=${cat.slug}`}
                      className="navbar__mobile-link navbar__mobile-link--sub"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {cat.name}
                    </NavLink>
                  ))}
                </div>
              </div>

              <div className="navbar__mobile-footer">
                <button
                  type="button"
                  className="navbar__mobile-theme-btn"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
                <Link
                  to="/cart"
                  className="navbar__mobile-cart-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingBag size={18} />
                  <span>Cart ({itemCount} items)</span>
                </Link>
              </div>
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
