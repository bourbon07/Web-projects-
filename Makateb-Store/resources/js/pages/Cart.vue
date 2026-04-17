<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
        {{ t('loading') }}
      </div>

      <div v-else-if="cartItems.length === 0" class="text-center py-12">
        <svg class="mx-auto h-24 w-24 mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ t('your_cart_is_empty') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          {{ t('add_some_products') }}
        </p>
        <WoodButton @click="$router.push('/dashboard')" size="lg">
          {{ t('start_shopping') }}
        </WoodButton>
      </div>

      <div v-else>
        <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          {{ t('shopping_cart') }}
        </h1>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Cart Items -->
          <div class="lg:col-span-2 space-y-4">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex gap-4 border-2 border-amber-100 dark:border-amber-900/30"
            >
              <!-- Image -->
              <div class="flex-shrink-0">
                <img
                  v-if="item.package_id && item.package?.image_url"
                    :src="item.package.image_url"
                    :alt="item.package.name"
                  class="w-24 h-24 rounded-lg object-cover cursor-pointer"
                    @click="viewPackageContents(item.package)"
                  />
                <img
                  v-else-if="item.product?.image_url"
                    :src="item.product.image_url"
                    :alt="item.product.name"
                  class="w-24 h-24 rounded-lg object-cover cursor-pointer"
                    @click="$router.push(`/product/${item.product.id}`)"
                  />
                <div
                  v-else
                  class="w-24 h-24 rounded-lg flex items-center justify-center"
                  :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'"
                >
                  <svg class="w-12 h-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              
              <div class="flex-1">
                      <h3 
                  class="font-semibold text-lg mb-2 cursor-pointer hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                  @click="item.package_id ? viewPackageContents(item.package) : $router.push(`/product/${item.product.id}`)"
                      >
                  {{ item.package_id ? getLocalizedName(item.package) : item.product?.name }}
                      </h3>
                <div class="text-amber-900 dark:text-amber-500 font-bold mb-3">
                  {{ formatPrice(getItemPrice(item)) }} JD
                    </div>
                <div class="flex items-center gap-3">
                      <button
                        @click="updateQuantity(item.id, item.quantity - 1)"
                        :disabled="item.quantity <= 1"
                        class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </button>
                  <span class="font-semibold w-10 text-center text-lg">{{ item.quantity }}</span>
                      <button
                        @click="updateQuantity(item.id, item.quantity + 1)"
                        class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors flex items-center justify-center"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
              </div>
                    
              <div class="flex flex-col items-end justify-between">
                    <button
                      @click="removeItem(item.id)"
                      class="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label="Remove item"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                <div class="font-bold text-lg">
                  {{ formatPrice(getItemPrice(item) * item.quantity) }} JD
                </div>
                  </div>
            </div>
          </div>
          
          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6 sticky top-0 sm:top-24 border-2 border-amber-200 dark:border-amber-900">
              <h2 class="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 text-gray-900 dark:text-white">
                {{ t('order_summary') }}
              </h2>
            
              <div class="space-y-2 sm:space-y-3 mb-3 sm:mb-4 md:mb-6">
                <div class="flex justify-between text-sm sm:text-base">
                  <span class="text-gray-600 dark:text-gray-400">{{ t('subtotal') }}</span>
                  <span class="font-semibold">{{ formatPrice(subtotal) }} JD</span>
                </div>
              <div class="flex justify-between text-sm sm:text-base">
                  <span class="text-gray-600 dark:text-gray-400">{{ t('shipping') }}</span>
                  <span class="font-semibold">
                    <span class="text-green-600 text-xs sm:text-sm">{{ t('calculated_at_checkout') }}</span>
                  </span>
                </div>
                <div class="border-t-2 border-amber-200 dark:border-amber-800 pt-2 sm:pt-3">
                  <div class="flex justify-between items-center">
                    <span class="text-base sm:text-lg md:text-xl font-bold">{{ t('total') }}</span>
                    <span class="text-lg sm:text-xl md:text-2xl font-bold text-amber-900 dark:text-amber-500">
                      {{ formatPrice(subtotal) }} JD
                    </span>
                  </div>
                </div>
              </div>
              
              <WoodButton
              @click="checkout"
                class="w-full"
                size="md"
            >
              {{ t('proceed_to_checkout') }}
              </WoodButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Contents Modal -->
      <div
        v-if="selectedPackage"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="selectedPackage = null"
      >
        <div
          class="rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          :class="isDarkMode ? 'bg-gray-800' : 'bg-white'"
          @click.stop
        >
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ selectedPackage.name }}
              </h2>
              <button
                @click="selectedPackage = null"
                class="p-2 rounded-lg transition-colors"
                :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p v-if="getLocalizedDescription(selectedPackage)" class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              {{ getLocalizedDescription(selectedPackage) }}
            </p>

            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Package Contents ({{ selectedPackage.products?.length || 0 }})
              </h3>
              <div v-if="selectedPackage.products && selectedPackage.products.length > 0" class="space-y-2">
                <div
                  v-for="product in selectedPackage.products"
                  :key="product.id"
                  class="flex items-center gap-3 p-3 rounded-lg"
                  :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-50'"
                >
                  <div
                    v-if="!product.image_url"
                    class="w-12 h-12 rounded flex items-center justify-center"
                    :class="isDarkMode ? 'bg-gray-600' : 'bg-gray-200'"
                  >
                    <svg class="w-6 h-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <img
                    v-else
                    :src="product.image_url"
                    :alt="product.name"
                    class="w-12 h-12 rounded object-cover"
                  />
                  <div class="flex-1">
                    <h4 class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ product.name }}
                    </h4>
                    <p class="text-sm font-semibold text-[#6D4C41]">
                      {{ formatPrice(product.price) }} JD
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                No products in this package
              </div>
            </div>

            <div class="flex justify-end gap-2">
              <button
                @click="selectedPackage = null"
                class="px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
              >
                Close
              </button>
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
import { formatPriceDisplay } from '../utils/currency';
import { showNotification } from '../utils/notifications';
import { confirmAction } from '../utils/confirmation';
import {
  getGuestCart,
  saveGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  syncGuestCartWithBackend
} from '../utils/guestStorage';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;
const getLocalizedDescription = languageStore.getLocalizedDescription;

