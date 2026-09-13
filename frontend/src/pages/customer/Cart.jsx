import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../utils/helpers';
import './Cart.css';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <>
        <Helmet><title>Cart — Luxurybyire</title></Helmet>
        <div className="empty-state page">
          <ShoppingBag size={56} className="empty-state__icon" />
          <h2 className="empty-state__title">Your cart is empty</h2>
          <p className="empty-state__message">Looks like you haven't added anything yet. Start exploring our collection.</p>
          <Link to="/shop" className="btn btn--primary">Start Shopping</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>{`Cart (${items.length}) — Luxurybyire`}</title></Helmet>
      <div className="cart-page container">
        <h1 className="cart-page__title">Shopping Cart</h1>
        <p className="cart-page__count">{items.length} item{items.length !== 1 ? 's' : ''}</p>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.colour}`} className="cart-item">
                <Link to={`/product/${item.productSlug}`} className="cart-item__image-link">
                  <img src={item.image} alt={item.productName} className="cart-item__image" loading="lazy" />
                </Link>
                <div className="cart-item__info">
                  <div className="cart-item__top">
                    <div>
                      <span className="cart-item__brand">{item.brand}</span>
                      <Link to={`/product/${item.productSlug}`} className="cart-item__name">{item.productName}</Link>
                      <div className="cart-item__meta">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.colour && <span>Colour: {item.colour}</span>}
                      </div>
                    </div>
                    <button className="btn btn--icon cart-item__remove" onClick={() => removeItem(item.productId, item.size, item.colour)} aria-label="Remove item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="cart-item__bottom">
                    <div className="qty-selector">
                      <button className="qty-selector__btn" onClick={() => updateQuantity(item.productId, item.size, item.colour, item.quantity - 1)} disabled={item.quantity <= 1}><Minus size={14} /></button>
                      <span className="qty-selector__value">{item.quantity}</span>
                      <button className="qty-selector__btn" onClick={() => updateQuantity(item.productId, item.size, item.colour, item.quantity + 1)}><Plus size={14} /></button>
                    </div>
                    <span className="cart-item__price">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h3 className="cart-summary__title">Order Summary</h3>
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="cart-summary__row cart-summary__row--muted">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="cart-summary__divider" />
            <div className="cart-summary__row cart-summary__row--total">
              <span>Estimated Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Link to="/checkout" className="btn btn--primary btn--lg btn--full cart-summary__checkout">
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="btn btn--ghost btn--full cart-summary__continue">
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
