<template>
  <AppLayout>
    <div class="min-h-screen py-8" :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
      <div class="container mx-auto px-4 max-w-7xl">
        <!-- Loading State -->
        <div v-if="loadingCategory || loadingProducts" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          {{ t('loading') }}
        </div>

        <!-- Category Not Found -->
        <div v-else-if="!category" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          <svg class="w-16 h-16 mx-auto mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-800'">{{ t('category_not_found') }}</p>
          <button
            @click="$router.push('/dashboard')"
            class="mt-4 px-4 py-2 rounded-lg font-medium text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors"
          >
            {{ t('go_to_dashboard') }}
          </button>
        </div>

        <!-- Category Content -->
        <div v-else>
          <!-- Category Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              {{ getLocalizedName(category) }} {{ t('category') }}
            </h1>
            <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              {{ getLocalizedDescription(category) || t('explore_curated_collection') }}
            </p>
          </div>

          <!-- Products Section -->
          <div>
            <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              {{ t('products') }}
            </h2>

            <!-- Empty State -->
            <div v-if="products.length === 0" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              <svg class="w-16 h-16 mx-auto mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p class="text-lg font-medium mb-2">{{ t('no_products_in_category') }}</p>
              <p class="text-sm">{{ t('check_back_later') }}</p>
            </div>

            <!-- Products Grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="product in products"
                :key="product.id"
                class="rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
                :class="isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'"
              >
                <div 
                  class="relative h-48 overflow-hidden cursor-pointer"
                  @click="$router.push(`/product/${product.id}`)"
                >
                  <div
                    v-if="!product.image_url"
                    class="w-full h-full flex items-center justify-center"
                    :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'"
                  >
                    <svg class="w-24 h-24" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <img
                    v-else
                    :src="product.image_url"
                    :alt="product.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="p-4">
                  <h3 
                    class="font-semibold mb-2 truncate cursor-pointer" 
                    :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                    @click="$router.push(`/product/${product.id}`)"
                  >
                    {{ product.name }}
                  </h3>
                  <p class="text-sm mb-2 line-clamp-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ getLocalizedDescription(product) || '' }}
                  </p>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-lg font-bold text-[#6D4C41]">
                      {{ formatPrice(product.price) }} JD
                    </span>
                    <div v-if="product.admin_rating && product.admin_rating.user?.role === 'admin'" class="flex items-center gap-1">
                      <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span class="text-sm font-semibold" :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-600'">
                        {{ product.admin_rating.rating }}/5
                      </span>
                    </div>
                  </div>
                  <WoodButton
                    v-if="authStore.user && product.stock > 0"
                    @click.stop="addToCart(product.id)"
                    :disabled="addingToCart[product.id] || product.stock <= 0"
                    class="w-full flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart v-if="!addingToCart[product.id]" class="w-4 h-4" />
                    <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{{ addingToCart[product.id] ? t('adding') : t('add_to_cart') }}</span>
                  </WoodButton>
                  <div
                    v-else-if="authStore.user && product.stock <= 0"
                    class="w-full px-3 py-2 rounded-lg font-medium text-sm text-center"
                    :class="isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'"
                  >
                    {{ t('out_of_stock') }}
                  </div>
                  <button
                    v-else
                    @click.stop="$router.push('/')"
                    class="w-full px-3 py-2 rounded-lg font-medium text-sm text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Login to Add
                  </button>
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
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import AppLayout from '../components/AppLayout.vue';
import { ChevronLeft } from 'lucide-vue-next';
import WoodButton from '../components/WoodButton.vue';
import { ShoppingCart } from 'lucide-vue-next';
import { showNotification } from '../utils/notifications';

const route = useRoute();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;
const getLocalizedDescription = languageStore.getLocalizedDescription;
const category = ref(null);
const products = ref([]);
const loadingCategory = ref(false);
const loadingProducts = ref(false);
const addingToCart = ref({});
const isDarkMode = computed(() => authStore.isDarkMode);

const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(numPrice)) return '0.00';
  return numPrice.toFixed(2);
};

const fetchCategory = async () => {
  const categoryId = route.params.id;
  if (!categoryId) return;
  
  loadingCategory.value = true;
  try {
    const response = await window.axios.get(`/categories/${categoryId}`);
    category.value = response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    category.value = null;
  } finally {
    loadingCategory.value = false;
  }
};

const fetchProducts = async () => {
  const categoryId = route.params.id;
  if (!categoryId) return;
  
  loadingProducts.value = true;
  try {
    const response = await window.axios.get('/products', {
      params: { category: categoryId }
    });
    products.value = response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    products.value = [];
  } finally {
    loadingProducts.value = false;
  }
};


const addToCart = async (productId) => {
  if (!authStore.user) {
    showNotification(t('please_login_to_add_items'), 'error');
    return;
  }

  const product = products.value.find(p => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    showNotification(t('product_out_of_stock'), 'warning');
    return;
  }

  addingToCart.value[productId] = true;
  try {
    await window.axios.post('/cart', {
      product_id: productId,
      quantity: 1,
    });
    showNotification(t('added_to_cart'), 'success');
    // Dispatch event to update navbar counts
    window.dispatchEvent(new CustomEvent('cart-updated'));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to add to cart';
    showNotification(errorMessage, 'error');
  } finally {
    addingToCart.value[productId] = false;
  }
};

onMounted(async () => {
  await Promise.all([
    fetchCategory(),
    fetchProducts()
  ]);
});
</script>