const cartItems = ref([]);
const loading = ref(false);
const selectedPackage = ref(null);

const isDarkMode = computed(() => authStore.isDarkMode);

const getItemPrice = (item) => {
  if (item.package_id && item.package) {
    // Use package price if set, otherwise calculate from products
    if (item.package.price !== null && item.package.price !== undefined) {
      const price = typeof item.package.price === 'string' ? parseFloat(item.package.price) : Number(item.package.price || 0);
      return isNaN(price) ? 0 : price;
    }
    // Fallback to sum of products if no package price is set
    if (item.package.products) {
      return item.package.products.reduce((sum, product) => {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price || 0);
        return sum + (isNaN(price) ? 0 : price);
      }, 0);
    }
    return 0;
  } else if (item.product) {
    const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : Number(item.product.price || 0);
    return isNaN(price) ? 0 : price;
  }
  return 0;
};

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const price = getItemPrice(item);
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);
});

const deliveryFee = ref(0);
const serviceFee = ref(0);
const userLocation = ref('');

const fetchDeliveryFee = async () => {
  try {
    if (!authStore.isAuthenticated) {
      // Default fee for non-authenticated users
      deliveryFee.value = 15;
      return;
    }
    
    // Get user profile to get location
    const profileResponse = await window.axios.get('/profile');
    const location = profileResponse.data.location;
    userLocation.value = location || '';
    
    if (location) {
      // Fetch delivery fee for the location
      const feeResponse = await window.axios.get(`/delivery-fees/location/${encodeURIComponent(location)}`);
      deliveryFee.value = feeResponse.data.fee || 0;
    } else {
      // Default fee if no location is set
      deliveryFee.value = 15;
    }
  } catch (error) {
    console.error('Error fetching delivery fee:', error);
    // Default to 15 JD if there's an error
    deliveryFee.value = 15;
  }
};

const shippingEstimate = computed(() => {
  return deliveryFee.value;
});

const orderTotal = computed(() => {
  const subtotalNum = Number(subtotal.value) || 0;
  // Only show subtotal before location is set - delivery fee added on checkout
  return subtotalNum;
});

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const fetchCart = async () => {
  loading.value = true;
  try {
    if (authStore.isAuthenticated) {
      // Authenticated user - always fetch from backend for perfect synchronization
      const response = await window.axios.get('/cart');
      cartItems.value = response.data.items || [];
    } else {
      // Guest user - sync localStorage cart with backend session
      const localCart = getGuestCart();
      if (localCart.length > 0) {
        try {
          const syncResponse = await window.axios.post('/cart/sync-guest', {
            items: localCart
          });
          cartItems.value = syncResponse.data.items || [];
        } catch (syncError) {
          const response = await window.axios.get('/cart');
          cartItems.value = response.data.items || [];
        }
      } else {
        const response = await window.axios.get('/cart');
        cartItems.value = response.data.items || [];
      }
    }
    
    // Update cache
    const storageKey = authStore.isAuthenticated ? 'user_cart_' + authStore.user?.id : 'guest_cart';
    const cartToSave = cartItems.value.map(item => ({
      id: item.id,
      product_id: item.product_id,
      package_id: item.package_id,
      quantity: item.quantity
    }));
    localStorage.setItem(storageKey, JSON.stringify(cartToSave));
    
  } catch (error) {
    console.error('Error fetching cart:', error);
    // Fallback to cache if possible
    const storageKey = authStore.isAuthenticated ? 'user_cart_' + authStore.user?.id : 'guest_cart';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const local = JSON.parse(saved);
        // Fallback structure
        cartItems.value = local.map(item => ({
          ...item,
          product: null,
          package: null
        }));
      } catch (e) {
        cartItems.value = [];
      }
    } else {
      cartItems.value = [];
    }
  } finally {
    loading.value = false;
  }
};

