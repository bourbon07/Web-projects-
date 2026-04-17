<template>
  <AppLayout>
    <div class="min-h-screen py-8" :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
      <div class="container mx-auto px-4 max-w-7xl">
        <div v-if="loading" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          {{ t('loading_order_details') }}
        </div>

        <div v-else-if="order" class="space-y-6">
          <!-- Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              {{ t('order') }} #ORD-{{ String(order.id).padStart(5, '0') }}
            </h1>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              {{ t('placed_on') }} {{ formatDate(order.created_at) }}
            </p>
          </div>

          <!-- Order Status -->
          <div class="rounded-lg shadow-md overflow-hidden" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ t('order_status') }}</h2>
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="getStatusClass(order.status)"
                >
                  {{ order.status.toUpperCase() }}
                </span>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="rounded-lg shadow-md overflow-hidden" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h2 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ t('order_items') }}</h2>
            </div>
            <div class="p-6">
              <div v-if="order.items && order.items.length > 0" class="space-y-4">
                <div
                  v-for="item in order.items"
                  :key="item.id"
                  class="flex items-center gap-4 pb-4 border-b last:border-b-0"
                  :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                >
                  <div
                    v-if="!item.product?.image_url"
                    class="w-20 h-20 rounded-lg cursor-pointer flex items-center justify-center hover:opacity-80 transition-opacity"
                    :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'"
                    @click="$router.push(`/product/${item.product_id}`)"
                  >
                    <svg class="w-12 h-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <img
                    v-else
                    :src="item.product.image_url"
                    :alt="item.product?.name"
                    class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    @click="$router.push(`/product/${item.product_id}`)"
                  />
                  <div class="flex-1">
                    <h3 
                      class="font-semibold mb-1 cursor-pointer hover:underline"
                      :class="isDarkMode ? 'text-white hover:text-[#6D4C41]' : 'text-gray-900 hover:text-[#6D4C41]'"
                      @click="$router.push(`/product/${item.product_id}`)"
                    >
                      {{ item.product?.name }}
                    </h3>
                    <p class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ t('quantity_label') }}: {{ item.qty }}
                    </p>
                    <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ t('price_each').replace('{price}', formatPrice(item.price_at_order)) }}
                    </p>
                    <p v-if="item.product" class="text-xs mt-1" :class="item.product.stock > 0 ? (isDarkMode ? 'text-[#6D4C41]' : 'text-[#6D4C41]') : (isDarkMode ? 'text-red-400' : 'text-red-600')">
                      {{ item.product.stock > 0 ? t('in_stock_available').replace('{stock}', item.product.stock) : t('out_of_stock') }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-lg" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ formatPrice(item.price_at_order * item.qty) }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ t('no_items_in_order') }}
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Customer Information -->
            <div class="rounded-lg shadow-md overflow-hidden" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
              <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h2 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ t('customer_information') }}</h2>
              </div>
              <div class="p-6 space-y-3">
                <div>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('name') }}</p>
                  <p class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ order.customer_name }}</p>
                </div>
                <div>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('phone') }}</p>
                  <p class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ order.customer_phone || 'N/A' }}</p>
                </div>
                <div v-if="order.payment_method">
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('payment_method') }}</p>
                  <p class="font-medium capitalize" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ formatPaymentMethod(order.payment_method) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Order Total -->
            <div class="rounded-lg shadow-md overflow-hidden" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
              <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h2 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ t('order_summary') }}</h2>
              </div>
              <div class="p-6">
                <div class="space-y-3 mb-4">
                  <div class="flex justify-between">
                    <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('subtotal') }}</span>
                    <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ formatPrice(order.total_price) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('tax') }}</span>
                    <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ formatPrice(order.total_price * 0.085) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('shipping') }}</span>
                    <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ order.total_price >= 200 ? t('free') : formatPrice(15) }}
                    </span>
                  </div>
                </div>
                <div class="pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <div class="flex justify-between items-center mb-4">
                    <span class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ t('total') }}</span>
                    <span class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ formatPrice(calculateTotal()) }} JD
                    </span>
                  </div>
                  <!-- Move to Cart Button -->
                  <button
                    @click="moveToCart"
                    :disabled="movingToCart"
                    class="w-full py-3 rounded-lg font-semibold text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {{ movingToCart ? t('adding_to_cart') : t('move_to_cart') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <p class="text-xl mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('order_not_found') }}</p>
          <router-link
            to="/orders"
            class="inline-block px-6 py-3 bg-[#6D4C41] text-white rounded-lg hover:bg-[#5a3f35] transition-colors"
          >
            {{ t('back_to_orders') }}
          </router-link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import AppLayout from '../components/AppLayout.vue';
