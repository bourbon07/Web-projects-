<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
    <!-- Hero Section -->
    <div 
      class="relative h-96 bg-cover bg-center flex items-center justify-center"
      :style="{
        backgroundImage: 'url(/background%20image.png)',
      }"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-amber-900/40 to-amber-950/40" />
      <div class="relative z-10 text-center text-white px-4">
        <h1 
          class="text-5xl md:text-6xl font-bold mb-4"
        >
          {{ t('makateb_store') }}
        </h1>
        <p class="text-xl md:text-2xl mb-8">{{ t('welcome_description') }}</p>
        <WoodButton size="lg" @click="scrollToProducts">
          {{ t('shop_now') }}
        </WoodButton>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Toggle between Products and Packages -->
      <div class="flex items-center justify-center space-x-4 mb-8">
        <WoodButton
          :variant="showPackages ? 'outline' : 'primary'"
          @click="showPackages = false"
        >
          {{ t('products') }}
        </WoodButton>
        <WoodButton
          :variant="showPackages ? 'primary' : 'outline'"
          @click="showPackages = true"
          class="flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>{{ t('packages') }}</span>
        </WoodButton>
      </div>

      <!-- Categories Filter (only for products) -->
      <div v-if="!showPackages" class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-white">
          {{ t('categories') }}
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <button
            @click="selectedCategory = null"
            :class="[
              'group cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border p-4 flex flex-col items-center justify-center',
              selectedCategory === null 
                ? 'border-amber-500 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30' 
                : 'border-amber-200 dark:border-amber-800/50'
            ]"
          >
            <div class="w-16 h-16 mb-2 rounded-lg overflow-hidden bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white text-center line-clamp-2">
              {{ t('all') }}
            </span>
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="[
              'group cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border p-4 flex flex-col items-center justify-center',
              selectedCategory === category.id 
                ? 'border-amber-500 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30' 
                : 'border-amber-200 dark:border-amber-800/50'
            ]"
          >
            <div class="w-16 h-16 mb-2 rounded-lg overflow-hidden bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
              <img 
                v-if="category.image_url"
                :src="category.image_url" 
                :alt="category.name"
                class="w-full h-full object-cover"
              />
              <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5a.5.5 0 01.5.5v5a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5v-5a.5.5 0 01.5-.5z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white text-center line-clamp-2">
              {{ getLocalizedName(category) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Products Section (when not showing packages) -->
      <div v-if="!showPackages">
        <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          {{ selectedCategory === null ? t('all_products') : getLocalizedName(categories.find(c => c.id === selectedCategory)) || t('products') }}
          <span class="text-lg font-normal text-gray-600 dark:text-gray-400 ml-3">
            ({{ filteredProducts.length }} {{ t('items') }})
          </span>
        </h2>
        <div v-if="loadingProducts" class="text-center py-8 text-gray-500 dark:text-gray-400">
          {{ t('loading') }}
        </div>
        <div v-else-if="filteredProducts.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          {{ t('no_products_found') }}
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            size="small"
            @view-details="(id) => $router.push(`/product/${id}`)"
          />
        </div>
      </div>

      <!-- Packages Section (when showing packages) -->
      <div v-if="showPackages">
        <!-- Packages Section -->
        <div>
          <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {{ t('special_package_deals') }}
          </h2>
          <div v-if="loadingPackages" class="text-center py-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
            {{ t('loading') }}
          </div>
          <div v-else-if="packages.length === 0" class="text-center py-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
            {{ t('no_packages_available') }}
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PackageCard
              v-for="pkg in packages"
              :key="pkg.id"
              :pkg="pkg"
              @view-details="(id) => $router.push(`/package/${id}`)"
            />
          </div>
        </div>
      </div>

    </div>
    <Footer />

    <!-- Benefits Modal -->
    <div
      v-if="showBenefits"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showBenefits = false"
    >
      <div
        @click.stop
        class="rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-gray-800' : 'bg-white'"
      >
        <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              {{ membershipTier }} Benefits
            </h3>
            <button
              @click="showBenefits = false"
              class="transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="benefit in roleBenefits"
              :key="benefit"
              class="flex items-start gap-3"
            >
              <svg class="w-5 h-5 mt-0.5 flex-shrink-0" :class="isDarkMode ? 'text-[#6D4C41]' : 'text-[#6D4C41]'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                {{ benefit }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile Cart Button - Fixed Bottom, Mobile Only -->
    <div v-if="route.name !== 'cart'" class="md:hidden fixed bottom-0 inset-x-0 z-50 p-4 bg-transparent pointer-events-none">
      <div class="flex justify-center items-end pointer-events-auto">
        <WoodButton
          @click="goToCart"
          class="flex items-center justify-center gap-2 shadow-lg"
          size="lg"
        >
          <template v-if="isRTL">
            <span>{{ t('view_your_cart') }}</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span v-if="cartCount > 0" class="bg-white/20 text-white px-2 py-0.5 rounded-full text-sm font-semibold">
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </template>
          <template v-else>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{{ t('view_your_cart') }}</span>
            <span v-if="cartCount > 0" class="bg-white/20 text-white px-2 py-0.5 rounded-full text-sm font-semibold">
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </template>
        </WoodButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import ProductCard from '../components/ProductCard.vue';
import PackageCard from '../components/PackageCard.vue';
import WoodButton from '../components/WoodButton.vue';
import Footer from '../components/Footer.vue';
import { formatPriceDisplay } from '../utils/currency';
import { showNotification } from '../utils/notifications';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;

const user = computed(() => authStore.user);
const isDarkMode = computed(() => authStore.isDarkMode);
const isRTL = computed(() => languageStore.isRTL);
const cartCount = ref(0);

const goToCart = () => {
  router.push('/cart');
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

const handleCartUpdated = () => {
  fetchCartCount();
};

const showBenefits = ref(false);
const loadingOrders = ref(false);
const loadingWishlist = ref(false);
const recentOrders = ref([]);
const allOrders = ref([]);
const wishlistItems = ref([]);
const wishlistProducts = ref([]);
const lastUpdated = ref('');
const packages = ref([]);
const loadingPackages = ref(false);
const addingToCart = ref({});
const packageWishlistStatus = ref({});
const addingToWishlist = ref({});
const categories = ref([]);
const products = ref([]);
const loadingCategories = ref(false);
const loadingProducts = ref(false);
const addingToWishlistProduct = ref({});
const showPackages = ref(false);
const selectedCategory = ref(null);

const filteredProducts = computed(() => {
  let filtered = products.value;

  // Filter by category - support multiple categories per product
  if (selectedCategory.value !== null) {
    filtered = filtered.filter(p => {
      // Check if product has categories array (many-to-many)
      if (p.categories && Array.isArray(p.categories)) {
        return p.categories.some(cat => cat.id === selectedCategory.value);
      }
      // Fallback to category_id for backward compatibility
      return p.category_id === selectedCategory.value;
    });
  }

  return filtered;
});

const scrollToProducts = () => {
  window.scrollTo({ top: 600, behavior: 'smooth' });
};

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

const getLastUpdated = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
  const days = ['Today', 'Yesterday'];
  return `Today, ${displayHours}:${displayMinutes} ${ampm}`;
};

const orderTrend = computed(() => {
  // Calculate trend vs last month (simplified - you can enhance this with actual data)
  if (allOrders.value.length === 0) return 0;
  // For now, return a mock trend. You can implement actual calculation later
  return 12;
});

const newWishlistItemsToday = computed(() => {
  if (!wishlistItems.value || wishlistItems.value.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return wishlistItems.value.filter(item => {
    const itemDate = new Date(item.created_at);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate.getTime() === today.getTime();
  }).length;
});

const totalOrdersCount = computed(() => {
  // For customers: show their orders
  if (user.value?.role === 'customer') {
    return allOrders.value.length;
  }
  // For admins: show all orders
  if (user.value?.role === 'admin') {
    return allOrders.value.length;
  }
  // Default fallback
  return allOrders.value.length;
});

const wishlistItemsCount = computed(() => wishlistItems.value.length);

const displayOrders = computed(() => {
  // For customers: show their orders, for admins: show all orders
  if (user.value?.role === 'admin') {
    return allOrders.value.slice(0, 5);
  }
  return recentOrders.value.slice(0, 5);
});

const wishlistPreview = computed(() => {
  return wishlistProducts.value.slice(0, 2);
});

const membershipTier = computed(() => {
  if (!user.value) return 'Basic Tier';
  if (user.value.role === 'admin') return 'Admin Tier';
  return 'Gold Tier';
});

const roleBenefits = computed(() => {
  if (!user.value) return [];
  const role = user.value.role;
  
  if (role === 'admin') {
    return [
      'View and manage all users',
      'Block or unblock users',
      'Delete any product from the platform',
      'View all user profiles (private or public)',
      'Chat with all users',
      'View customers who added products to cart',
      'Change user data (name, email, password)',
      'Access to all platform features'
    ];
  } else {
    return [
      'Browse and purchase products',
      'Add products to wishlist',
      'View order history',
      'Rate and review products',
      'Chat with admins',
      'Access customer support'
    ];
  }
});

const getCustomerName = (order) => {
  if (order.user?.name) return order.user.name;
  if (order.customer_name) return order.customer_name;
  return 'Guest';
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColorClass = (name) => {
  const colors = [
    'bg-orange-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-[#6D4C41]',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-teal-500',
    'bg-red-500',
  ];
  if (!name) return colors[0];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getProductCategory = (product) => {
  // Use actual category if available
  if (!product) return t('general');
  
  // Check for multiple categories (many-to-many)
  if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
    // Return first category name (or you could return all categories)
    return getLocalizedName(product.categories[0]);
  }
  
  // Fallback to single category
  if (product.category) return getLocalizedName(product.category);
  if (product.category_id) {
    const category = categories.value.find(c => c.id === product.category_id);
    if (category) return getLocalizedName(category);
  }
  
  // Fallback to name-based detection
  const name = product.name?.toLowerCase() || '';
  if (name.includes('quest') || name.includes('vr') || name.includes('virtual')) return 'Electronics';
  if (name.includes('band') || name.includes('watch') || name.includes('wearable')) return 'Wearables';
  if (name.includes('phone') || name.includes('mobile')) return 'Electronics';
  if (name.includes('laptop') || name.includes('computer')) return 'Computers';
  return 'General';
};

const getStatusBadgeClass = (status) => {
  const statusLower = (status || '').toLowerCase();
  if (statusLower === 'completed' || statusLower === 'delivered') {
    return 'bg-[#6D4C41]/20 text-green-800';
  } else if (statusLower === 'pending') {
    return 'bg-yellow-100 text-yellow-800';
  } else if (statusLower === 'shipped') {
    return 'bg-blue-100 text-blue-800';
  } else if (statusLower === 'cancelled') {
    return 'bg-gray-100 text-gray-800';
  }
  return 'bg-blue-100 text-blue-800';
};

const getStatusDisplay = (status) => {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const fetchOrders = async () => {
  if (!user.value) return;
  
  loadingOrders.value = true;
  try {
    const response = await window.axios.get('/orders');
    // Handle both direct array and wrapped in data key
    const ordersData = response.data?.data || response.data || [];
    allOrders.value = Array.isArray(ordersData) ? ordersData : [];
    recentOrders.value = Array.isArray(allOrders.value) ? allOrders.value.slice(0, 5) : [];
    
    // Debug log to verify orders are being fetched
    console.log('Dashboard - Fetched orders count:', allOrders.value.length);
  } catch (error) {
    console.error('Error fetching orders:', error);
    allOrders.value = [];
    recentOrders.value = [];
  } finally {
    loadingOrders.value = false;
  }
};


const fetchWishlist = async () => {
  if (!user.value || (user.value.role !== 'customer' && user.value.role !== 'admin')) return;
  
  loadingWishlist.value = true;
  try {
    const response = await window.axios.get('/wishlist');
    const items = response.data || [];
    wishlistItems.value = Array.isArray(items) ? items : [];
    wishlistProducts.value = Array.isArray(wishlistItems.value) ? wishlistItems.value : [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    wishlistItems.value = [];
    wishlistProducts.value = [];
  } finally {
    loadingWishlist.value = false;
  }
};

const fetchPackages = async () => {
  loadingPackages.value = true;
  try {
    const response = await window.axios.get('/packages');
    packages.value = response.data || [];
    
    // Check wishlist status for each package
    if (user.value) {
      for (const pkg of packages.value) {
        try {
          const wishlistCheck = await window.axios.get(`/wishlist/check/package/${pkg.id}`);
          packageWishlistStatus.value[pkg.id] = wishlistCheck.data?.is_favorite || false;
        } catch (error) {
          packageWishlistStatus.value[pkg.id] = false;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching packages:', error);
    packages.value = [];
  } finally {
    loadingPackages.value = false;
  }
};

const togglePackageWishlist = async (packageId) => {
  addingToWishlist.value[packageId] = true;
  try {
    if (packageWishlistStatus.value[packageId]) {
      // Remove from wishlist
      await window.axios.delete(`/wishlist/package/${packageId}`);
      packageWishlistStatus.value[packageId] = false;
      
      // Check if wishlist is empty and clear localStorage
      if (authStore.user) {
        const currentWishlist = await window.axios.get('/wishlist');
        const wishlistData = currentWishlist.data || [];
        if (wishlistData.length === 0) {
          // Clear localStorage if wishlist is empty
          localStorage.removeItem('user_wishlist_' + authStore.user.id);
        } else {
          const wishlistToSave = wishlistData.map(item => ({
            id: item.id,
            product_id: item.product_id,
            package_id: item.package_id
          }));
          localStorage.setItem('user_wishlist_' + authStore.user.id, JSON.stringify(wishlistToSave));
        }
      } else {
        // Guest user - check and clear guest wishlist if empty
        const { getGuestWishlist, clearGuestWishlist } = await import('../utils/guestStorage');
        const guestWishlist = getGuestWishlist();
        if (guestWishlist.length === 0) {
          clearGuestWishlist();
        }
      }
      
      showNotification(t('removed_from_wishlist'), 'success');
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
    } else {
      // Add to wishlist
      await window.axios.post('/wishlist', { package_id: packageId });
      packageWishlistStatus.value[packageId] = true;
      
      // Update localStorage for authenticated users
      if (authStore.user) {
        const currentWishlist = await window.axios.get('/wishlist');
        const wishlistToSave = (currentWishlist.data || []).map(item => ({
          id: item.id,
          product_id: item.product_id,
          package_id: item.package_id
        }));
        localStorage.setItem('user_wishlist_' + authStore.user.id, JSON.stringify(wishlistToSave));
      }
      
      showNotification(t('added_to_wishlist'), 'success');
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
    }
  } catch (error) {
    if (error.response?.status === 401) {
      showNotification(t('please_login_to_add_items'), 'error');
    } else {
      const errorMessage = error.response?.data?.message || 'Failed to update wishlist';
      showNotification(errorMessage, 'error');
    }
  } finally {
    addingToWishlist.value[packageId] = false;
  }
};

const fetchCategories = async () => {
  loadingCategories.value = true;
  try {
    const response = await window.axios.get('/categories');
    categories.value = response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories.value = [];
  } finally {
    loadingCategories.value = false;
  }
};

const fetchProducts = async () => {
  loadingProducts.value = true;
  try {
    const response = await window.axios.get('/products');
    products.value = response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    products.value = [];
  } finally {
    loadingProducts.value = false;
  }
};


const addProductToCart = async (productId) => {
  addingToCart.value[productId] = true;
  try {
    await window.axios.post('/cart', {
      product_id: productId,
      quantity: 1,
    });
    showNotification(t('added_to_cart'), 'success');
  } catch (error) {
    if (error.response?.status === 401) {
      showNotification(t('please_login_to_add_items'), 'error');
    } else {
      const errorMessage = error.response?.data?.message || 'Failed to add to cart';
      showNotification(errorMessage, 'error');
    }
  } finally {
    addingToCart.value[productId] = false;
  }
};

const categoriesWithProducts = computed(() => {
  return categories.value.map(category => ({
    ...category,
    products: products.value.filter(p => {
      // Check if product has categories array (many-to-many)
      if (p.categories && Array.isArray(p.categories)) {
        return p.categories.some(cat => cat.id === category.id);
      }
      // Fallback to category_id for backward compatibility
      return p.category_id === category.id;
    })
  })).filter(cat => cat.products.length > 0);
});


const addPackageToCart = async (packageId) => {
  addingToCart.value[packageId] = true;
  try {
    const response = await window.axios.post('/cart/package', {
      package_id: packageId,
    });

    const data = response.data;
    const message = data.message || 'the package added to cart';

    showNotification(message, 'success');
  } catch (error) {
    if (error.response?.status === 401) {
      showNotification(t('please_login_to_add_items'), 'error');
    } else {
      const errorMessage = error.response?.data?.message || 'Failed to add package to cart';
      showNotification(errorMessage, 'error');
    }
  } finally {
    addingToCart.value[packageId] = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

onMounted(async () => {
  lastUpdated.value = getLastUpdated();
  
  try {
    if (!authStore.user) {
      try {
        await authStore.fetchUser();
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    }
    
    await Promise.allSettled([
      fetchOrders().catch(err => {
        console.error('Error fetching orders:', err);
        allOrders.value = [];
        recentOrders.value = [];
      }),
      fetchWishlist().catch(err => {
        console.error('Error fetching wishlist:', err);
        wishlistItems.value = [];
        wishlistProducts.value = [];
      }),
      fetchPackages().catch(err => {
        console.error('Error fetching packages:', err);
        packages.value = [];
      }),
      fetchCategories().catch(err => {
        console.error('Error fetching categories:', err);
        categories.value = [];
      }),
      fetchProducts().catch(err => {
        console.error('Error fetching products:', err);
        products.value = [];
      }),
      fetchCartCount().catch(err => {
        console.error('Error fetching cart count:', err);
        cartCount.value = 0;
      })
    ]);
    
    window.addEventListener('cart-updated', handleCartUpdated);
  } catch (error) {
    console.error('Error initializing dashboard:', error);
  }
});

onActivated(() => {
  if (user.value && (user.value.role === 'customer' || user.value.role === 'admin')) {
    fetchWishlist();
  }
  // Refresh orders count when returning to dashboard
  if (user.value) {
    fetchOrders();
  }
  // Refresh cart count when returning to dashboard
  fetchCartCount();
});

watch(() => route.name, (newRouteName) => {
  if (newRouteName === 'dashboard' && user.value && (user.value.role === 'customer' || user.value.role === 'admin')) {
    fetchWishlist();
  }
});

onUnmounted(() => {
  window.removeEventListener('cart-updated', handleCartUpdated);
});
</script>