const updateQuantity = async (id, newQuantity) => {
  if (newQuantity < 1) return;
  
  // Find the item in the cart
  const itemIndex = cartItems.value.findIndex(item => item.id === id);
  if (itemIndex === -1) return;
  
  // Store the original quantity for rollback
  const originalQuantity = cartItems.value[itemIndex].quantity;
  
  // Optimistically update the quantity locally (no page refresh)
  cartItems.value[itemIndex].quantity = newQuantity;
  
    // Update localStorage for guest users
    if (!authStore.isAuthenticated) {
      updateGuestCartItem(id, newQuantity);
    }
    
    try {
      await window.axios.put(`/cart/${id}`, {
        quantity: newQuantity,
      });
      // Success - quantity is already updated locally, no need to fetch
      // Update localStorage after successful backend update
      if (!authStore.isAuthenticated) {
        const cartToSave = cartItems.value.map(item => ({
          id: item.id,
          product_id: item.product_id,
          package_id: item.package_id,
          quantity: item.quantity
        }));
        saveGuestCart(cartToSave);
      } else {
        // Save to localStorage for authenticated users
        const cartToSave = cartItems.value.map(item => ({
          id: item.id,
          product_id: item.product_id,
          package_id: item.package_id,
          quantity: item.quantity
        }));
        localStorage.setItem('user_cart_' + authStore.user?.id, JSON.stringify(cartToSave));
      }
  } catch (error) {
    // Rollback on error
    cartItems.value[itemIndex].quantity = originalQuantity;
    if (!authStore.isAuthenticated) {
      updateGuestCartItem(id, originalQuantity);
    } else {
      // Restore localStorage for authenticated users
      const cartToSave = cartItems.value.map(item => ({
        id: item.id,
        product_id: item.product_id,
        package_id: item.package_id,
        quantity: item.quantity
      }));
      localStorage.setItem('user_cart_' + authStore.user?.id, JSON.stringify(cartToSave));
    }
    if (error.response?.status === 401) {
      showNotification(t('please_login_to_update_cart_items'), 'error');
    } else {
    console.error('Error updating quantity:', error);
    showNotification(error.response?.data?.message || 'Failed to update quantity', 'error');
    }
  }
};

const removeItem = async (id) => {
  const confirmed = await confirmAction({
    action: languageStore.currentLanguage === 'ar' ? 'إزالة هذا العنصر' : 'remove this item',
    destructive: true,
  });
  if (!confirmed) return;
  
  // Find the item in the cart
  const itemIndex = cartItems.value.findIndex(item => item.id === id);
  if (itemIndex === -1) return;
  
  // Store the item for rollback
  const removedItem = cartItems.value[itemIndex];
  
  // Optimistically remove the item locally (no page refresh)
  cartItems.value.splice(itemIndex, 1);
  
    // Update localStorage for guest users
    if (!authStore.isAuthenticated) {
      removeFromGuestCart(id);
    }
    
    try {
      await window.axios.delete(`/cart/${id}`);
      // Success - item is already removed locally, no need to fetch
      // Update localStorage after successful backend update
      if (!authStore.isAuthenticated) {
        const cartToSave = cartItems.value.map(item => ({
          id: item.id,
          product_id: item.product_id,
          package_id: item.package_id,
          quantity: item.quantity
        }));
        saveGuestCart(cartToSave);
      } else {
        // Save to localStorage for authenticated users
        const cartToSave = cartItems.value.map(item => ({
          id: item.id,
          product_id: item.product_id,
          package_id: item.package_id,
          quantity: item.quantity
        }));
        localStorage.setItem('user_cart_' + authStore.user?.id, JSON.stringify(cartToSave));
      }
  } catch (error) {
    // Rollback on error
    cartItems.value.splice(itemIndex, 0, removedItem);
    if (!authStore.isAuthenticated) {
      // Restore to localStorage
      const cartToSave = cartItems.value.map(item => ({
        id: item.id,
        product_id: item.product_id,
        package_id: item.package_id,
        quantity: item.quantity
      }));
      saveGuestCart(cartToSave);
    } else {
      // Restore localStorage for authenticated users
      const cartToSave = cartItems.value.map(item => ({
        id: item.id,
        product_id: item.product_id,
        package_id: item.package_id,
        quantity: item.quantity
      }));
      localStorage.setItem('user_cart_' + authStore.user?.id, JSON.stringify(cartToSave));
    }
    if (error.response?.status === 401) {
      showNotification(t('please_login_to_remove_cart_items'), 'error');
    } else {
    console.error('Error removing item:', error);
    showNotification(error.response?.data?.message || 'Failed to remove item', 'error');
    }
  }
};

const checkout = async () => {
  // Allow guests to proceed to checkout - removed authentication check
  // Navigate to checkout page
  router.push('/checkout');
};

const viewPackageContents = (pkg) => {
  selectedPackage.value = pkg;
};

const fetchServiceFee = async () => {
  try {
    const response = await window.axios.get('/service-fee');
    serviceFee.value = response.data.fee || 0;
  } catch (error) {
    console.error('Error fetching services fee:', error);
    serviceFee.value = 0;
  }
};

onMounted(() => {
  fetchCart();
  fetchDeliveryFee();
  fetchServiceFee();
});
</script>
