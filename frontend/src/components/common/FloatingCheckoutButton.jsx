import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../utils/helpers';
import './FloatingCheckoutButton.css';

export default function FloatingCheckoutButton() {
  const { itemCount, subtotal } = useCart();
  const location = useLocation();

  // Hide if no items or if already on checkout or admin pages
  const isHidden =
    itemCount === 0 ||
    location.pathname === '/checkout' ||
    location.pathname.startsWith('/admin');

  return (
    <AnimatePresence>
      {!isHidden && (
        <div className="floating-checkout-wrapper">
          <motion.div
            className="floating-checkout"
            initial={{ opacity: 0, y: 40, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.88 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 26,
              mass: 0.8,
            }}
          >
            <Link
              to="/checkout"
              className="floating-checkout__btn"
              aria-label={`Checkout ${itemCount} items, total ${formatPrice(subtotal)}`}
            >
              {/* Animated glass shimmer light */}
              <span className="floating-checkout__shimmer" aria-hidden="true" />

              {/* Shopping Bag Icon with Animated Count Badge */}
              <div className="floating-checkout__icon-wrap">
                <ShoppingBag size={17} className="floating-checkout__icon" />
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="floating-checkout__badge"
                >
                  {itemCount}
                </motion.span>
              </div>

              {/* Checkout CTA Text */}
              <span className="floating-checkout__label">Checkout</span>

              {/* Elegant Divider */}
              <span className="floating-checkout__divider" aria-hidden="true" />

              {/* Live Subtotal */}
              <span className="floating-checkout__price">{formatPrice(subtotal)}</span>

              {/* Directional Action Arrow */}
              <div className="floating-checkout__arrow-wrap" aria-hidden="true">
                <ArrowRight size={15} className="floating-checkout__arrow" />
              </div>
            </Link>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
