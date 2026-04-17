<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">{{ t('manage_site') }}</h1>
          <p class="text-gray-600 dark:text-gray-400">{{ t('welcome_admin_manage_store') }}</p>
        </div>

        <!-- Management Feature Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <!-- Manage Packages -->
          <button
            @click="$router.push('/admin/packages')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left"
          >
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Package :size="24" class="text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('manage_packages') }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('create_edit_packages_description') }}</p>
              </div>
            </div>
          </button>

          <!-- Manage Categories -->
          <button
            @click="$router.push('/admin/categories')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left"
          >
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Tag :size="24" class="text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('manage_categories') }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('create_categories_description') }}</p>
              </div>
            </div>
          </button>

          <!-- Manage Products -->
          <button
            @click="$router.push('/admin/products')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left"
          >
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <Package :size="24" class="text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('manage_products') }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('create_edit_products_description') }}</p>
              </div>
            </div>
          </button>

          <!-- Manage Users -->
          <button
            @click="$router.push('/admin/users')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left"
          >
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Users :size="24" class="text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('manage_users') }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('view_block_manage_users_description') }}</p>
              </div>
            </div>
          </button>

          <!-- Service Fees -->
          <button
            @click="$router.push('/admin/service-fees')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left"
          >
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <DollarSign :size="24" class="text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('service_fees') }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('set_delivery_service_fees_description') }}</p>
              </div>
            </div>
          </button>

          <!-- Blocked Users -->
          <button
            @click="$router.push('/admin/blocked-users')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left"
          >
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <Ban :size="24" class="text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('blocked_users') }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('view_manage_blocked_users_description') }}</p>
              </div>
            </div>
          </button>

          <!-- Customer Chat -->
          <button
            @click="$router.push('/admin/chat')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left"
          >
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <MessageSquare :size="24" class="text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('customer_chat') }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('chat_with_customers_realtime_description') }}</p>
              </div>
            </div>
          </button>

          <!-- Orders Checkout -->
          <button
            @click="$router.push('/admin/orders-checkout')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left"
          >
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <CreditCard :size="24" class="text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('orders_checkout') }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('approve_reject_payments_description') }}</p>
              </div>
            </div>
          </button>

          <!-- Add Admins (only for super admin with code 7986) -->
          <button
            v-if="isSuperAdmin"
            @click="$router.push('/admin/admin-codes')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left"
          >
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <Shield :size="24" class="text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('manage_admin_codes') }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('create_manage_admin_codes_description') }}</p>
              </div>
            </div>
          </button>
        </div>

        <!-- Summary Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Total Products -->
          <button
            @click="$router.push('/admin/stats/products')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left cursor-pointer"
          >
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{{ t('total_products') }}</h3>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mb-3">{{ totalProducts }}</p>
            <p class="text-sm text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              {{ t('click_to_view_details') }}
              <ArrowRight :size="16" />
            </p>
          </button>

          <!-- Total Users -->
          <button
            @click="$router.push('/admin/stats/users')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left cursor-pointer"
          >
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{{ t('total_users') }}</h3>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mb-3">{{ formatNumber(totalUsers) }}</p>
            <p class="text-sm text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              {{ t('click_to_view_details') }}
              <ArrowRight :size="16" />
            </p>
          </button>

          <!-- Active Pages -->
          <button
            @click="$router.push('/admin/stats/pages')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left cursor-pointer"
          >
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{{ t('active_pages') }}</h3>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mb-3">{{ activePages }}</p>
            <p class="text-sm text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              {{ t('click_to_view_details') }}
              <ArrowRight :size="16" />
            </p>
          </button>

          <!-- Blocked Users -->
          <button
            @click="$router.push('/admin/blocked-users')"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 hover:shadow-lg transition-all text-left cursor-pointer"
          >
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{{ t('blocked_users') }}</h3>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mb-3">{{ blockedUsers }}</p>
            <p class="text-sm text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              {{ t('click_to_view_details') }}
              <ArrowRight :size="16" />
            </p>
          </button>
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
import { Package, Tag, Users, DollarSign, Ban, MessageSquare, CreditCard, ArrowRight, Shield } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;

const totalProducts = ref(0);
const totalUsers = ref(0);
const activePages = ref(0);
const blockedUsers = ref(0);

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

const fetchStats = async () => {
  try {
    // Fetch total products
    try {
      const productsResponse = await window.axios.get('/products', { params: { per_page: 1 } });
      totalProducts.value = productsResponse.data.total || productsResponse.data.meta?.total || 0;
    } catch (error) {
      console.error('Error fetching products count:', error);
    }

    // Fetch total users
    try {
      const usersResponse = await window.axios.get('/admin/users', { params: { per_page: 1 } });
      totalUsers.value = usersResponse.data.total || usersResponse.data.meta?.total || usersResponse.data.length || 0;
    } catch (error) {
      console.error('Error fetching users count:', error);
    }

    // Fetch active pages count from tracked visits
    try {
      const { getAllPageVisits } = await import('../utils/pageVisits');
      const allVisits = getAllPageVisits();
      // Count pages that have been visited at least once
      activePages.value = Object.keys(allVisits).filter(path => allVisits[path].visits > 0).length || 0;
    } catch (error) {
      console.error('Error fetching pages count:', error);
      activePages.value = 0;
    }

    // Fetch blocked users
    try {
      const blockedResponse = await window.axios.get('/admin/blocked-users', { params: { per_page: 1 } });
      // Handle paginated response
      if (blockedResponse.data.total !== undefined) {
        blockedUsers.value = blockedResponse.data.total || 0;
      } else if (Array.isArray(blockedResponse.data)) {
        blockedUsers.value = blockedResponse.data.length || 0;
      } else if (blockedResponse.data.data && Array.isArray(blockedResponse.data.data)) {
        blockedUsers.value = blockedResponse.data.total || blockedResponse.data.data.length || 0;
      } else {
        blockedUsers.value = 0;
      }
    } catch (error) {
      console.error('Error fetching blocked users count:', error);
      blockedUsers.value = 0;
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const isSuperAdmin = computed(() => {
  const isSuper = authStore.user?.secret_code === '7986';
  // Debug log (remove in production)
  if (authStore.user) {
    console.log('Current user secret_code:', authStore.user.secret_code, 'isSuperAdmin:', isSuper);
  }
  return isSuper;
});

onMounted(async () => {
  // Always ensure user data is loaded and refreshed
  if (authStore.isAuthenticated) {
    if (!authStore.user) {
      await authStore.fetchUser();
    } else {
      // Refresh user data to ensure secret_code is available
      try {
        await authStore.fetchUser();
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  }
  fetchStats();
});
</script>

