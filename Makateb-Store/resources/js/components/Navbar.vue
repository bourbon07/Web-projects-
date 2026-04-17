<template>
  <nav 
    class="sticky top-0 z-50 shadow-lg"
    :style="{
      backgroundImage: `url(${woodTexture})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
  >
    <div class="absolute inset-0 bg-gradient-to-r from-amber-900/90 to-amber-950/90" />
    
    <div class="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14 sm:h-16">
        <!-- Logo -->
        <button 
          @click="$router.push('/dashboard')"
          class="flex items-center space-x-1 sm:space-x-2 text-white hover:text-amber-200 transition-colors"
        >
          <svg class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="font-bold text-base sm:text-lg md:text-xl">{{ t('makateb_store') }}</span>
        </button>

        <!-- Desktop Search -->
        <div class="hidden md:flex flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              :placeholder="t('search_products')"
              class="w-full px-4 py-2 pl-10 rounded-lg bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-4">
          <!-- Language Switcher -->
          <button
            @click="toggleLanguage"
            class="p-1.5 sm:p-2 text-white hover:text-amber-200 transition-colors"
            aria-label="Toggle language"
          >
            <span class="text-xs sm:text-sm font-medium">{{ currentLanguage === 'ar' ? 'EN' : 'AR' }}</span>
          </button>
          
          <button
            @click="toggleDarkMode"
            class="p-1.5 sm:p-2 text-white hover:text-amber-200 transition-colors"
            aria-label="Toggle theme"
          >
            <svg v-if="!isDarkMode" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          <!-- Admin Shield Button - Only for Admin Role -->
          <button
            v-if="user?.role === 'admin'"
            @click="$router.push('/admin/manage-site')"
            class="p-1.5 sm:p-2 text-white hover:text-amber-200 transition-colors"
            aria-label="Admin Menu"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </button>

          <button
            @click="handleChatClick"
            class="p-1.5 sm:p-2 text-white hover:text-amber-200 transition-colors relative"
            aria-label="Support chat"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span v-if="unreadMessageCount > 0" class="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs font-semibold rounded-full min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 flex items-center justify-center">
              {{ unreadMessageCount > 99 ? '99+' : unreadMessageCount }}
            </span>
          </button>

          <button
            @click="$router.push('/wishlist')"
            class="p-1.5 sm:p-2 text-white hover:text-amber-200 transition-colors relative"
            aria-label="Wishlist"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span v-if="wishlistCount > 0" class="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs font-semibold rounded-full min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 flex items-center justify-center">
              {{ wishlistCount > 99 ? '99+' : wishlistCount }}
            </span>
          </button>

          <button
            @click="$router.push('/cart')"
            class="p-1.5 sm:p-2 text-white hover:text-amber-200 transition-colors relative"
            aria-label="Shopping cart"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span v-if="cartCount > 0" class="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs font-semibold rounded-full min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 flex items-center justify-center">
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </button>

          <div v-if="user" class="relative group">
            <button class="flex items-center space-x-2 text-white hover:text-amber-200 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="hidden lg:block">
                {{ user.role === 'admin' ? t('admin') : (user.role === 'customer' ? t('customer') : user.name) }}
              </span>
            </button>
            <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50">
              <button
                @click="$router.push('/profile')"
                class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {{ t('profile') }}
              </button>
              <button
                @click="$router.push('/orders')"
                class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {{ t('orders') }}
              </button>
              <button
                v-if="user?.role === 'customer'"
                @click="handleContactSupport"
                class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {{ t('contact_support') }}
              </button>
              <button
                @click="$router.push('/settings')"
                class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {{ t('settings') }}
              </button>
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {{ t('logout') }}
              </button>
            </div>
          </div>
          <WoodButton v-else @click="handleLoginClick" size="sm">
            {{ t('sign_in') }}
          </WoodButton>
        </div>

        <!-- Mobile menu button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 text-white hover:text-amber-200"
        >
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden py-4 space-y-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            :placeholder="t('search_products')"
            class="w-full px-4 py-2 pl-10 rounded-lg bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div class="flex flex-col space-y-2">
          <!-- Cart, Wishlist, Chat (for all users) -->
          <button
            @click="$router.push('/cart'); mobileMenuOpen = false"
            class="text-white hover:text-amber-200 py-2 text-left"
          >
            {{ t('cart') }} ({{ cartCount }})
          </button>
          <button
            @click="$router.push('/wishlist'); mobileMenuOpen = false"
            class="text-white hover:text-amber-200 py-2 text-left"
          >
            {{ t('wishlist') }} ({{ wishlistCount }})
          </button>
          <button
            v-if="user"
            @click="handleChatClick(); mobileMenuOpen = false"
            class="text-white hover:text-amber-200 py-2 text-left"
          >
            {{ t('support_chat') }}
          </button>
          
          <!-- Separator -->
          <div class="border-t border-amber-800/50 my-2"></div>
          
          <!-- Admin Menu (only for admin) -->
          <template v-if="user?.role === 'admin'">
            <div class="text-amber-200 text-xs font-semibold uppercase px-2 py-1">{{ t('admin') }}</div>
            
            <!-- Manage Site Button -->
            <button
              @click="$router.push('/admin/manage-site'); mobileMenuOpen = false"
              class="text-white hover:text-amber-200 py-2 text-left w-full"
            >
              {{ t('manage_site') }}
            </button>
            
            <div class="border-t border-amber-800/50 my-2"></div>
          </template>
          
          <!-- Profile and Orders (for logged-in users) -->
          <template v-if="user">
            <button
              @click="$router.push('/profile'); mobileMenuOpen = false"
              class="text-white hover:text-amber-200 py-2 text-left"
            >
              {{ t('profile') }}
            </button>
            <button
              @click="$router.push('/orders'); mobileMenuOpen = false"
              class="text-white hover:text-amber-200 py-2 text-left"
            >
              {{ t('orders') }}
            </button>
          </template>
          
          <!-- Dark Mode -->
          <button
            @click="toggleDarkMode"
            class="text-white hover:text-amber-200 py-2 text-left flex items-center space-x-2"
          >
            <svg v-if="!isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{{ isDarkMode ? t('light_mode') : t('dark_mode') }}</span>
          </button>
          
          <!-- Language Toggle -->
          <button
            @click="toggleLanguage"
            class="text-white hover:text-amber-200 py-2 text-left flex items-center space-x-2"
          >
            <span>{{ t('language') }}: {{ currentLanguage === 'ar' ? 'English' : 'العربية' }}</span>
          </button>
          
          <!-- Settings -->
          <button
            @click="$router.push('/settings'); mobileMenuOpen = false"
            class="text-white hover:text-amber-200 py-2 text-left"
          >
            {{ t('settings') }}
          </button>
          
          <!-- Login/Logout -->
          <template v-if="user">
            <button
              @click="handleLogout(); mobileMenuOpen = false"
              class="text-red-400 hover:text-red-300 py-2 text-left"
            >
              {{ t('logout') }}
            </button>
          </template>
          <WoodButton
            v-else
            @click="handleLoginClick(); mobileMenuOpen = false"
            class="w-full"
          >
            {{ t('sign_in') }}
          </WoodButton>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import WoodButton from './WoodButton.vue';
import { showNotification } from '../utils/notifications';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;

const user = computed(() => authStore.user);
const isDarkMode = computed(() => authStore.isDarkMode);
const currentLanguage = computed(() => languageStore.currentLanguage);
const mobileMenuOpen = ref(false);
const adminMenuOpen = ref(false);
const searchQuery = ref('');
const cartCount = ref(0);
const wishlistCount = ref(0);
const unreadMessageCount = ref(0);

const woodTexture = '/bde3a495c5ad0d23397811532fdfa02fe66f448c.png';

const toggleDarkMode = () => {
  authStore.toggleDarkMode();
};

const toggleLanguage = () => {
  const newLang = currentLanguage.value === 'ar' ? 'en' : 'ar';
  languageStore.setLanguage(newLang);
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value } });
    // Dispatch event to notify other components that a search was performed
    // This will trigger refresh of most searched products
    window.dispatchEvent(new CustomEvent('search-performed', {
      detail: { query: searchQuery.value }
    }));
  }
};

const handleChatClick = () => {
  // Allow guests to access chat (read-only mode)
  router.push('/chat');
};

const handleContactSupport = async () => {
  if (!user.value) {
    showNotification(t('please_login_to_contact_support'), 'error');
    return;
  }
  
  try {
    // Fetch admins and open chat with the first admin
    const response = await window.axios.get('/admins');
    const admins = response.data;
    
    if (admins && admins.length > 0) {
      // Navigate to chat with the first admin
      router.push(`/chat/${admins[0].id}`);
    } else {
      showNotification(t('no_admins_available_at_the_moment'), 'warning');
    }
  } catch (error) {
    if (error.response?.status === 401) {
      showNotification(t('please_login_to_contact_support'), 'error');
    } else {
      showNotification(t('failed_to_connect_to_support'), 'error');
    }
  }
};

const handleLoginClick = () => {
  router.push({ name: 'login' });
};

const fetchCartCount = async () => {
  try {
    // For authenticated users, check localStorage first for instant display
    if (user.value) {
      const savedCart = localStorage.getItem('user_cart_' + user.value.id);
      if (savedCart) {
        try {
          const localCart = JSON.parse(savedCart);
          cartCount.value = localCart.reduce((total, item) => total + (item.quantity || 1), 0);
        } catch (e) {
          // Continue to fetch from backend
        }
      }
    }
    
    // For guest users, check localStorage first
    if (!user.value) {
      const { getGuestCart } = await import('../utils/guestStorage');
      const localCart = getGuestCart();
      if (localCart.length > 0) {
        cartCount.value = localCart.reduce((total, item) => total + (item.quantity || 1), 0);
        return;
      }
    }
    
    const response = await window.axios.get('/cart');
    const items = response.data.items || [];
    // Count total items (sum of quantities)
    cartCount.value = items.reduce((total, item) => total + (item.quantity || 1), 0);
    
    // Update localStorage for authenticated users
    if (user.value && items.length > 0) {
      const cartToSave = items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        package_id: item.package_id,
        quantity: item.quantity
      }));
      localStorage.setItem('user_cart_' + user.value.id, JSON.stringify(cartToSave));
    }
  } catch (error) {
    // Fallback to localStorage
    if (user.value) {
      const savedCart = localStorage.getItem('user_cart_' + user.value.id);
      if (savedCart) {
        try {
          const localCart = JSON.parse(savedCart);
          cartCount.value = localCart.reduce((total, item) => total + (item.quantity || 1), 0);
        } catch (e) {
          cartCount.value = 0;
        }
      } else {
        cartCount.value = 0;
      }
    } else {
      const { getGuestCart } = await import('../utils/guestStorage');
      const localCart = getGuestCart();
      cartCount.value = localCart.reduce((total, item) => total + (item.quantity || 1), 0);
    }
  }
};

const fetchWishlistCount = async () => {
  try {
    // For authenticated users, check localStorage first for instant display
    if (user.value) {
      const savedWishlist = localStorage.getItem('user_wishlist_' + user.value.id);
      if (savedWishlist) {
        try {
          const localWishlist = JSON.parse(savedWishlist);
          wishlistCount.value = localWishlist.length;
        } catch (e) {
          // Continue to fetch from backend
        }
      }
    }
    
    // For guest users, check localStorage first
    if (!user.value) {
      const { getGuestWishlist } = await import('../utils/guestStorage');
      const localWishlist = getGuestWishlist();
      if (localWishlist.length > 0) {
        wishlistCount.value = localWishlist.length;
        return;
      }
    }
    
    // Fetch from backend and update count
    const response = await window.axios.get('/wishlist');
    const backendWishlist = Array.isArray(response.data) ? response.data : [];
    
    // Use backend count, or localStorage count if backend is empty
    if (backendWishlist.length > 0) {
      wishlistCount.value = backendWishlist.length;
      // Update localStorage for authenticated users
      if (user.value) {
        const wishlistToSave = backendWishlist.map(item => ({
          id: item.id,
          product_id: item.product_id,
          package_id: item.package_id
        }));
        localStorage.setItem('user_wishlist_' + user.value.id, JSON.stringify(wishlistToSave));
      }
    } else {
      // Backend is empty, keep localStorage count if available
      if (!user.value || !localStorage.getItem('user_wishlist_' + user.value.id)) {
        wishlistCount.value = 0;
      }
      // Otherwise keep the localStorage count we set above
    }
  } catch (error) {
    // Fallback to localStorage
    if (user.value) {
      const savedWishlist = localStorage.getItem('user_wishlist_' + user.value.id);
      if (savedWishlist) {
        try {
          const localWishlist = JSON.parse(savedWishlist);
          wishlistCount.value = localWishlist.length;
        } catch (e) {
          wishlistCount.value = 0;
        }
      } else {
        wishlistCount.value = 0;
      }
    } else {
      const { getGuestWishlist } = await import('../utils/guestStorage');
      const localWishlist = getGuestWishlist();
      wishlistCount.value = localWishlist.length;
    }
  }
};

const fetchUnreadMessageCount = async () => {
  if (!user.value) {
    unreadMessageCount.value = 0;
    return;
  }
  try {
    const response = await window.axios.get('/conversations');
    const conversations = response.data || [];
    // Sum all unread counts from all conversations
    unreadMessageCount.value = conversations.reduce((total, conv) => {
      return total + (conv.unread_count || 0);
    }, 0);
  } catch (error) {
    unreadMessageCount.value = 0;
  }
};

const refreshCounts = () => {
  if (user.value) {
    fetchCartCount();
    fetchWishlistCount();
    fetchUnreadMessageCount();
  } else {
    // For guests, still fetch cart and wishlist counts from session
    fetchCartCount();
    fetchWishlistCount();
    unreadMessageCount.value = 0;
  }
};

let refreshInterval = null;

onMounted(() => {
  refreshCounts();
  
  // Refresh counts every 5 seconds for real-time updates
  refreshInterval = setInterval(() => {
    refreshCounts();
  }, 5000);
  
  // Listen for custom events from other components
  window.addEventListener('cart-updated', refreshCounts);
  window.addEventListener('wishlist-updated', refreshCounts);
  window.addEventListener('message-received', refreshCounts);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  // Remove event listeners
  window.removeEventListener('cart-updated', refreshCounts);
  window.removeEventListener('wishlist-updated', refreshCounts);
  window.removeEventListener('message-received', refreshCounts);
});

// Watch for user changes to fetch counts when user logs in
watch(user, (newUser) => {
  refreshCounts();
});

// Refresh counts when route changes (user might have added items)
watch(() => router.currentRoute.value.path, () => {
  refreshCounts();
});
</script>

