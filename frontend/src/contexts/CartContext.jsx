import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

const STORAGE_KEY = 'luxurybyire_cart';

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback((product, size, colour, quantity = 1) => {
    setItems((prev) => {
      // Check if same product+size+colour already in cart
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.size === size &&
          item.colour === colour
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        toast.success('Cart updated');
        return updated;
      }

      const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

      toast.success('Added to cart');
      return [
        ...prev,
        {
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          brand: product.brand,
          price: product.price,
          image: primaryImage?.url || '',
          size,
          colour,
          quantity,
          maxStock: product.stockQuantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId, size, colour) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.size === size && item.colour === colour)
      )
    );
    toast.success('Removed from cart');
  }, []);

  const updateQuantity = useCallback((productId, size, colour, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.size === size && item.colour === colour
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