import { ChevronLeft } from 'lucide-vue-next';
import { formatPriceDisplay } from '../utils/currency';
import { showNotification } from '../utils/notifications';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;

const order = ref(null);
const loading = ref(false);
const movingToCart = ref(false);

const isDarkMode = computed(() => authStore.isDarkMode);

const fetchOrder = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get(`/orders/${route.params.id}`);
    order.value = response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    order.value = null;
  } finally {
    loading.value = false;
  }
};

const moveToCart = async () => {
  if (!order.value || !order.value.items) return;
  
  movingToCart.value = true;
  try {
    const inStockItems = [];
    const outOfStockItems = [];
    
    // Check stock for each item
    for (const item of order.value.items) {
      const product = item.product;
      if (!product) continue;
      
      const stock = product.stock || 0;
      const requestedQty = item.qty || 1;
      
      if (stock >= requestedQty) {
        inStockItems.push(item);
      } else {
        outOfStockItems.push({ item, stock });
      }
    }
    
    // Add in-stock items to cart
    let addedCount = 0;
    for (const item of inStockItems) {
      try {
        await window.axios.post('/cart', {
          product_id: item.product_id,
          quantity: item.qty,
        });
        addedCount++;
      } catch (error) {
        console.error(`Error adding product ${item.product_id} to cart:`, error);
      }
    }
    
    // Add out-of-stock items to wishlist
    let wishlistCount = 0;
    for (const { item } of outOfStockItems) {
      try {
        const checkResponse = await window.axios.get(`/wishlist/check/${item.product_id}`);
        const isInWishlist = checkResponse.data?.is_favorite || false;
        
        if (!isInWishlist) {
          await window.axios.post('/wishlist', {
            product_id: item.product_id,
          });
          wishlistCount++;
        }
      } catch (error) {
        try {
          await window.axios.post('/wishlist', {
            product_id: item.product_id,
          });
          wishlistCount++;
        } catch (addError) {
          console.error(`Error adding product ${item.product_id} to wishlist:`, addError);
        }
      }
    }
    
    // Show message and redirect
    let message = '';
    if (addedCount > 0 && outOfStockItems.length === 0) {
      message = t('items_moved_to_cart').replace('{count}', addedCount);
      showNotification(message, 'success');
      router.push('/cart');
    } else if (addedCount > 0 && outOfStockItems.length > 0) {
      message = t('items_moved_to_cart_wishlist').replace('{inStock}', addedCount).replace('{outOfStock}', outOfStockItems.length);
      showNotification(message, 'warning');
      router.push('/cart');
    } else if (addedCount === 0 && outOfStockItems.length > 0) {
      message = t('all_items_out_of_stock').replace('{count}', wishlistCount);
      showNotification(message, 'warning');
      router.push('/wishlist');
    } else {
      showNotification(t('no_items_could_be_moved'), 'warning');
    }
  } catch (error) {
    console.error('Error moving to cart:', error);
    showNotification(t('failed_to_move_to_cart'), 'error');
  } finally {
    movingToCart.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const formatPaymentMethod = (method) => {
  if (!method) return 'N/A';
  return method.replace(/_/g, ' ');
};

const getStatusClass = (status) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'pending') {
    return isDarkMode.value ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
  } else if (statusLower === 'completed' || statusLower === 'delivered') {
    return isDarkMode.value ? 'bg-[#6D4C41] bg-opacity-20 text-[#6D4C41]' : 'bg-[#6D4C41]/20 text-green-800';
  } else if (statusLower === 'cancelled') {
    return isDarkMode.value ? 'bg-red-500 bg-opacity-20 text-red-400' : 'bg-red-100 text-red-800';
  }
  return isDarkMode.value ? 'bg-gray-500 bg-opacity-20 text-gray-400' : 'bg-gray-100 text-gray-800';
};

const calculateTotal = () => {
  if (!order.value) return 0;
  const subtotal = order.value.total_price || 0;
  const tax = subtotal * 0.085;
  const shipping = subtotal >= 200 ? 0 : 15;
  return subtotal + tax + shipping;
};

onMounted(() => {
  fetchOrder();
});
</script>

