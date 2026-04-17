<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <button
            @click="$router.push('/admin/manage-site')"
            class="flex items-center space-x-2 text-amber-800 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-400 mb-4"
          >
            <ChevronLeft :size="20" />
            <span>{{ t('back_to_admin_dashboard') }}</span>
          </button>

          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 class="text-4xl font-bold mb-2 text-gray-900 dark:text-white">{{ t('orders_checkout') }}</h1>
              <p class="text-gray-600 dark:text-gray-400">
                {{ t('approve_or_reject_payments') }}
              </p>
            </div>

            <!-- Stats -->
            <div class="flex gap-4">
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-amber-200 dark:border-amber-800">
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('pending') }}</div>
                <div class="text-2xl font-bold text-yellow-600">{{ pendingOrdersCount }}</div>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-amber-200 dark:border-amber-800">
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('total_orders') }}</div>
                <div class="text-2xl font-bold text-amber-800 dark:text-amber-500">{{ orders.length }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="mb-6 flex gap-2 overflow-x-auto">
          <button
            v-for="status in filterOptions"
            :key="status.value"
            @click="filterStatus = status.value"
            :class="[
              'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
              filterStatus === status.value
                ? 'bg-amber-800 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/20'
            ]"
          >
            {{ status.label }}
          </button>
        </div>

        <!-- Orders List -->
        <div v-if="loading" class="text-center py-16">
          <p class="text-gray-600 dark:text-gray-400">{{ t('loading') }}</p>
        </div>
        <div v-else-if="filteredOrders.length > 0" class="space-y-4">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 overflow-hidden"
          >
            <div class="p-6">
              <!-- Order Header -->
              <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                      {{ t('order') }} #{{ String(order.id).padStart(5, '0') }}
                    </h3>
                    <span :class="['px-3 py-1 rounded-full text-sm font-medium', getPaymentStatusColor(order.payment_status)]">
                      {{ getPaymentStatusText(order.payment_status) }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div class="flex items-center gap-1">
                      <User :size="16" />
                      <span>{{ order.customer_name || order.user?.name || t('guest_user') }}</span>
                    </div>
                    <!-- Admin Actions for User -->
                    <div class="flex items-center gap-2">
                      <WoodButton
                        size="sm"
                        variant="outline"
                        @click="viewProfile(order)"
                        class="!text-xs !py-1 !px-2"
                      >
                        {{ t('view_profile') }}
                      </WoodButton>
                      <WoodButton
                        v-if="order.user"
                        size="sm"
                        variant="outline"
                        @click="chatWithUser(order.user.id)"
                        class="!text-xs !py-1 !px-2"
                      >
                        {{ t('chat') }}
                      </WoodButton>
                      <WoodButton
                        v-if="order.user"
                        size="sm"
                        variant="outline"
                        @click="blockUser(order.user.id, order.user.name)"
                        class="!text-xs !py-1 !px-2 !bg-red-50 !text-red-600 hover:!bg-red-100 dark:!bg-red-900/20 dark:!text-red-400"
                      >
                        {{ t('block_user') }}
                      </WoodButton>
                    </div>
                    <div class="flex items-center gap-1">
                      <Calendar :size="16" />
                      <span>{{ formatDate(order.created_at) }}</span>
                    </div>
                    <div v-if="order.delivery_location" class="flex items-center gap-1">
                      <MapPin :size="16" />
                      <span>{{ order.delivery_location }}</span>
                    </div>
                  </div>
                </div>

                <!-- Payment Method -->
                <div class="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 rounded-lg">
                  <component :is="getPaymentIcon(order.payment_method)" :size="20" />
                  <div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">{{ t('payment_method') }}</div>
                    <div class="font-bold text-gray-900 dark:text-white">{{ formatPaymentMethod(order.payment_method) }}</div>
                  </div>
                </div>
              </div>

              <!-- Order Items -->
              <button
                @click="toggleOrderItems(order.id)"
                class="w-full flex items-center justify-between py-2 text-amber-800 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-400 mb-4"
              >
                <div class="flex items-center gap-2">
                  <Eye :size="16" />
                  <span class="font-medium">
                    {{ selectedOrder === order.id ? t('hide') : t('view') }} {{ t('order_items') }} ({{ order.items?.length || 0 }})
                  </span>
                </div>
              </button>

              <div v-if="selectedOrder === order.id" class="mb-4 space-y-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4 pb-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <img 
                    v-if="item.product?.image_url || item.package?.image_url" 
                    :src="item.product?.image_url || item.package?.image_url" 
                    :alt="item.product?.name || item.package?.name" 
                    class="w-16 h-16 object-cover rounded"
                  />
                  <div v-else class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <Package :size="24" class="text-gray-400" />
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-900 dark:text-white">{{ item.product?.name || item.package?.name || t('product') }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ t('quantity') }}: {{ item.qty }} × {{ formatPrice(item.price_at_order || item.price) }} JD
                    </div>
                  </div>
                  <div class="font-bold text-amber-800 dark:text-amber-500">
                    {{ formatPrice((item.price_at_order || item.price) * item.qty) }} JD
                  </div>
                </div>
              </div>

              <!-- Order Total -->
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div class="space-y-1">
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ t('total') }}: {{ formatPrice(order.total_price) }} JD
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap items-center gap-2">
                  <template v-if="(!order.payment_status || order.payment_status === 'pending') && order.status === 'pending'">
                    <WoodButton
                      @click="handleReject(order.id)"
                      variant="outline"
                      class="flex items-center gap-2 !bg-red-50 dark:!bg-red-900/20 !text-red-600 dark:!text-red-400 hover:!bg-red-100 dark:hover:!bg-red-900/30"
                    >
                      <XCircle :size="16" />
                      {{ t('reject') }}
                    </WoodButton>
                    <WoodButton
                      @click="handleApprove(order.id)"
                      class="flex items-center gap-2 !bg-green-700 hover:!bg-green-800"
                    >
                      <CheckCircle :size="16" />
                      {{ t('approve_payment') }}
                    </WoodButton>
                  </template>

                  <div v-else-if="order.payment_status === 'success'" class="flex items-center gap-2 text-green-600 dark:text-green-400 mr-2">
                    <CheckCircle :size="20" />
                    <span class="font-medium">{{ t('payment_approved') }}</span>
                  </div>

                  <div v-else-if="order.payment_status === 'rejected'" class="flex items-center gap-2 text-red-600 dark:text-red-400 mr-2">
                    <XCircle :size="20" />
                    <span class="font-medium">{{ t('payment_rejected') }}</span>
                  </div>

                  <!-- Always Show Remove/Delete Button -->
                  <WoodButton
                    @click="handleRemoveOrder(order.id)"
                    variant="outline"
                    class="flex items-center gap-2 !bg-red-50 dark:!bg-red-900/20 !text-red-600 dark:!text-red-400 hover:!bg-red-100 dark:hover:!bg-red-900/30"
                    :title="t('remove_order')"
                  >
                    <Trash2 :size="16" />
                    <span v-if="order.payment_status && order.payment_status !== 'pending'">{{ t('remove_order') }}</span>
                  </WoodButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-200 dark:border-amber-800">
          <Package :size="64" class="mx-auto mb-4 text-gray-400" />
          <h3 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{{ t('no_orders_found') }}</h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ filterStatus === 'all' ? t('no_orders_yet') : t('no_orders_with_status', { status: getFilterLabel(filterStatus) }) }}
          </p>
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
import { formatPriceDisplay } from '../utils/currency';
import { showNotification } from '../utils/notifications';
import { confirmAction } from '../utils/confirmation';
import { 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  Wallet, 
  DollarSign, 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  Eye,
  Trash2
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;

const orders = ref([]);
const loading = ref(false);
const selectedOrder = ref(null);
const filterStatus = ref('all');

const filterOptions = computed(() => [
  { value: 'all', label: t('all') },
  { value: 'pending', label: t('pending') },
  { value: 'processing', label: t('processing') },
  { value: 'success', label: t('approved') },
  { value: 'rejected', label: t('rejected') }
]);

const pendingOrdersCount = computed(() => {
  return orders.value.filter(order => {
    const paymentStatus = order.payment_status || (order.status === 'pending' ? 'pending' : null);
    return !paymentStatus || paymentStatus === 'pending';
  }).length;
});

const filteredOrders = computed(() => {
  if (filterStatus.value === 'all') {
    return orders.value;
  }
  return orders.value.filter(order => {
    // Use payment_status if available, otherwise use status field
    const paymentStatus = order.payment_status || (order.status === 'pending' ? 'pending' : null) || 'pending';
    return paymentStatus === filterStatus.value;
  });
});

const fetchOrders = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get('/admin/orders');
    orders.value = response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    showNotification(t('failed_to_fetch_orders'), 'error');
  } finally {
    loading.value = false;
  }
};


