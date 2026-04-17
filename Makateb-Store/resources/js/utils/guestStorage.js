/**
 * Utility for managing guest cart and wishlist in localStorage
 * This ensures data persists across page refreshes for non-authenticated users
 */

const CART_STORAGE_KEY = 'guest_cart';
const WISHLIST_STORAGE_KEY = 'guest_wishlist';

/**
 * Get guest cart from localStorage
 */
export function getGuestCart() {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error reading guest cart from localStorage:', error);
    return [];
  }
}

/**
 * Save guest cart to localStorage
 */
export function saveGuestCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving guest cart to localStorage:', error);
  }
}

/**
 * Add item to guest cart in localStorage
 */
export function addToGuestCart(item) {
  const cart = getGuestCart();
  
  // Check if item already exists (by product_id or package_id)
  const existingIndex = cart.findIndex(cartItem => {
    if (item.product_id && cartItem.product_id === item.product_id) {
      return true;
    }
    if (item.package_id && cartItem.package_id === item.package_id) {
      return true;
    }
    return false;
  });
  
  if (existingIndex !== -1) {
    // Update quantity if exists
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + (item.quantity || 1);
  } else {
    // Add new item
    cart.push({
      id: item.id || `guest_${Date.now()}_${Math.random()}`,
      product_id: item.product_id || null,
      package_id: item.package_id || null,
      quantity: item.quantity || 1,
    });
  }
  
  saveGuestCart(cart);
  return cart;
}

/**
 * Update item quantity in guest cart
 */
export function updateGuestCartItem(id, quantity) {
  const cart = getGuestCart();
  const itemIndex = cart.findIndex(item => item.id === id);
  
  if (itemIndex !== -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    saveGuestCart(cart);
  }
  
  return cart;
}

/**
 * Remove item from guest cart
 */
export function removeFromGuestCart(id) {
  const cart = getGuestCart();
  const filtered = cart.filter(item => item.id !== id);
  saveGuestCart(filtered);
  return filtered;
}

/**
 * Clear guest cart
 */
export function clearGuestCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
}

/**
 * Get guest wishlist from localStorage
 */
export function getGuestWishlist() {
  try {
    const wishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Error reading guest wishlist from localStorage:', error);
    return [];
  }
}

/**
 * Save guest wishlist to localStorage
 */
export function saveGuestWishlist(wishlist) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  } catch (error) {
    console.error('Error saving guest wishlist to localStorage:', error);
  }
}

/**
 * Add item to guest wishlist in localStorage
 */
export function addToGuestWishlist(item) {
  const wishlist = getGuestWishlist();
  
  // Check if already exists
  const exists = wishlist.some(wishlistItem => {
    if (item.product_id && wishlistItem.product_id === item.product_id) {
      return true;
    }
    if (item.package_id && wishlistItem.package_id === item.package_id) {
      return true;
    }
    return false;
  });
  
  if (!exists) {
    wishlist.push({
      id: item.id || `guest_${Date.now()}_${Math.random()}`,
      product_id: item.product_id || null,
      package_id: item.package_id || null,
    });
    saveGuestWishlist(wishlist);
  }
  
  return wishlist;
}

/**
 * Remove item from guest wishlist
 */
export function removeFromGuestWishlist(productId, packageId) {
  const wishlist = getGuestWishlist();
  const filtered = wishlist.filter(item => {
    if (productId && item.product_id === productId) return false;
    if (packageId && item.package_id === packageId) return false;
    return true;
  });
  saveGuestWishlist(filtered);
  return filtered;
}

/**
 * Check if item is in guest wishlist
 */
export function isInGuestWishlist(productId, packageId) {
  const wishlist = getGuestWishlist();
  return wishlist.some(item => {
    if (productId && item.product_id === productId) return true;
    if (packageId && item.package_id === packageId) return true;
    return false;
  });
}

/**
 * Clear guest wishlist
 */
export function clearGuestWishlist() {
  localStorage.removeItem(WISHLIST_STORAGE_KEY);
}

/**
 * Sync guest cart with backend session
 * Merges localStorage data with backend session data
 */
export async function syncGuestCartWithBackend() {
  try {
    const localCart = getGuestCart();
    if (localCart.length === 0) return [];
    
    // Send localStorage cart to backend to merge with session
    const response = await window.axios.post('/cart/sync-guest', {
      items: localCart
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error syncing guest cart with backend:', error);
    return localCart;
  }
}

/**
 * Sync guest wishlist with backend session
 */
export async function syncGuestWishlistWithBackend() {
  try {
    const localWishlist = getGuestWishlist();
    if (localWishlist.length === 0) return [];
    
    // Send localStorage wishlist to backend to merge with session
    const response = await window.axios.post('/wishlist/sync-guest', {
      items: localWishlist
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error syncing guest wishlist with backend:', error);
    return localWishlist;
  }
}

