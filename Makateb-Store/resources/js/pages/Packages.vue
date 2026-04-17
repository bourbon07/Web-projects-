<template>
  <AppLayout>
    <div class="min-h-screen py-8" :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
      <div class="container mx-auto px-4 max-w-7xl">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ t('all_packages') }}</h1>
          <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('browse_packages') }}</p>
        </div>

        <!-- Filters Section -->
        <div class="mb-6 space-y-4">
          <!-- Search Bar -->
          <div class="relative max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('search_packages')"
              class="w-full pl-10 pr-4 py-2 rounded-lg border"
              :class="isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'"
            />
          </div>
          
          <!-- Filter Controls -->
          <div class="flex flex-wrap gap-4 items-end">
            <!-- Sort By -->
            <div class="flex-1 min-w-[200px]">
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                {{ t('sort_by') }}
              </label>
              <select
                v-model="sortBy"
                class="w-full px-4 py-2 rounded-lg border"
                :class="isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'"
              >
                <option value="latest">{{ t('latest') }}</option>
                <option value="name_asc">{{ t('name_a_to_z') }}</option>
                <option value="name_desc">{{ t('name_z_to_a') }}</option>
                <option value="products_asc">{{ t('products_low_to_high') }}</option>
                <option value="products_desc">{{ t('products_high_to_low') }}</option>
              </select>
            </div>
            
            <!-- Clear Filters -->
            <button
              @click="clearFilters"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          {{ t('loading_packages') }}
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredPackages.length === 0" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          <svg class="w-16 h-16 mx-auto mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p class="text-lg font-medium mb-2">No packages found</p>
          <p class="text-sm">{{ searchQuery ? 'Try a different search term' : 'Check back later for new packages' }}</p>
        </div>

        <!-- Packages Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="pkg in filteredPackages"
            :key="pkg.id"
            @click="$router.push(`/package/${pkg.id}`)"
            class="rounded-xl shadow-sm overflow-hidden cursor-pointer transition-transform hover:scale-105"
            :class="isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'"
          >
            <!-- Package Image -->
            <div class="relative h-48 overflow-hidden">
              <div
                v-if="!pkg.image_url"
                class="w-full h-full flex items-center justify-center"
                :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'"
              >
                <svg class="w-24 h-24" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <img
                v-else
                :src="pkg.image_url"
                :alt="pkg.name"
                class="w-full h-full object-cover"
              />
              <div class="absolute top-2 right-2">
                <span class="px-2 py-1 rounded-full text-xs font-semibold text-white bg-[#6D4C41]">
                  {{ pkg.products_count || 0 }} items
                </span>
              </div>
            </div>
            
            <!-- Package Info -->
            <div class="p-4">
              <h3 class="font-semibold mb-2 truncate text-lg" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ getLocalizedName(pkg) }}
              </h3>
              <p class="text-sm mb-3 line-clamp-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ getLocalizedDescription(pkg) || t('explore_curated_collection') }}
              </p>
              <div class="flex gap-2 mt-3">
                <WoodButton
                  v-if="authStore.user"
                  @click.stop="addPackageToCart(pkg.id)"
                  :disabled="addingToCart[pkg.id]"
                  class="flex-1 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart v-if="!addingToCart[pkg.id]" class="w-4 h-4" />
                  <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ addingToCart[pkg.id] ? t('adding') : t('add_to_cart') }}</span>
                </WoodButton>
                <button
                  v-if="authStore.user"
                  @click.stop="togglePackageWishlist(pkg.id)"
                  class="px-3 py-2 rounded-lg font-medium text-sm transition-colors"
                  :class="isInWishlist[pkg.id] 
                    ? 'text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100' 
                    : (isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                  title="Add to Wishlist"
                >
                  <svg class="w-4 h-4" :class="isInWishlist[pkg.id] ? 'fill-current' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button
                  @click.stop="$router.push(`/package/${pkg.id}`)"
                  class="px-3 py-2 rounded-lg font-medium text-sm transition-colors"
                  :class="isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  View
                </button>
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
import { ShoppingCart } from 'lucide-vue-next';
import { showNotification } from '../utils/notifications';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;
const getLocalizedDescription = languageStore.getLocalizedDescription;
const packages = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const sortBy = ref('latest');
const addingToCart = ref({});

const isDarkMode = computed(() => authStore.isDarkMode);

const filteredPackages = computed(() => {
  let filtered = packages.value;
  
  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(pkg => 
      pkg.name.toLowerCase().includes(query) ||
      (pkg.description && pkg.description.toLowerCase().includes(query))
    );
  }
  
  // Sort
  if (sortBy.value === 'name_asc') {
    filtered = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (sortBy.value === 'name_desc') {
    filtered = [...filtered].sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  } else if (sortBy.value === 'products_asc') {
    filtered = [...filtered].sort((a, b) => (a.products_count || 0) - (b.products_count || 0));
  } else if (sortBy.value === 'products_desc') {
    filtered = [...filtered].sort((a, b) => (b.products_count || 0) - (a.products_count || 0));
  }
  // 'latest' is default (already sorted by backend)
  
  return filtered;
});

const clearFilters = () => {
  searchQuery.value = '';
  sortBy.value = 'latest';
};

const fetchPackages = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get('/packages');
    packages.value = response.data || [];
    
    // Check wishlist status for each package
    if (authStore.user) {
      for (const pkg of packages.value) {
        try {
          const wishlistCheck = await window.axios.get(`/wishlist/check/package/${pkg.id}`);
          isInWishlist.value[pkg.id] = wishlistCheck.data?.is_favorite || false;
        } catch (error) {
          isInWishlist.value[pkg.id] = false;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching packages:', error);
    packages.value = [];
  } finally {
    loading.value = false;
  }
};

const togglePackageWishlist = async (packageId) => {
  addingToWishlist.value[packageId] = true;
  try {
    if (isInWishlist.value[packageId]) {
      // Remove from wishlist
      await window.axios.delete(`/wishlist/package/${packageId}`);
      isInWishlist.value[packageId] = false;
      
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
        const { getGuestWishlist, clearGuestWishlist, removeFromGuestWishlist } = await import('../utils/guestStorage');
        removeFromGuestWishlist(null, packageId);
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
      isInWishlist.value[packageId] = true;
      
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
      const errorMessage = error.response?.data?.message || t('failed_to_update_wishlist');
      showNotification(errorMessage, 'error');
    }
  } finally {
    addingToWishlist.value[packageId] = false;
  }
};

const addPackageToCart = async (packageId) => {
  addingToCart.value[packageId] = true;
  try {
    const response = await window.axios.post('/cart/package', {
      package_id: packageId,
    });

    const data = response.data;
    const message = data.message || t('package_added_to_cart');
    showNotification(message, 'success');
  } catch (error) {
    if (error.response?.status === 401) {
      showNotification(t('please_login_to_add_items'), 'error');
    } else {
      const errorMessage = error.response?.data?.message || t('failed_to_add_to_cart');
      showNotification(errorMessage, 'error');
    }
  } finally {
    addingToCart.value[packageId] = false;
  }
};

onMounted(() => {
  fetchPackages();
});
</script>

