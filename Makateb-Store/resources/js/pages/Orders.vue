<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Empty State (No orders at all) -->
        <div v-if="!loading && orders.length === 0" class="min-h-screen flex items-center justify-center">
          <div class="text-center">
            <Package class="w-24 h-24 mx-auto mb-6 text-gray-400" />
            <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {{ t('no_orders') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-8">
              {{ t('start_shopping_and_orders') }}
            </p>
            <WoodButton @click="$router.push('/')" size="lg">
              {{ t('start_shopping') }}
            </WoodButton>
          </div>
        </div>

        <!-- Orders List -->
        <div v-else>
          <!-- Back Button -->
          <button
            @click="$router.push('/')"
            class="flex items-center space-x-2 text-amber-800 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-400 mb-6"
          >
            <ChevronLeft :size="20" />
            <span>{{ t('back_to_home') }}</span>
          </button>

          <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
            {{ t('order_history') }}
          </h1>

          <div v-if="loading" class="text-center py-12 text-gray-600 dark:text-gray-400">
            {{ t('loading') }}
          </div>

          <div v-else class="space-y-6">
            <div
              v-for="order in orders"
              :key="order.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30"
            >
              <div class="flex flex-wrap items-center justify-between mb-4 gap-4">
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ t('order') }} #{{ String(order.id).padStart(5, '0') }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">
                    {{ t('placed_on') }} {{ formatDate(order.created_at) }}
                  </p>
                </div>
                <div class="flex items-center space-x-3">
                  <div
                    class="flex items-center space-x-2 px-4 py-2 rounded-full"
                    :class="getStatusColor(order.status)"
                  >
                    <component :is="getStatusIcon(order.status)" :size="20" />
                    <span class="font-medium capitalize">{{ order.status || 'pending' }}</span>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold text-amber-900 dark:text-amber-500">
                      {{ formatPrice(order.total_price) }} JD
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ formatPaymentMethod(order.payment_method) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="border-t border-amber-200 dark:border-amber-800 pt-4">
                <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">
                  {{ t('items') }} ({{ getOrderItemsCount(order) }})
                </h4>
                <div class="space-y-3">
                  <div
                    v-for="item in getOrderItems(order)"
                    :key="item.id"
                    class="flex items-center gap-4"
                  >
                    <img
                      v-if="getItemImage(item)"
                      :src="getItemImage(item)"
                      :alt="getItemName(item)"
                      class="w-16 h-16 rounded-lg object-cover"
                    />
                    <div
                      v-else
                      class="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                    >
                      <Package :size="24" class="text-gray-400" />
                    </div>
                    <div class="flex-1">
                      <h5 class="font-semibold text-gray-900 dark:text-white">
                        {{ getItemName(item) }}
                      </h5>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ t('quantity_label') }}: {{ getItemQuantity(item) }}
                      </p>
                    </div>
                    <div class="font-bold text-gray-900 dark:text-white">
                      {{ formatPrice(getItemTotalPrice(item)) }} JD
                    </div>
                  </div>
                </div>

                <!-- Reorder Button -->
                <div class="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800 flex justify-end">
                  <WoodButton
                    @click="handleReorder(order)"
                    class="flex items-center gap-2"
                    size="sm"
                  >
                    <RefreshCw :size="16" />
                    {{ t('reorder') }}
                  </WoodButton>
                  <WoodButton
                    @click="handleRemoveOrder(order.id)"
                    variant="outline"
                    class="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    size="sm"
                  >
                    <Trash2 :size="16" />
                    {{ t('remove_order') }}
                  </WoodButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import { Package, Truck, CheckCircle, Clock, ChevronLeft, RefreshCw, Trash2 } from 'lucide-vue-next';
import { formatPriceDisplay } from '../utils/currency';
import { showNotification } from '../utils/notifications';
import { confirmAction } from '../utils/confirmation';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;

const isDarkMode = computed(() => authStore.isDarkMode);
const user = computed(() => authStore.user);

