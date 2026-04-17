<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
    <!-- Empty Wishlist State -->
    <div v-if="!loading && wishlistItems.length === 0" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <!-- Heart Icon -->
        <svg class="w-24 h-24 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        
        <!-- Title -->
        <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ t('wishlist_empty') }}
        </h2>
        
        <!-- Subtitle -->
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          {{ t('save_favorite_products') }}
        </p>
        
        <!-- Browse Products Button -->
        <WoodButton @click="$router.push('/dashboard')" size="lg">
          {{ t('browse_products') }}
        </WoodButton>
      </div>
    </div>

    <!-- Wishlist with Items -->
    <div v-else-if="!loading && wishlistItems.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Header -->
      <div class="flex items-center space-x-3 mb-8">
        <svg class="w-8 h-8 text-red-500 fill-current" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          {{ t('my_wishlist') }}
        </h1>
        <span class="text-xl text-gray-600 dark:text-gray-400">
          ({{ wishlistItems.length }} {{ t('items') }})
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
        <p class="text-lg text-gray-600 dark:text-gray-400">
          {{ t('loading') }}
        </p>
      </div>

      <!-- Wishlist Items Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="item in wishlistItems.filter(i => i.product)"
          :key="item.id"
          class="relative"
        >
          <button
            @click.stop="removeFromWishlist(item.id, item.product?.id)"
            class="absolute rounded-full transition-all z-30 top-1.5 right-1.5 p-1 bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white shadow-md"
            style="z-index: 30;"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <ProductCard
            :product="item.product"
            size="small"
            :hide-wishlist-button="true"
            @view-details="(id) => viewProduct(id)"
          />
        </div>
        <!-- Package items would need a PackageCard component if available -->
        <div
          v-for="item in wishlistItems.filter(i => !i.product && i.package)"
          :key="item.id"
          class="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative bg-white dark:bg-gray-800"
        >
          <button
            @click.stop="removeFromWishlist(item.id, null, item.package?.id)"
            class="absolute rounded-full transition-all z-10 top-1.5 right-1.5 p-1 bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="relative cursor-pointer" @click="viewPackage(item.package?.id)">
            <div
              v-if="!getItemImage(item)"
              class="w-full h-64 flex items-center justify-center"
              :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'"
            >
              <svg class="w-32 h-32" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <img
              v-else
              :src="getItemImage(item)"
              :alt="getItemName(item)"
              class="w-full h-64 object-cover"
            />
          </div>

          <div class="p-4">
            <h3 
              class="font-semibold text-lg mb-2 cursor-pointer hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
              @click="viewPackage(item.package?.id)"
              :class="isDarkMode ? 'text-white' : 'text-gray-900'"
            >
              {{ getItemName(item) }}
            </h3>
            
            <p class="text-sm mb-3 line-clamp-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              {{ getItemDescription(item) }}
            </p>
            
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ formatPrice(getItemPrice(item)) }}
              </span>
              <WoodButton
                @click="addToCart(null, item.package?.id)"
                size="sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add
              </WoodButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import WoodButton from '../components/WoodButton.vue';
import ProductCard from '../components/ProductCard.vue';
import { formatPriceDisplay } from '../utils/currency';
import { showNotification } from '../utils/notifications';
import { confirmAction } from '../utils/confirmation';
import {
  getGuestWishlist,
  saveGuestWishlist,
  removeFromGuestWishlist,
  clearGuestWishlist,
  syncGuestWishlistWithBackend
} from '../utils/guestStorage';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;

const isDarkMode = computed(() => authStore.isDarkMode);

const loading = ref(false);
const wishlistItems = ref([]);

