<template>
  <AppLayout>
    <div class="container mx-auto px-4 py-6 w-full" :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
      <!-- Header -->
      <div class="mb-6">
        <h1 
          class="text-3xl font-bold mb-2"
          :class="isDarkMode ? 'text-white' : 'text-gray-900'"
        >
          Order History - {{ userInfo?.name || 'User' }}
        </h1>
        <p 
          :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
        >
          View all orders for this user.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
        Loading orders...
      </div>

      <!-- Orders List -->
      <div v-else-if="orders.length === 0" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
        No orders found for this user.
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="rounded-lg shadow-sm overflow-hidden"
          :class="isDarkMode ? 'bg-gray-800' : 'bg-white'"
        >
          <!-- Order Header -->
          <div class="p-4 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Order #ORD-{{ String(order.id).padStart(5, '0') }}
                </h3>
                <p class="text-sm mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ formatDate(order.created_at) }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold text-lg" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ formatPrice(order.total_price) }} JD
                </p>
                <span 
                  class="inline-block px-2 py-1 rounded text-xs font-medium mt-1"
                  :class="getStatusClass(order.status)"
                >
                  {{ order.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="p-4">
            <div class="space-y-3">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="flex items-center gap-4"
              >
                <div v-if="item.product" class="flex-1">
                  <p class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ item.product.name }}
                  </p>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Qty: {{ item.qty }} × {{ formatPrice(item.price_at_order) }} JD
                  </p>
                </div>
                <div v-else-if="item.package" class="flex-1">
                  <p class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ getLocalizedName(item.package) }} ({{ t('package') }})
                  </p>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Qty: {{ item.qty }} × {{ formatPrice(item.price_at_order) }} JD
                  </p>
                </div>
                <div class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ formatPrice(item.qty * item.price_at_order) }} JD
                </div>
              </div>
            </div>

            <!-- Delivery Location -->
            <div v-if="order.delivery_location" class="mt-4 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                <strong>Delivery Location:</strong> {{ order.delivery_location }}
              </p>
            </div>
          </div>
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
import { showNotification } from '../utils/notifications';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;

const isDarkMode = computed(() => authStore.isDarkMode);
const loading = ref(false);
const orders = ref([]);
const userInfo = ref(null);

const fetchOrders = async () => {
  const userId = route.params.userId;
  if (!userId) return;
  
  loading.value = true;
  try {
    const response = await window.axios.get(`/admin/users/${userId}/orders`);
    userInfo.value = response.data.user;
    const ordersData = response.data.orders?.data || response.data.orders || [];
    orders.value = Array.isArray(ordersData) ? ordersData : [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    const t = useLanguageStore().t;
    showNotification(error.response?.data?.message || t('failed_to_fetch_orders') || 'Failed to fetch orders', 'error');
    orders.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(numPrice)) return '0.00';
  return numPrice.toFixed(2);
};

const getStatusClass = (status) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'completed' || statusLower === 'delivered') {
    return 'bg-[#6D4C41]/20 text-green-800';
  } else if (statusLower === 'pending' || statusLower === 'processing') {
    return 'bg-yellow-100 text-yellow-800';
  } else if (statusLower === 'cancelled') {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-gray-100 text-gray-800';
};

onMounted(() => {
  fetchOrders();
});
</script>

