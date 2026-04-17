import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useAppStore = defineStore('app', () => {
  // State
  const user = ref(null);
  const cart = ref([]);
  const wishlist = ref([]);
  const orders = ref([]);
  const theme = ref('light');
  const chatMessages = ref([]);
  const searchQuery = ref('');
  const currentPage = ref('home');
  const selectedId = ref('');

  // Load from localStorage on mount
  const loadFromStorage = () => {
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    const savedOrders = localStorage.getItem('orders');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedUser) user.value = JSON.parse(savedUser);
    if (savedCart) cart.value = JSON.parse(savedCart);
    if (savedWishlist) wishlist.value = JSON.parse(savedWishlist);
    if (savedOrders) orders.value = JSON.parse(savedOrders);
    if (savedTheme) theme.value = savedTheme;
  };

  // Save to localStorage when state changes
  watch(user, (newUser) => {
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  }, { deep: true });

  watch(cart, (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
  }, { deep: true });

  watch(wishlist, (newWishlist) => {
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  }, { deep: true });

  watch(orders, (newOrders) => {
    localStorage.setItem('orders', JSON.stringify(newOrders));
  }, { deep: true });

  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  });

  // Computed
  const cartCount = computed(() => {
    return cart.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  // Actions
  const setUser = (newUser) => {
    user.value = newUser;
  };

  const addToCart = (item) => {
    const existing = cart.value.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.value.push({ ...item });
    }
  };

  const removeFromCart = (id) => {
    cart.value = cart.value.filter(item => item.id !== id);
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const item = cart.value.find(i => i.id === id);
    if (item) {
      item.quantity = quantity;
    }
  };

  const clearCart = () => {
    cart.value = [];
  };

  const toggleWishlist = (productId) => {
    const index = wishlist.value.indexOf(productId);
    if (index > -1) {
      wishlist.value.splice(index, 1);
    } else {
      wishlist.value.push(productId);
    }
  };

  const addOrder = (order) => {
    orders.value.unshift(order);
  };

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  const addChatMessage = (message) => {
    chatMessages.value.push(message);
  };

  const setSearchQuery = (query) => {
    searchQuery.value = query;
  };

  const updateProductSearchCount = (productId) => {
    // In a real app, this would update the backend
    console.log('Search count updated for product:', productId);
  };

  const navigate = (page, id = null) => {
    if (page === 'logout') {
      setUser(null);
      currentPage.value = 'home';
      return;
    }
    currentPage.value = page;
    if (id) selectedId.value = id;
  };

  // Initialize
  loadFromStorage();

  return {
    // State
    user,
    cart,
    wishlist,
    orders,
    theme,
    chatMessages,
    searchQuery,
    currentPage,
    selectedId,
    // Computed
    cartCount,
    // Actions
    setUser,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleWishlist,
    addOrder,
    toggleTheme,
    addChatMessage,
    setSearchQuery,
    updateProductSearchCount,
    navigate,
  };
});



