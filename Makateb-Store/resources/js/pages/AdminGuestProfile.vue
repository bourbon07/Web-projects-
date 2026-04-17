<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Back Button -->
        <button
          @click="$router.back()"
          class="flex items-center space-x-2 text-amber-800 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-400 mb-4"
        >
          <ChevronLeft :size="20" />
          <span>{{ t('back') }}</span>
        </button>

        <!-- Profile Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-amber-800 to-amber-900 p-8 text-white">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-6">
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center">
                  <svg class="w-12 h-12 text-amber-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-3xl font-bold mb-2">
                    {{ orderData.customer_name || t('guest_user') }}
                  </h1>
                  <p class="text-amber-200">{{ t('does_not_create_account') || 'Does not create account' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{{ t('customer_information') || 'Customer Information' }}</h2>

            <!-- Information Grid -->
            <div class="space-y-6">
              <!-- Full Name -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span>{{ t('full_name') }}</span>
                </label>
                <p class="text-lg text-gray-900 dark:text-white">{{ orderData.customer_name || t('not_provided') }}</p>
              </div>

              <!-- Email -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{{ t('email') }}</span>
                </label>
                <p class="text-lg text-gray-900 dark:text-white">{{ orderData.customer_email || t('not_provided') }}</p>
              </div>

              <!-- Phone -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{{ t('phone') }}</span>
                </label>
                <p class="text-lg text-gray-900 dark:text-white">{{ orderData.customer_phone || t('not_provided') }}</p>
              </div>

              <!-- Delivery Location -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ t('delivery_location') || 'Delivery Location' }}</span>
                </label>
                <p class="text-lg text-gray-900 dark:text-white">{{ orderData.delivery_location || t('not_provided') }}</p>
              </div>
            </div>

            <!-- Order Information -->
            <div class="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <h3 class="font-bold mb-4 text-gray-900 dark:text-white">{{ t('order_information') || 'Order Information' }}</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ t('order') }}:</span>
                  <span class="font-medium text-gray-900 dark:text-white">#{{ String(orderData.id).padStart(5, '0') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ t('order_date') }}:</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(orderData.created_at) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ t('total') }}:</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ formatPrice(orderData.total_price) }} JD</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ t('status') }}:</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ orderData.status || 'pending' }}</span>
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import AppLayout from '../components/AppLayout.vue';
import { ChevronLeft } from 'lucide-vue-next';
import { showNotification } from '../utils/notifications';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;

const orderData = ref({
  id: null,
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  delivery_location: '',
  total_price: 0,
  status: 'pending',
  created_at: null,
});

const loading = ref(false);

const fetchOrder = async () => {
  loading.value = true;
  try {
    // Use regular orders endpoint (allows admin access)
    const response = await window.axios.get(`/orders/${route.params.orderId}`);
    orderData.value = response.data.data || response.data || {};
  } catch (error) {
    console.error('Error loading order:', error);
    const t = useLanguageStore().t;
    showNotification(error.response?.data?.message || t('failed_to_load_order_data') || 'Failed to load order data', 'error');
    router.back();
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric'
  });
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(numPrice)) return '0.00';
  return numPrice.toFixed(2);
};

onMounted(() => {
  fetchOrder();
});
</script>