const handleApprove = async (orderId) => {
  const confirmed = await confirmAction({
    action: languageStore.currentLanguage === 'ar' ? 'الموافقة على هذا الدفع' : 'approve this payment',
    destructive: false,
  });
  if (!confirmed) return;
  
  try {
    await window.axios.put(`/admin/orders/${orderId}/approve-payment`);
    showNotification(t('payment_approved_successfully'), 'success');
    await fetchOrders();
  } catch (error) {
    console.error('Error approving payment:', error);
    showNotification(error.response?.data?.message || t('failed_to_approve_payment'), 'error');
  }
};

const handleReject = async (orderId) => {
  const confirmed = await confirmAction({
    action: languageStore.currentLanguage === 'ar' ? 'رفض هذا الدفع' : 'reject this payment',
    destructive: true,
  });
  if (!confirmed) return;
  
  try {
    await window.axios.put(`/admin/orders/${orderId}/reject-payment`);
    showNotification(t('payment_rejected'), 'success');
    await fetchOrders();
  } catch (error) {
    console.error('Error rejecting payment:', error);
    showNotification(error.response?.data?.message || t('failed_to_reject_payment'), 'error');
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
    showNotification(error.response?.data?.message || t('failed_to_remove_order'), 'error');
  }
};

const toggleOrderItems = (orderId) => {
  selectedOrder.value = selectedOrder.value === orderId ? null : orderId;
};

