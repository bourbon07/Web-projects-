<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            <span v-if="isCategorySearch && searchCategory">
              {{ t('category') }}: {{ searchCategory.name }}
            </span>
            <span v-else>{{ t('search_page') }}</span>
          </h1>
          
          <!-- Search Bar -->
          <form @submit.prevent="handleSearch" class="flex gap-3">
            <div class="relative flex-1">
              <input
                type="text"
                :placeholder="t('search_products')"
                v-model="localSearchQuery"
                class="w-full px-6 py-4 pl-14 pr-4 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-md"
              />
              <Search class="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
            </div>
            <WoodButton
              type="submit"
              size="lg"
              class="px-6"
            >
              {{ t('search') }}
            </WoodButton>
          </form>
        </div>

        <!-- Filters Bar -->
        <div class="flex flex-col md:flex-row gap-4 mb-8">
          <!-- Mobile Filter Toggle -->
          <button
            @click="showFilters = !showFilters"
            class="md:hidden flex items-center justify-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-200 dark:border-amber-800 text-gray-900 dark:text-white"
          >
            <Filter class="w-5 h-5" />
            <span>{{ t('filter') }}</span>
          </button>

          <!-- Desktop Filters -->
          <div :class="[showFilters ? 'flex' : 'hidden md:flex', 'flex-col', 'md:flex-row', 'gap-4', 'w-full']">
            <!-- Category Filter -->
            <select
              v-model="selectedCategory"
              @change="search"
              class="px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">{{ t('all') }}</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ getLocalizedName(category) }}
              </option>
            </select>

            <!-- Sort By -->
            <select
              v-model="sortBy"
              @change="search"
              class="px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="relevance">{{ t('most_relevant') }}</option>
              <option value="price-low">{{ t('price_low_to_high') }}</option>
              <option value="price-high">{{ t('price_high_to_low') }}</option>
              <option value="rating">{{ t('highest_rated') }}</option>
            </select>

            <!-- Price Range -->
            <div class="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-200 dark:border-amber-800">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('price') }}:</span>
              <input
                type="number"
                v-model.number="priceRange[0]"
                @change="search"
                class="w-20 px-2 py-1 rounded border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                :placeholder="t('min')"
              />
              <span class="text-gray-600 dark:text-gray-400">-</span>
              <input
                type="number"
                v-model.number="priceRange[1]"
                @change="search"
                class="w-20 px-2 py-1 rounded border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                :placeholder="t('max')"
              />
            </div>

            <!-- Reset Filters -->
            <button
              @click="resetFilters"
              class="px-4 py-2 rounded-lg border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Results Count -->
        <div class="mb-6">
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('found') }} <span class="font-bold text-amber-800 dark:text-amber-500">{{ filteredProducts.length }}</span> {{ t('products') }}
            <span v-if="localSearchQuery"> {{ t('for') }} "<span class="font-medium">{{ localSearchQuery }}</span>"</span>
          </p>
        </div>

        <!-- Products Grid -->
        <div v-if="loading" class="text-center py-12 text-gray-600 dark:text-gray-400">
          {{ t('loading') }}
        </div>
        <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 overflow-hidden hover:shadow-xl transition-shadow group"
          >
            <div class="relative">
              <img
                v-if="getProductImage(product)"
                :src="getProductImage(product)"
                :alt="product.name"
                class="w-full h-48 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                @click="handleProductClick(product.id)"
              />
              <div
                v-else
                class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer"
                @click="handleProductClick(product.id)"
              >
                <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <button
                @click.stop="handleToggleWishlist(product.id)"
                :class="[
                  'absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-colors',
                  isInWishlist(product.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white'
                ]"
              >
                <Heart :class="['w-5 h-5', isInWishlist(product.id) ? 'fill-current' : '']" />
              </button>
              <div v-if="product.stock !== null && product.stock !== undefined && product.stock < 10" class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                {{ t('only_left') }} {{ product.stock }}
              </div>
            </div>

            <div class="p-4">
              <div class="text-sm text-amber-700 dark:text-amber-400 mb-1">{{ getCategoryName(product.category_id) }}</div>
              <h3
                class="font-bold text-lg mb-2 text-gray-900 dark:text-white cursor-pointer hover:text-amber-800 dark:hover:text-amber-500"
                @click="handleProductClick(product.id)"
              >
                {{ product.name }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {{ getLocalizedDescription(product) || t('no_description_available') }}
              </p>

              <div class="flex items-center mb-3">
                <div class="flex items-center">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    :class="[
                      'w-4 h-4',
                      i <= getProductRating(product)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    ]"
                  />
                </div>
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  ({{ getReviewCount(product) }})
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-2xl font-bold text-amber-800 dark:text-amber-500">
                  {{ formatPrice(product.price) }}
                </span>
                <WoodButton
                  @click.stop="handleAddToCart(product)"
                  class="flex items-center justify-center space-x-2"
                >
                  <ShoppingCart class="w-4 h-4" />
                  <span>{{ t('add_to_cart') }}</span>
                </WoodButton>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16">
          <Search class="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{{ t('no_products_found') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ t('try_adjusting_search') }}
          </p>
          <WoodButton @click="resetFilters">
            {{ t('clear_all_filters') }}
          </WoodButton>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import { Search, Filter, Star, ShoppingCart, Heart, X } from 'lucide-vue-next';
