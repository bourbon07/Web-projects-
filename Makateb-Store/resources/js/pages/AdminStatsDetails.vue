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

          <h1 class="text-4xl font-bold mb-2 text-gray-900 dark:text-white">{{ getTitle() }}</h1>
          <p class="text-gray-600 dark:text-gray-400">{{ getDescription() }}</p>
        </div>

        <!-- Products List -->
        <div v-if="type === 'products' && !loading">
          <div v-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div
              v-for="product in products"
              :key="product.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                v-if="product.image_url"
                :src="product.image_url"
                :alt="product.name"
                class="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform"
                @click="$router.push(`/product/${product.id}`)"
              />
              <div
                v-else
                class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer"
                @click="$router.push(`/product/${product.id}`)"
              >
                <Package :size="48" class="text-gray-400" />
              </div>
              <div class="p-4">
                <div class="text-sm text-amber-700 dark:text-amber-400 mb-1">
                  {{ product.category ? getLocalizedName(product.category) : t('uncategorized') }}
                </div>
                <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">{{ product.name }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {{ getLocalizedDescription(product) || t('no_description_available') }}
                </p>
                <div class="flex items-center justify-between">
                  <div v-if="product.admin_rating" class="flex items-center gap-1">
                    <Star :size="16" class="text-yellow-500 fill-current" />
                    <span class="text-sm font-medium">{{ product.admin_rating.rating || 0 }}</span>
                  </div>
                  <span class="text-xl font-bold text-amber-800 dark:text-amber-500">
                    {{ formatPrice(product.price) }} JD
                  </span>
                </div>
                <div class="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{{ t('stock') }}: {{ product.stock || 0 }}</span>
                  <div v-if="product.search_count" class="flex items-center gap-1">
                    <Eye :size="16" />
                    <span>{{ product.search_count }}</span>
                  </div>
                </div>
                <WoodButton
                  @click="$router.push(`/product/${product.id}`)"
                  class="w-full mt-4"
                  size="sm"
                >
                  {{ t('view_details') }}
                </WoodButton>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-200 dark:border-amber-800">
            <Package :size="64" class="mx-auto mb-4 text-gray-400" />
            <h3 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{{ t('no_products_found') }}</h3>
          </div>
        </div>

        <!-- Packages List -->
        <div v-if="type === 'packages' && !loading">
          <div v-if="packages.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="pkg in packages"
              :key="pkg.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              @click="$router.push(`/package/${pkg.id}`)"
            >
              <img
                v-if="pkg.image_url"
                :src="pkg.image_url"
                :alt="pkg.name"
                class="w-full h-48 object-cover"
              />
              <div
                v-else
                class="w-full h-48 bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-800 dark:to-amber-900 flex items-center justify-center"
              >
                <Package :size="48" class="text-amber-600 dark:text-amber-300" />
              </div>
              <div class="p-4">
                <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">{{ getLocalizedName(pkg) }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {{ getLocalizedDescription(pkg) || t('no_description_available') }}
                </p>
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <span class="text-2xl font-bold text-amber-800 dark:text-amber-500">
                      {{ formatPrice(pkg.price || pkg.min_price || 0) }} JD
                    </span>
                    <span v-if="pkg.discount && pkg.discount > 0" class="ml-2 text-sm text-green-600 dark:text-green-400">
                      {{ pkg.discount }}% {{ t('off') }}
                    </span>
                  </div>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ pkg.products_count || pkg.products?.length || 0 }} {{ t('items') }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-200 dark:border-amber-800">
            <Package :size="64" class="mx-auto mb-4 text-gray-400" />
            <h3 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{{ t('no_packages_found') }}</h3>
          </div>
        </div>

        <!-- Users List -->
        <div v-if="type === 'users' && !loading">
          <div v-if="users.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="user in users"
              :key="user.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 p-6 cursor-pointer hover:shadow-lg transition-shadow"
              @click="$router.push(`/admin/user/${user.id}/profile`)"
            >
              <div class="flex items-start gap-4">
                <img
                  v-if="user.avatar_url"
                  :src="user.avatar_url"
                  :alt="user.name"
                  class="w-16 h-16 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-16 h-16 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center"
                >
                  <Users :size="32" class="text-amber-800 dark:text-amber-200" />
                </div>
                <div class="flex-1">
                  <h3 class="font-bold text-lg text-gray-900 dark:text-white">
                    {{ user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || t('user') }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</p>
                  <p v-if="user.phone" class="text-sm text-gray-600 dark:text-gray-400">{{ user.phone }}</p>
                  <div class="flex gap-2 mt-2">
                    <span :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    ]">
                      {{ user.role || 'customer' }}
                    </span>
                    <span v-if="user.is_blocked" class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      {{ t('blocked') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-200 dark:border-amber-800">
            <Users :size="64" class="mx-auto mb-4 text-gray-400" />
            <h3 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{{ t('no_users_found') }}</h3>
          </div>
        </div>

        <!-- Active Pages List -->
        <div v-if="type === 'pages' && !loading">
          <div v-if="pages.length > 0" class="space-y-4">
            <div
              v-for="page in pages"
              :key="page.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="flex items-center gap-4 flex-1">
                  <div class="p-4 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-lg">
                    <FileText :size="28" class="text-amber-700 dark:text-amber-400" />
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-1">{{ page.name }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {{ t('path') }}: <span class="font-mono">{{ page.path }}</span>
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ t('last_visit') }}: {{ formatDate(page.last_visit) }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 px-5 py-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Eye :size="22" class="text-amber-700 dark:text-amber-400" />
                  <div>
                    <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">{{ t('total_visits') }}</div>
                    <div class="text-2xl font-bold text-amber-700 dark:text-amber-400">{{ page.visits || 0 }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-200 dark:border-amber-800">
            <FileText :size="64" class="mx-auto mb-4 text-gray-400" />
            <h3 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{{ t('no_pages_found') }}</h3>
          </div>
        </div>

        <!-- Blocked Users List -->
        <div v-if="type === 'blocked' && !loading">
          <div v-if="blockedUsers.length > 0" class="space-y-4">
            <div
              v-for="user in blockedUsers"
              :key="user.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-red-200 dark:border-red-900/30 p-6"
            >
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="flex items-center gap-4">
                  <img
                    v-if="user.avatar_url"
                    :src="user.avatar_url"
                    :alt="user.name"
                    class="w-16 h-16 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="w-16 h-16 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center"
                  >
                    <UserX :size="32" class="text-red-800 dark:text-red-200" />
                  </div>
                  <div>
                    <h3 class="font-bold text-lg text-gray-900 dark:text-white">
                      {{ user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || t('user') }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</p>
                    <p v-if="user.blocked_at" class="text-xs text-red-600 dark:text-red-400">
                      {{ t('blocked_on') }}: {{ formatDate(user.blocked_at) }}
                    </p>
                  </div>
                </div>
                <WoodButton
                  @click="handleUnblock(user)"
                  variant="outline"
                  class="!bg-green-50 dark:!bg-green-900/20 !text-green-600 dark:!text-green-400"
                >
                  {{ t('unblock_user') }}
                </WoodButton>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-200 dark:border-amber-800">
            <UserX :size="64" class="mx-auto mb-4 text-gray-400" />
            <h3 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{{ t('no_blocked_users') }}</h3>
            <p class="text-gray-600 dark:text-gray-400">
              {{ t('all_users_active') }}
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-16">
          <p class="text-gray-600 dark:text-gray-400">{{ t('loading') }}</p>
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
import WoodButton from '../components/WoodButton.vue';
import { confirmAction } from '../utils/confirmation';
import { showNotification } from '../utils/notifications';
import { 
  ChevronLeft, 
  Package, 
  Users, 
  FileText, 
  UserX, 
  Star, 
  Eye 
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;
const getLocalizedDescription = languageStore.getLocalizedDescription;

const type = computed(() => route.params.type || 'products');
const products = ref([]);
const packages = ref([]);
const users = ref([]);
const pages = ref([]);
const blockedUsers = ref([]);
const loading = ref(false);

const getTitle = () => {
  switch (type.value) {
    case 'products':
      return t('all_products');
    case 'packages':
      return t('all_packages');
    case 'users':
      return t('all_users');
    case 'pages':
      return t('active_pages');
    case 'blocked':
      return t('blocked_users');
    default:
      return t('details');
  }
};

const getDescription = () => {
  switch (type.value) {
    case 'products':
      return t('showing_all_products').replace('{count}', products.value.length);
    case 'packages':
      return t('showing_all_packages').replace('{count}', packages.value.length);
    case 'users':
      return t('total_registered_users').replace('{count}', users.value.length);
    case 'pages':
      return t('active_pages_count').replace('{count}', pages.value.length);
    case 'blocked':
      return t('blocked_users_count').replace('{count}', blockedUsers.value.length);
    default:
      return '';
  }
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get('/products', { params: { per_page: 1000 } });
    products.value = response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get('/admin/users', { params: { per_page: 1000 } });
    users.value = response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    users.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchPages = async () => {
  loading.value = true;
  try {
    // Import page visits utility
    const { getAllPageVisits } = await import('../utils/pageVisits');
    const allVisits = getAllPageVisits();
    
    // Define all pages with their translations
    const pageDefinitions = [
      { path: '/', name: t('home_page') },
      { path: '/dashboard', name: t('products_page') },
      { path: '/cart', name: t('shopping_cart') },
      { path: '/wishlist', name: t('wishlist') },
      { path: '/checkout', name: t('checkout') },
      { path: '/profile', name: t('profile_page') },
      { path: '/orders', name: t('orders_history') },
      { path: '/settings', name: t('settings') },
      { path: '/chat', name: t('support_chat') },
      { path: '/search', name: t('search_results') },
      { path: '/packages', name: t('packages') },
    ];
    
    // Build pages array from tracked visits
    pages.value = pageDefinitions.map((pageDef, index) => {
      const visitData = allVisits[pageDef.path] || { visits: 0, last_visit: null };
      return {
        id: String(index + 1),
        name: pageDef.name,
        path: pageDef.path,
        visits: visitData.visits || 0,
        last_visit: visitData.last_visit || new Date().toISOString()
      };
    }).filter(page => page.visits > 0 || page.path === '/' || page.path === '/dashboard'); // Show main pages even if not visited yet
  } catch (error) {
    console.error('Error fetching pages:', error);
    pages.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchBlockedUsers = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get('/admin/blocked-users');
    blockedUsers.value = response.data || [];
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    blockedUsers.value = [];
  } finally {
    loading.value = false;
  }
};

const handleUnblock = async (user) => {
  const confirmed = await confirmAction({
    action: t('unblock_user') || 'unblock this user',
    message: t('are_you_sure_unblock_user'),
    destructive: false
  });
  if (!confirmed) return;
  
  try {
    if (user.email) {
      await window.axios.post('/admin/users/unblock-by-email', { email: user.email });
    } else if (user.id) {
      await window.axios.post(`/admin/users/${user.id}/unblock`);
    }
    showNotification(t('user_unblocked_successfully'), 'success');
    await fetchBlockedUsers();
  } catch (error) {
    console.error('Error unblocking user:', error);
    showNotification(error.response?.data?.message || t('failed_to_unblock_user'), 'error');
  }
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(numPrice)) return '0.00';
  return numPrice.toFixed(2);
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

onMounted(() => {
  if (type.value === 'products') {
    fetchProducts();
  } else if (type.value === 'packages') {
    fetchPackages();
  } else if (type.value === 'users') {
    fetchUsers();
  } else if (type.value === 'pages') {
    fetchPages();
  } else if (type.value === 'blocked') {
    fetchBlockedUsers();
  }
});
</script>