const fetchWishlist = async () => {
  loading.value = true;
  try {
    if (authStore.isAuthenticated) {
      // Authenticated user - always fetch from backend for perfect synchronization
      const response = await window.axios.get('/wishlist');
      wishlistItems.value = Array.isArray(response.data) ? response.data : [];
    } else {
      // Guest user - sync localStorage wishlist with backend session
      const localWishlist = getGuestWishlist();
      if (localWishlist.length > 0) {
        try {
          const syncResponse = await window.axios.post('/wishlist/sync-guest', {
            items: localWishlist
          });
          wishlistItems.value = Array.isArray(syncResponse.data) ? syncResponse.data : [];
        } catch (syncError) {
          const response = await window.axios.get('/wishlist');
          wishlistItems.value = Array.isArray(response.data) ? response.data : [];
        }
      } else {
        const response = await window.axios.get('/wishlist');
        wishlistItems.value = Array.isArray(response.data) ? response.data : [];
      }
    }
    
    // Update cache
    const storageKey = authStore.isAuthenticated ? 'user_wishlist_' + authStore.user?.id : 'guest_wishlist';
    const wishlistToSave = wishlistItems.value.map(item => ({
      id: item.id,
      product_id: item.product_id,
      package_id: item.package_id
    }));
    localStorage.setItem(storageKey, JSON.stringify(wishlistToSave));
    
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    // Fallback to cache if possible
    const storageKey = authStore.isAuthenticated ? 'user_wishlist_' + authStore.user?.id : 'guest_wishlist';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const local = JSON.parse(saved);
        // We can't easily load full product data here without network, so just show what we have
        wishlistItems.value = local.map(item => ({
          ...item,
          product: null,
          package: null
        }));
      } catch (e) {
        wishlistItems.value = [];
      }
    } else {
      wishlistItems.value = [];
    }
  } finally {
    loading.value = false;
  }
};

const getItemImage = (item) => {
  return item.product?.image_url || item.package?.image_url || null;
};

const getItemName = (item) => {
  return item.product?.name || item.package?.name || 'Unknown Item';
};

const getItemDescription = (item) => {
  if (item.product) {
    return languageStore.getLocalizedDescription(item.product) || '';
  }
  if (item.package) {
    return languageStore.getLocalizedDescription(item.package) || '';
  }
  return '';
};

const getItemPrice = (item) => {
  if (item.product) {
    return item.product.price || 0;
  }
  if (item.package) {
    return item.package.price || 0;
  }
  return 0;
};

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const viewProduct = (productId) => {
  if (productId) {
    router.push(`/product/${productId}`);
  }
};

const viewPackage = (packageId) => {
  if (packageId) {
    router.push(`/package/${packageId}`);
  }
};

const removeFromWishlist = async (wishlistItemId, productId, packageId) => {
  // Update localStorage for guest users
  if (!authStore.isAuthenticated) {
    removeFromGuestWishlist(productId, packageId);
  }
  
  try {
    if (productId) {
      await window.axios.delete(`/wishlist/product/${productId}`);
    } else if (packageId) {
      await window.axios.delete(`/wishlist/package/${packageId}`);
    } else if (wishlistItemId) {
      await window.axios.delete(`/wishlist/${wishlistItemId}`);
    }
    
    // Fetch updated wishlist from backend
    await fetchWishlist();
    
    // Check if wishlist is empty after fetch
    const response = await window.axios.get('/wishlist');
    const wishlistData = response.data || [];
    
    // Update localStorage after successful backend update
    if (wishlistData.length === 0) {
      // Clear localStorage if wishlist is empty
      if (!authStore.isAuthenticated) {
        clearGuestWishlist();
      } else {
        localStorage.removeItem('user_wishlist_' + authStore.user?.id);
      }
    } else {
      // Save to localStorage if there are still items
      if (!authStore.isAuthenticated) {
        const wishlistToSave = wishlistItems.value.map(item => ({
          id: item.id,
          product_id: item.product_id,
          package_id: item.package_id
        }));
        saveGuestWishlist(wishlistToSave);
      } else {
        // Save to localStorage for authenticated users
        const wishlistToSave = wishlistItems.value.map(item => ({
          id: item.id,
          product_id: item.product_id,
          package_id: item.package_id
        }));
        localStorage.setItem('user_wishlist_' + authStore.user?.id, JSON.stringify(wishlistToSave));
      }
    }
    window.dispatchEvent(new CustomEvent('wishlist-updated'));
    showNotification(t('removed_from_wishlist'), 'success');
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    // Restore to localStorage on error
    if (!authStore.isAuthenticated) {
      const wishlistToSave = wishlistItems.value.map(item => ({
        id: item.id,
        product_id: item.product_id,
        package_id: item.package_id
      }));
      saveGuestWishlist(wishlistToSave);
    } else {
      const wishlistToSave = wishlistItems.value.map(item => ({
        id: item.id,
        product_id: item.product_id,
        package_id: item.package_id
      }));
      localStorage.setItem('user_wishlist_' + authStore.user?.id, JSON.stringify(wishlistToSave));
    }
    showNotification(error.response?.data?.message || t('failed_to_update_wishlist'), 'error');
  }
};