import { formatPriceDisplay } from '../utils/currency';
import { showNotification } from '../utils/notifications';
import { confirmAction } from '../utils/confirmation';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;
const getLocalizedDescription = languageStore.getLocalizedDescription;

const isDarkMode = computed(() => authStore.isDarkMode);
const localSearchQuery = ref(route.query.q || '');
const products = ref([]);
const categories = ref([]);
const wishlistItems = ref([]);
const loading = ref(false);
const selectedCategory = ref('');
const priceRange = ref([0, 1000]);
const sortBy = ref('relevance');
const showFilters = ref(false);
const searchCategory = ref(null);
const isCategorySearch = ref(false);

const filteredProducts = computed(() => {
  // If it's a category search, return products directly (already filtered by backend)
  if (isCategorySearch.value) {
    return products.value;
  }
  
  let results = [...products.value];

  // Search filter (only if not category search)
  if (localSearchQuery.value && !isCategorySearch.value) {
    const query = localSearchQuery.value.toLowerCase();
    results = results.filter(product =>
      product.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      getCategoryName(product.category_id)?.toLowerCase().includes(query)
    );
  }

  // Category filter - support multiple categories per product
  if (selectedCategory.value) {
    results = results.filter(product => {
      // Check if product has categories array (many-to-many)
      if (product.categories && Array.isArray(product.categories)) {
        return product.categories.some(cat => cat.id == selectedCategory.value);
      }
      // Fallback to category_id for backward compatibility
      return product.category_id == selectedCategory.value;
    });
  }

  // Price range filter
  results = results.filter(product => {
    const price = parseFloat(product.price) || 0;
    return price >= priceRange.value[0] && price <= priceRange.value[1];
  });

  // Sorting
  switch (sortBy.value) {
    case 'price-low':
      results.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
      break;
    case 'price-high':
      results.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
      break;
    case 'rating':
      results.sort((a, b) => getProductRating(b) - getProductRating(a));
      break;
    default:
      // Relevance - keep original order
      break;
  }

  return results;
});

const getCategoryName = (categoryId) => {
  if (!categoryId) return 'Uncategorized';
  const category = categories.value.find(c => c.id == categoryId);
  return category ? getLocalizedName(category) : t('uncategorized');
};

const getProductImage = (product) => {
  if (product.image_url) return product.image_url;
  if (product.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0) {
    return product.image_urls[0];
  }
  return null;
};

const getProductRating = (product) => {
  if (product.average_rating) return Math.round(parseFloat(product.average_rating));
  if (product.admin_rating?.rating) return Math.round(parseFloat(product.admin_rating.rating));
  return 0;
};

const getReviewCount = (product) => {
  if (product.comments_count) return product.comments_count;
  if (product.reviews?.length) return product.reviews.length;
  return 0;
};

const isInWishlist = (productId) => {
  return wishlistItems.value.some(item => item.product_id == productId);
};

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const fetchCategories = async () => {
  try {
    const response = await window.axios.get('/categories');
    categories.value = response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories.value = [];
  }
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    let response;
    if (localSearchQuery.value) {
      // Search with query parameter
      response = await window.axios.get('/products', {
        params: { search: localSearchQuery.value, q: localSearchQuery.value }
      });
      
      // Check if it's a category search
      if (response.data.is_category_search && response.data.category) {
        isCategorySearch.value = true;
        searchCategory.value = response.data.category;
        products.value = response.data.products || [];
      } else if (response.data.products) {
        // Regular search with products array
        isCategorySearch.value = false;
        searchCategory.value = null;
        products.value = response.data.products || [];
      } else {
        // Direct products array
        isCategorySearch.value = false;
        searchCategory.value = null;
        products.value = Array.isArray(response.data) ? response.data : [];
      }
    } else {
      response = await window.axios.get('/products');
      products.value = response.data || [];
      isCategorySearch.value = false;
      searchCategory.value = null;
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    products.value = [];
    isCategorySearch.value = false;
    searchCategory.value = null;
  } finally {
    loading.value = false;
  }
};

