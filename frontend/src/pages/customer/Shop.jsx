import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { getProducts, getCategories, getBrands } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { useDebounce, useMediaQuery, useScrollLock } from '../../hooks/useCommon';
import { formatPrice } from '../../utils/helpers';
import '../../components/product/ProductCard.css';
import './Shop.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
];

const GENDER_OPTIONS = ['Men', 'Women', 'Unisex'];
const SIZE_OPTIONS = ['36','37','38','39','40','41','42','43','44','45'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  useScrollLock(filterOpen && isMobile);

  // Read filters from URL
  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    gender: searchParams.get('gender') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: searchParams.get('size') || '',
    inStock: searchParams.get('inStock') || '',
    isSale: searchParams.get('isSale') || '',
    isFeatured: searchParams.get('isFeatured') || '',
    isNewArrival: searchParams.get('isNewArrival') || '',
    sort: searchParams.get('sort') || 'featured',
    page: searchParams.get('page') || '1',
  };

  const debouncedSearch = useDebounce(filters.search, 400);

  // Load filter options
  useEffect(() => {
    Promise.all([getCategories(), getBrands()])
      .then(([catRes, brandsRes]) => {
        setCategories(catRes.data.data);
        setBrandsList(brandsRes.data.data);
      })
      .catch(() => {});
  }, []);

  // Load products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.gender) params.gender = filters.gender;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.size) params.size = filters.size;
      if (filters.inStock) params.inStock = filters.inStock;
      if (filters.isSale) params.isSale = filters.isSale;
      if (filters.isFeatured) params.isFeatured = filters.isFeatured;
      if (filters.isNewArrival) params.isNewArrival = filters.isNewArrival;
      params.sort = filters.sort;
      params.page = filters.page;
      params.limit = 12;

      const res = await getProducts(params);
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.category, filters.brand, filters.gender, filters.minPrice, filters.maxPrice, filters.size, filters.inStock, filters.isSale, filters.isFeatured, filters.isNewArrival, filters.sort, filters.page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const activeFilterCount = [
    filters.category, filters.brand, filters.gender,
    filters.minPrice, filters.maxPrice, filters.size,
    filters.inStock, filters.isSale, filters.isFeatured, filters.isNewArrival,
  ].filter(Boolean).length;

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build title based on active filters
  let pageTitle = 'Shop';
  if (filters.category) {
    const cat = categories.find(c => c.slug === filters.category);
    pageTitle = cat ? cat.name : 'Shop';
  }
  if (filters.search) pageTitle = `Search: "${filters.search}"`;

  const FilterContent = () => (
    <div className="shop-filters__body">
      {/* Category */}
      <div className="filter-group">
        <h4 className="filter-group__title">Category</h4>
        <div className="filter-group__options">
          <button
            className={`filter-option ${!filters.category ? 'filter-option--active' : ''}`}
            onClick={() => updateFilter('category', '')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-option ${filters.category === cat.slug ? 'filter-option--active' : ''}`}
              onClick={() => updateFilter('category', cat.slug)}
            >
              {cat.name}
              <span className="filter-option__count">{cat._count?.products}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className="filter-group">
        <h4 className="filter-group__title">Brand</h4>
        <div className="filter-group__options">
          <button
            className={`filter-option ${!filters.brand ? 'filter-option--active' : ''}`}
            onClick={() => updateFilter('brand', '')}
          >
            All Brands
          </button>
          {brandsList.map((brand) => (
            <button
              key={brand}
              className={`filter-option ${filters.brand === brand ? 'filter-option--active' : ''}`}
              onClick={() => updateFilter('brand', brand)}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="filter-group">
        <h4 className="filter-group__title">Gender</h4>
        <div className="filter-group__options filter-group__options--row">
          <button
            className={`filter-option ${!filters.gender ? 'filter-option--active' : ''}`}
            onClick={() => updateFilter('gender', '')}
          >
            All
          </button>
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g}
              className={`filter-option ${filters.gender?.toLowerCase() === g.toLowerCase() ? 'filter-option--active' : ''}`}
              onClick={() => updateFilter('gender', g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="filter-group">
        <h4 className="filter-group__title">Size</h4>
        <div className="filter-group__options filter-group__options--sizes">
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              className={`filter-size-btn ${filters.size === s ? 'filter-size-btn--active' : ''}`}
              onClick={() => updateFilter('size', filters.size === s ? '' : s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <h4 className="filter-group__title">Price Range</h4>
        <div className="filter-price-inputs">
          <input
            type="number"
            className="input-field"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
          />
          <span>—</span>
          <input
            type="number"
            className="input-field"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="filter-group">
        <h4 className="filter-group__title">Quick Filters</h4>
        <div className="filter-group__options">
          <button
            className={`filter-option ${filters.inStock === 'true' ? 'filter-option--active' : ''}`}
            onClick={() => updateFilter('inStock', filters.inStock === 'true' ? '' : 'true')}
          >
            In Stock Only
          </button>
          <button
            className={`filter-option ${filters.isSale === 'true' ? 'filter-option--active' : ''}`}
            onClick={() => updateFilter('isSale', filters.isSale === 'true' ? '' : 'true')}
          >
            On Sale
          </button>
          <button
            className={`filter-option ${filters.isNewArrival === 'true' ? 'filter-option--active' : ''}`}
            onClick={() => updateFilter('isNewArrival', filters.isNewArrival === 'true' ? '' : 'true')}
          >
            New Arrivals
          </button>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button className="btn btn--ghost btn--sm btn--full" onClick={clearAllFilters}>
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{`${pageTitle} — Luxurybyire`}</title>
        <meta name="description" content={`Shop premium footwear at Luxurybyire. Browse our ${pageTitle.toLowerCase()} collection.`} />
      </Helmet>

      <div className="shop-page">
        <div className="container">
          {/* Page Header */}
          <div className="shop-header">
            <div>
              <h1 className="shop-header__title">{pageTitle}</h1>
              <p className="shop-header__count">
                {pagination.total !== undefined ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''}` : ''}
              </p>
            </div>

            <div className="shop-header__controls">
              {/* Mobile Filter Toggle */}
              {isMobile && (
                <button
                  className="btn btn--ghost shop-filter-toggle"
                  onClick={() => setFilterOpen(true)}
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="shop-filter-toggle__count">{activeFilterCount}</span>
                  )}
                </button>
              )}

              {/* Sort */}
              <div className="shop-sort">
                <select
                  className="input-field shop-sort__select"
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  aria-label="Sort products"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="shop-layout">
            {/* Desktop Filter Sidebar */}
            {!isMobile && (
              <aside className="shop-filters">
                <div className="shop-filters__header">
                  <h3 className="shop-filters__title">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button className="btn btn--ghost btn--sm" onClick={clearAllFilters}>
                      Clear all
                    </button>
                  )}
                </div>
                <FilterContent />
              </aside>
            )}

            {/* Product Grid */}
            <main className="shop-products">
              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="active-filters">
                  {filters.category && (
                    <button className="active-filter" onClick={() => updateFilter('category', '')}>
                      {categories.find(c => c.slug === filters.category)?.name || filters.category}
                      <X size={12} />
                    </button>
                  )}
                  {filters.brand && (
                    <button className="active-filter" onClick={() => updateFilter('brand', '')}>
                      {filters.brand} <X size={12} />
                    </button>
                  )}
                  {filters.gender && (
                    <button className="active-filter" onClick={() => updateFilter('gender', '')}>
                      {filters.gender} <X size={12} />
                    </button>
                  )}
                  {filters.size && (
                    <button className="active-filter" onClick={() => updateFilter('size', '')}>
                      Size {filters.size} <X size={12} />
                    </button>
                  )}
                  {filters.isSale === 'true' && (
                    <button className="active-filter" onClick={() => updateFilter('isSale', '')}>
                      On Sale <X size={12} />
                    </button>
                  )}
                  {filters.isNewArrival === 'true' && (
                    <button className="active-filter" onClick={() => updateFilter('isNewArrival', '')}>
                      New Arrivals <X size={12} />
                    </button>
                  )}
                </div>
              )}

              {loading ? (
                <div className="product-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i}>
                      <div className="product-card-skeleton__image" />
                      <div className="product-card-skeleton__brand" />
                      <div className="product-card-skeleton__name" />
                      <div className="product-card-skeleton__price" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state__icon">
                    <SlidersHorizontal size={48} />
                  </div>
                  <h3 className="empty-state__title">No products found</h3>
                  <p className="empty-state__message">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  <button className="btn btn--primary" onClick={clearAllFilters}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="product-grid">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="shop-pagination">
                      <button
                        className="btn btn--ghost btn--sm"
                        disabled={pagination.page <= 1}
                        onClick={() => goToPage(pagination.page - 1)}
                      >
                        Previous
                      </button>
                      <span className="shop-pagination__info">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                      <button
                        className="btn btn--ghost btn--sm"
                        disabled={pagination.page >= pagination.pages}
                        onClick={() => goToPage(pagination.page + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {isMobile && filterOpen && (
          <div className="filter-drawer-overlay" onClick={() => setFilterOpen(false)}>
            <div className="filter-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="filter-drawer__header">
                <h3>Filters</h3>
                <button className="btn btn--icon" onClick={() => setFilterOpen(false)} aria-label="Close filters">
                  <X size={20} />
                </button>
              </div>
              <FilterContent />
              <div className="filter-drawer__footer">
                <button className="btn btn--primary btn--full" onClick={() => setFilterOpen(false)}>
                  Show Results ({pagination.total || 0})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