const addToCart = async (productId, packageId) => {
  try {
    if (productId) {
      await window.axios.post('/cart', {
        product_id: productId,
        quantity: 1,
      });
    } else if (packageId) {
      await window.axios.post('/cart/package', {
        package_id: packageId,
      });
    }
    
    // Save to localStorage for authenticated users
    if (authStore.isAuthenticated && authStore.user) {
      const currentCart = await window.axios.get('/cart');
      const cartToSave = (currentCart.data.items || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        package_id: item.package_id,
        quantity: item.quantity
      }));
      localStorage.setItem('user_cart_' + authStore.user.id, JSON.stringify(cartToSave));
    }
    
    window.dispatchEvent(new CustomEvent('cart-updated'));
    showNotification(t('added_to_cart'), 'success');
  } catch (error) {
    if (error.response?.status === 401) {
      showNotification(t('please_login_to_add_items'), 'error');
    } else {
      showNotification(error.response?.data?.message || t('failed_to_add_to_cart'), 'error');
    }
  }
};

const addAllToCart = async () => {
  const inStockItems = wishlistItems.value.filter(item => {
    if (item.product) {
      return item.product.stock > 0;
    }
    return true;
  });
  
  if (inStockItems.length === 0) {
    showNotification(t('no_items_in_stock_to_add_to_cart'), 'warning');
    return;
  }

  try {
    for (const item of inStockItems) {
      if (item.product) {
        await window.axios.post('/cart', {
          product_id: item.product.id,
          quantity: 1,
        });
      } else if (item.package) {
        await window.axios.post('/cart/package', {
          package_id: item.package.id,
        });
      }
    }
    
    // Save to localStorage for authenticated users
    if (authStore.isAuthenticated && authStore.user) {
      const currentCart = await window.axios.get('/cart');
      const cartToSave = (currentCart.data.items || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        package_id: item.package_id,
        quantity: item.quantity
      }));
      localStorage.setItem('user_cart_' + authStore.user.id, JSON.stringify(cartToSave));
    }
    
    window.dispatchEvent(new CustomEvent('cart-updated'));
    showNotification(t('added_x_items_to_cart').replace('{count}', inStockItems.length), 'success');
  } catch (error) {
    if (error.response?.status === 401) {
      showNotification(t('please_login_to_add_items'), 'error');
    } else {
      showNotification(t('some_items_could_not_be_added_to_cart'), 'error');
    }
  }
};

const clearAll = async () => {
  const confirmed = await confirmAction({
    action: t('clear_all_items_from_your_wishlist') || 'clear all items from your wishlist',
    destructive: true
  });
  if (!confirmed) return;
  
  try {
    await window.axios.delete('/wishlist');
    // Clear localStorage for both guest and authenticated users
    if (!authStore.isAuthenticated) {
      clearGuestWishlist();
    } else {
      localStorage.removeItem('user_wishlist_' + authStore.user?.id);
    }
    // Clear the wishlist items array
    wishlistItems.value = [];
    window.dispatchEvent(new CustomEvent('wishlist-updated'));
    showNotification(t('wishlist_cleared'), 'success');
  } catch (error) {
    if (error.response?.status === 401) {
      showNotification(t('please_login_to_manage_wishlist'), 'error');
    } else {
      showNotification(t('failed_to_clear_wishlist'), 'error');
    }
  }
};

onMounted(() => {
  fetchWishlist();
});
</script>