const getPaymentIcon = (method) => {
  if (!method) return DollarSign;
  const methodLower = method.toLowerCase();
  if (methodLower.includes('card') || methodLower.includes('credit') || methodLower.includes('visa')) {
    return CreditCard;
  }
  if (methodLower.includes('paypal')) {
    return Wallet;
  }
  if (methodLower.includes('cash') || methodLower.includes('delivery')) {
    return DollarSign;
  }
  return DollarSign;
};

const getPaymentStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  }
};

const getPaymentStatusText = (status) => {
  if (!status || status === 'pending') return t('pending');
  if (status === 'success') return t('approved');
  return t(status);
};

const formatPaymentMethod = (method) => {
  if (!method) return t('not_specified');
  return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
  return formatPriceDisplay(price);
};

const getFilterLabel = (status) => {
  const option = filterOptions.value.find(opt => opt.value === status);
  return option ? option.label : status;
};

const viewProfile = (order) => {
  if (order.user && order.user.id) {
    // User has account - go to user profile
    router.push(`/admin/user/${order.user.id}/profile`);
  } else {
    // Guest user - go to guest profile page with order info
    router.push({ 
      name: 'admin-guest-profile', 
      params: { orderId: order.id } 
    });
  }
};

const chatWithUser = (userId) => {
  router.push(`/chat/${userId}`);
};

const blockUser = async (userId, userName) => {
  const confirmed = await confirmAction({
    action: languageStore.currentLanguage === 'ar' 
      ? `حظر ${userName}`
      : `block ${userName}`,
    destructive: true,
  });
  if (!confirmed) return;
  
  try {
    await window.axios.post(`/admin/users/${userId}/block`);
    showNotification(t('user_blocked_successfully') || 'User blocked successfully', 'success');
    await fetchOrders();
  } catch (error) {
    console.error('Error blocking user:', error);
    showNotification(error.response?.data?.message || t('failed_to_block_user') || 'Failed to block user', 'error');
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