const loading = ref(false);
const orders = ref([]);

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return Clock;
    case 'processing':
      return Package;
    case 'shipped':
      return Truck;
    case 'delivered':
      return CheckCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'shipped':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  }
};

const getOrderItems = (order) => {
  if (!order.items) return [];
  return Array.isArray(order.items) ? order.items : [order.items];
};

const getOrderItemsCount = (order) => {
  return getOrderItems(order).length;
};

const getItemImage = (item) => {
  if (item.product?.image_url) return item.product.image_url;
  if (item.package?.image_url) return item.package.image_url;
  if (item.product?.image_urls && Array.isArray(item.product.image_urls) && item.product.image_urls.length > 0) {
    return item.product.image_urls[0];
  }
  if (item.image_url) return item.image_url;
  if (item.image) return item.image;
  return null;
};

const getItemName = (item) => {
  return item.product?.name || item.package?.name || item.name || 'Product';
};

const getItemQuantity = (item) => {
  return item.qty || item.quantity || 1;
};

const getItemTotalPrice = (item) => {
  const price = item.price_at_order || item.price || item.product?.price || 0;
  const quantity = getItemQuantity(item);
  return price * quantity;
};

const fetchOrders = async () => {
  const guestId = localStorage.getItem('guest_id');
  if (!user.value && !guestId) return;
  
  loading.value = true;
  try {
    const response = await window.axios.get('/orders');
    const ordersData = response.data?.data || response.data || [];
    let ordersList = Array.isArray(ordersData) ? ordersData : [];
    
    // Ensure each order has items as an array
    ordersList = ordersList.map(order => ({
      ...order,
      items: Array.isArray(order.items) ? order.items : (order.items ? [order.items] : [])
    }));
    
    // Sort by date (newest first)
    orders.value = ordersList.sort((a, b) => {
      const dateA = new Date(a.created_at || a.date || 0);
      const dateB = new Date(b.created_at || b.date || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    orders.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const formatPaymentMethod = (method) => {
  if (!method) return 'N/A';
  return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const handleReorder = async (order) => {
  if (!user.value) {
    showNotification(t('please_login_to_add_items'), 'warning');
    router.push('/login');
    return;
  }

  try {
    let addedCount = 0;
    const items = getOrderItems(order);
    
    for (const item of items) {
      const productId = item.product_id || item.product?.id;
      if (!productId) continue;
      
      try {
        await window.axios.post('/cart', {
          product_id: productId,
          quantity: getItemQuantity(item),
        });
        addedCount++;
      } catch (error) {
        console.error(`Error adding product ${productId} to cart:`, error);
      }
    }
    
    if (addedCount > 0) {
      showNotification(t('order_added_to_cart', { count: addedCount }), 'success');
      // Dispatch event to update navbar counts
      window.dispatchEvent(new CustomEvent('cart-updated'));
      router.push('/cart');
    } else {
      showNotification(t('failed_to_add_to_cart'), 'error');
    }
  } catch (error) {
    console.error('Error reordering:', error);
    showNotification(t('failed_to_add_to_cart'), 'error');
  }
};

const handleRemoveOrder = async (orderId) => {
  const confirmed = await confirmAction({
    action: t('remove_order').toLowerCase(),
    destructive: true,
  });
  
  if (!confirmed) return;
  
  try {
    await window.axios.delete(`/orders/${orderId}`);
    showNotification(t('order_removed_successfully'), 'success');
    await fetchOrders();
  } catch (error) {
    console.error('Error removing order:', error);
    showNotification(t('failed_to_remove_order'), 'error');
  }
};

onMounted(async () => {
  try {
    if (!authStore.user) {
      try {
        await authStore.fetchUser();
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    }
    
    await fetchOrders().catch(err => {
      console.error('Error fetching orders:', err);
      orders.value = [];
    });
  } catch (error) {
    console.error('Error initializing orders page:', error);
  }
});
</script>