const fetchWishlist = async () => {
  try {
    const response = await window.axios.get('/wishlist');
    wishlistItems.value = response.data || [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    wishlistItems.value = [];
  }
};

const handleSearch = async () => {
  if (localSearchQuery.value) {
    router.replace({ query: { q: localSearchQuery.value } });
    // Fetch products with search query to check for category match
    await fetchProducts();
    // Dispatch event to notify other components that a search was performed
    window.dispatchEvent(new CustomEvent('search-performed', {
      detail: { query: localSearchQuery.value }
    }));
  } else {
    router.replace({ query: {} });
    await fetchProducts();
  }
};

const search = () => {
  // Trigger recomputation of filteredProducts
  // The computed property will handle the filtering
};

const resetFilters = () => {
  selectedCategory.value = '';
  priceRange.value = [0, 1000];
  sortBy.value = 'relevance';
  localSearchQuery.value = '';
  router.replace({ query: {} });
};

const handleProductClick = (productId) => {
  router.push(`/product/${productId}`);
};

const handleAddToCart = async (product) => {
  if (!authStore.isAuthenticated) {
    const confirmed = await confirmAction({
      message: t('please_login_to_add_items_to_cart') || 'Please login to add items to cart. Would you like to login now?',
      destructive: false
    });
    if (confirmed) {
      router.push({ name: 'login', query: { redirect: '/search' } });
    }
    return;
  }

  try {
    await window.axios.post('/cart', {
      product_id: product.id,
      quantity: 1,
    });
    showNotification(t('added_to_cart'), 'success');
    // Dispatch event to update navbar counts
    window.dispatchEvent(new CustomEvent('cart-updated'));
  } catch (error) {
    console.error('Error adding to cart:', error);
    showNotification(error.response?.data?.message || t('failed_to_add_to_cart'), 'error');
  }
};

const handleToggleWishlist = async (productId) => {
  if (!authStore.isAuthenticated) {
    const confirmed = await confirmAction({
      message: t('please_login_to_manage_wishlist') || 'Please login to manage wishlist. Would you like to login now?',
      destructive: false
    });
    if (confirmed) {
      router.push({ name: 'login', query: { redirect: '/search' } });
    }
    return;
  }

  try {
    const isInList = isInWishlist(productId);
    if (isInList) {
      // Remove from wishlist
      const wishlistItem = wishlistItems.value.find(item => item.product_id == productId);
      if (wishlistItem) {
        await window.axios.delete(`/wishlist/${wishlistItem.id}`);
        
        // Fetch updated wishlist from backend to get accurate state
        const currentWishlist = await window.axios.get('/wishlist');
        const wishlistData = currentWishlist.data || [];
        
        // Update local state
        wishlistItems.value = wishlistData;
        
        // Clear localStorage if wishlist is empty
        if (wishlistData.length === 0) {
          if (authStore.user) {
            localStorage.removeItem('user_wishlist_' + authStore.user.id);
          } else {
            const { clearGuestWishlist } = await import('../utils/guestStorage');
            clearGuestWishlist();
          }
        } else if (authStore.user) {
          // Update localStorage with remaining items
          const wishlistToSave = wishlistData.map(item => ({
            id: item.id,
            product_id: item.product_id,
            package_id: item.package_id
          }));
          localStorage.setItem('user_wishlist_' + authStore.user.id, JSON.stringify(wishlistToSave));
        }
        
        showNotification(t('removed_from_wishlist'), 'success');
        // Dispatch event to update navbar counts
        window.dispatchEvent(new CustomEvent('wishlist-updated'));
      }
    } else {
      // Add to wishlist
      await window.axios.post('/wishlist', {
        product_id: productId,
      });
      await fetchWishlist();
      showNotification(t('added_to_wishlist'), 'success');
      // Dispatch event to update navbar counts
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    showNotification(error.response?.data?.message || t('failed_to_update_wishlist'), 'error');
  }
};

onMounted(async () => {
  await fetchCategories();
  await fetchProducts();
  if (authStore.isAuthenticated) {
    await fetchWishlist();
  }
});

// Watch for route query changes to refetch products
watch(() => route.query.q, async (newQuery) => {
  if (newQuery !== localSearchQuery.value) {
    localSearchQuery.value = newQuery || '';
    await fetchProducts();
  }
});

// Watch for route query changes to refetch products
watch(() => route.query.q, async (newQuery) => {
  if (newQuery !== localSearchQuery.value) {
    localSearchQuery.value = newQuery || '';
    await fetchProducts();
  }
});
</script>
