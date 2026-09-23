import { create } from 'zustand';
import { useToastStore } from './useToastStore';

export const useCartStore = create((set, get) => ({
  cart: JSON.parse(localStorage.getItem('nec_cart')) || [],

  saveCart: (cart) => {
    localStorage.setItem('nec_cart', JSON.stringify(cart));
    set({ cart });
  },

  addToCart: (product, qty = 1) => {
    const currentCart = get().cart;
    const existingIndex = currentCart.findIndex((item) => item.productId === product.id);

    const availableStock = product.quantity;
    if (availableStock <= 0) {
      useToastStore.getState().addToast(`"${product.name}" is currently out of stock.`, 'error');
      return;
    }

    if (existingIndex > -1) {
      const existingItem = currentCart[existingIndex];
      const newQty = existingItem.quantity + qty;

      if (newQty > availableStock) {
        useToastStore.getState().addToast(
          `Cannot add more items. Maximum stock available is ${availableStock}.`,
          'warning'
        );
        return;
      }

      const updatedCart = [...currentCart];
      updatedCart[existingIndex] = { ...existingItem, quantity: newQty };
      get().saveCart(updatedCart);
      useToastStore.getState().addToast(`Updated ${product.name} quantity to ${newQty}.`, 'success');
    } else {
      if (qty > availableStock) {
        useToastStore.getState().addToast(
          `Cannot add ${qty} items. Maximum stock available is ${availableStock}.`,
          'warning'
        );
        return;
      }
      const newItem = {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.sellingPrice),
        image: product.image,
        category: product.Category ? product.Category.name : 'Stationery',
        stock: availableStock,
        quantity: qty
      };
      get().saveCart([...currentCart, newItem]);
      useToastStore.getState().addToast(`Added "${product.name}" to your cart!`, 'success');
    }
  },

  updateQuantity: (productId, delta) => {
    const currentCart = get().cart;
    const updatedCart = currentCart.map((item) => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.stock) {
          useToastStore.getState().addToast(
            `Cannot exceed maximum available stock of ${item.stock}.`,
            'warning'
          );
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    });
    get().saveCart(updatedCart);
  },

  removeFromCart: (productId) => {
    const currentCart = get().cart;
    const itemToRemove = currentCart.find(i => i.productId === productId);
    const updatedCart = currentCart.filter((item) => item.productId !== productId);
    get().saveCart(updatedCart);
    if (itemToRemove) {
      useToastStore.getState().addToast(`Removed "${itemToRemove.name}" from cart.`, 'info');
    }
  },

  clearCart: () => {
    localStorage.removeItem('nec_cart');
    set({ cart: [] });
  },

  getTotalPrice: () => {
    return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getTotalCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  }
}));
