<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div v-if="loading" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          {{ t('loading') }}
        </div>
        
        <div v-else-if="packageData">
          <!-- Package Details -->
          <div class="grid md:grid-cols-2 gap-8 mb-12">
            <!-- Image -->
            <div class="relative aspect-square rounded-lg overflow-hidden shadow-xl">
              <img
                :src="packageData.image_url || '/placeholder.png'"
                :alt="packageData.name"
                class="w-full h-full object-cover"
              />
              <div v-if="discountPercentage > 0" class="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2">
                <Package class="w-5 h-5" />
                <span>{{ t('save') }} {{ discountPercentage }}%</span>
              </div>
            </div>

            <!-- Details -->
            <div>
              <div class="flex items-center space-x-2 text-amber-700 dark:text-amber-500 font-medium mb-2">
                <Package class="w-5 h-5" />
                <span>{{ t('special_package_deal') }}</span>
              </div>
              <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                {{ packageData.name }}
              </h1>

              <!-- Rating -->
              <div class="flex items-center space-x-4 mb-6">
                <div class="flex items-center space-x-1">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    class="w-5 h-5"
                    :class="i <= Math.floor(averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'"
                  />
                </div>
                <span class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ averageRating.toFixed(1) }}</span>
                <span class="text-gray-500">({{ ratingData.total_ratings || 0 }} {{ t('reviews') }})</span>
              </div>

              <!-- Pricing -->
              <div class="mb-6">
                <div v-if="originalPrice > packagePrice" class="text-xl text-gray-500 line-through mb-1">
                  {{ formatPrice(originalPrice) }}
                </div>
                <div class="flex items-baseline space-x-3">
                  <span class="text-4xl font-bold text-amber-900 dark:text-amber-500">
                    {{ formatPrice(packagePrice) }}
                  </span>
                  <span v-if="savingsAmount > 0" class="text-xl text-green-600 dark:text-green-400 font-bold">
                    {{ t('save') }} {{ formatPrice(savingsAmount) }}!
                  </span>
                </div>
              </div>

              <!-- Description -->
              <p class="text-gray-700 dark:text-gray-300 mb-8 text-lg">
                {{ getLocalizedDescription(packageData) || t('no_description_available') }}
              </p>

              <!-- Quantity Selector -->
              <div class="mb-6">
                <label class="block font-semibold mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ t('quantity') }}</label>
                <div class="flex items-center space-x-4">
                  <button
                    @click="decreaseQuantity"
                    class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    <Minus class="w-5 h-5" />
                  </button>
                  <span class="text-2xl font-bold w-12 text-center" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ quantity }}</span>
                  <button
                    @click="increaseQuantity"
                    class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    <Plus class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4">
                <WoodButton
                  @click="addPackageToCart"
                  :disabled="addingToCart || products.length === 0"
                  size="lg"
                >
                  <ShoppingCart class="w-5 h-5" />
                  <span>{{ addingToCart ? t('adding') : t('add_package_to_cart') }}</span>
                </WoodButton>
                <WoodButton
                  @click="togglePackageWishlist"
                  :variant="isInWishlist ? 'primary' : 'outline'"
                  size="lg"
                >
                  <Heart class="w-5 h-5" :class="isInWishlist ? 'fill-current' : ''" />
                </WoodButton>
              </div>
            </div>
          </div>

          <!-- Package Contents -->
          <div class="border-t-2 border-amber-200 dark:border-amber-900 pt-8">
            <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              {{ t('whats_included') }} ({{ products.length }} {{ t('items') }})
            </h2>

            <div v-if="loadingProducts" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              {{ t('loading') }}
            </div>
            
            <div v-else-if="products.length === 0" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              {{ t('no_products_in_package') }}
            </div>

            <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="product in products"
                :key="product.id"
                @click="$router.push(`/product/${product.id}`)"
                class="group cursor-pointer bg-amber-50 dark:bg-amber-950/20 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-amber-200 dark:border-amber-800/50"
              >
                <div class="relative aspect-[4/3] overflow-hidden bg-white">
                  <img
                    v-if="product.image_url"
                    :src="product.image_url"
                    :alt="product.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <Package class="w-16 h-16" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" />
                  </div>
                </div>
                <div class="p-4 bg-amber-50 dark:bg-amber-950/20">
                  <div class="mb-2">
                    <span class="text-xs text-amber-800 dark:text-amber-300 font-medium uppercase tracking-wide">
                      {{ product.category ? getLocalizedName(product.category) : t('general') }}
                    </span>
                  </div>
                  <h3 class="font-semibold text-base mb-2 text-gray-900 dark:text-white line-clamp-2">
                    {{ product.name }}
                  </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                    {{ getLocalizedDescription(product) || t('no_description_available') }}
                  </p>
                  <div class="flex items-center justify-between mt-4">
                    <span class="text-lg font-bold text-gray-900 dark:text-white">
                      {{ formatPrice(product.price) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="border-t-2 border-amber-200 dark:border-amber-900 pt-8 mt-12">
            <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              {{ t('customer_reviews') }}
            </h2>

            <!-- Existing Reviews -->
            <div class="space-y-6 mb-8">
              <div v-if="commentsLoading" class="text-center py-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ t('loading') }}
              </div>
              <div v-else-if="comments.length > 0">
                <div
                  v-for="comment in comments"
                  :key="comment.id"
                  class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center font-bold" :class="isDarkMode ? 'text-amber-100' : 'text-amber-900'">
                        {{ (comment.user?.name || 'U')[0].toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ comment.user?.name || t('anonymous') }}</div>
                        <div class="text-sm text-gray-500">{{ formatDate(comment.created_at) }}</div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-1">
                      <Star
                        v-for="i in 5"
                        :key="i"
                        class="w-4 h-4"
                        :class="i <= getUserRating(comment.user_id) ? 'text-yellow-500 fill-current' : 'text-gray-300'"
                      />
                    </div>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300">{{ comment.comment }}</p>
                  <img v-if="comment.image_url" :src="comment.image_url" alt="Comment image" class="mt-3 max-w-md rounded-lg" />
                </div>
              </div>
              <p v-else class="text-gray-500 dark:text-gray-400">
                {{ t('no_reviews_yet') }}
              </p>
            </div>

            <!-- Add Review Form -->
            <div class="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg">
              <h3 class="text-xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ t('write_review') }}</h3>
              <form @submit.prevent="handleSubmitReview" class="space-y-4">
                <div>
                  <label class="block font-semibold mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ t('rating') }}</label>
                  <div class="flex space-x-2">
                    <button
                      v-for="rating in 5"
                      :key="rating"
                      type="button"
                      @click="newReview.rating = rating"
                      class="p-2"
                    >
                      <Star
                        class="w-8 h-8"
                        :class="rating <= newReview.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'"
                      />
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block font-semibold mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ t('your_review') }}</label>
                  <textarea
                    v-model="newReview.comment"
                    class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    :class="isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'"
                    rows="4"
                    :placeholder="t('share_thoughts')"
                    required
                  />
                </div>
                <WoodButton type="submit" :disabled="uploadingComment">
                  {{ uploadingComment ? t('submitting') : t('submit_review') }}
                </WoodButton>
              </form>
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
import WoodButton from '../components/WoodButton.vue';
import { Package, Minus, Plus, ShoppingCart, Heart, Star } from 'lucide-vue-next';
import { formatPriceDisplay } from '../utils/currency';
import { showNotification } from '../utils/notifications';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;
const getLocalizedDescription = languageStore.getLocalizedDescription;

const packageData = ref(null);
const products = ref([]);
const comments = ref([]);
const ratingData = ref({});
const loading = ref(false);
const loadingProducts = ref(false);
const commentsLoading = ref(false);
const addingToCart = ref(false);
const isInWishlist = ref(false);
const addingToWishlist = ref(false);
const uploadingComment = ref(false);
const quantity = ref(1);
const newReview = ref({
  rating: 5,
  comment: ''
});

const isDarkMode = computed(() => authStore.isDarkMode);
const user = computed(() => authStore.user);

const averageRating = computed(() => {
  return parseFloat(ratingData.value?.average_rating || 0);
});

// Calculate pricing
const packagePrice = computed(() => {
  if (!packageData.value) return 0;
  return parseFloat(packageData.value.price || 0);
});

const originalPrice = computed(() => {
  if (products.value.length === 0) return packagePrice.value;
  return products.value.reduce((sum, product) => {
    return sum + parseFloat(product.price || 0);
  }, 0);
});

const savingsAmount = computed(() => {
  return Math.max(0, originalPrice.value - packagePrice.value);
});

const discountPercentage = computed(() => {
  if (originalPrice.value === 0) return 0;
  return Math.round((savingsAmount.value / originalPrice.value) * 100);
});

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const fetchPackage = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get(`/packages/${route.params.id}`);
    packageData.value = response.data;
    
    // Check wishlist status
    if (authStore.user && packageData.value) {
      try {
        const wishlistCheck = await window.axios.get(`/wishlist/check/package/${packageData.value.id}`);
        isInWishlist.value = wishlistCheck.data?.is_favorite || false;
      } catch (error) {
        isInWishlist.value = false;
      }
    }
    
    // Fetch rating and comments
    await fetchRating();
    await fetchComments();
  } catch (error) {
    console.error('Error fetching package:', error);
    showNotification(t('failed_to_load_package'), 'error');
  } finally {
    loading.value = false;
  }
};

const togglePackageWishlist = async () => {
  if (!authStore.user || !packageData.value) {
    showNotification(t('please_login_to_add_items'), 'error');
    return;
  }

  addingToWishlist.value = true;
  try {
    if (isInWishlist.value) {
      // Remove from wishlist
      await window.axios.delete(`/wishlist/package/${packageData.value.id}`);
      
      // Update localStorage for guest users
      if (!authStore.user) {
        const { removeFromGuestWishlist, getGuestWishlist, clearGuestWishlist } = await import('../utils/guestStorage');
        removeFromGuestWishlist(null, packageData.value.id);
        // Check if wishlist is empty and clear localStorage
        const guestWishlist = getGuestWishlist();
        if (guestWishlist.length === 0) {
          clearGuestWishlist();
        }
      } else {
        // Check if wishlist is empty for authenticated users
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
      }
      
      isInWishlist.value = false;
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
      showNotification(t('removed_from_wishlist'), 'success');
    } else {
      // Add to wishlist
      const response = await window.axios.post('/wishlist', { package_id: packageData.value.id });
      
      // Save to localStorage for guest users
      if (!authStore.user) {
        const { addToGuestWishlist } = await import('../utils/guestStorage');
        addToGuestWishlist({
          id: response.data.id,
          package_id: packageData.value.id
        });
      } else {
        // Save to localStorage for authenticated users
        const currentWishlist = await window.axios.get('/wishlist');
        const wishlistToSave = (currentWishlist.data || []).map(item => ({
          id: item.id,
          product_id: item.product_id,
          package_id: item.package_id
        }));
        localStorage.setItem('user_wishlist_' + authStore.user.id, JSON.stringify(wishlistToSave));
      }
      
      isInWishlist.value = true;
      showNotification(t('added_to_wishlist'), 'success');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || t('failed_to_update_wishlist');
    // For guests, still save to localStorage even if backend fails
    if (error.response?.status === 401 && !authStore.user) {
      const { addToGuestWishlist, removeFromGuestWishlist } = await import('../utils/guestStorage');
      if (isInWishlist.value) {
        removeFromGuestWishlist(null, packageData.value.id);
        isInWishlist.value = false;
        showNotification(t('removed_from_wishlist'), 'success');
      } else {
        addToGuestWishlist({
          package_id: packageData.value.id
        });
        isInWishlist.value = true;
        showNotification(t('added_to_wishlist'), 'success');
      }
    } else {
    showNotification(errorMessage, 'error');
    }
  } finally {
    addingToWishlist.value = false;
  }
};

const fetchProducts = async () => {
  loadingProducts.value = true;
  try {
    const response = await window.axios.get(`/packages/${route.params.id}/products`);
    products.value = response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    loadingProducts.value = false;
  }
};

const addPackageToCart = async () => {
  // Allow guests to add to cart - removed authentication check

  if (products.value.length === 0) {
    showNotification(t('this_package_has_no_products'), 'warning');
    return;
  }

  addingToCart.value = true;
  try {
    // Add package multiple times based on quantity
    const responses = [];
    for (let i = 0; i < quantity.value; i++) {
      const response = await window.axios.post('/cart/package', {
        package_id: route.params.id,
      });
      responses.push(response);
    }

    // Save to localStorage for guest users
    if (!authStore.user) {
      const { addToGuestCart } = await import('../utils/guestStorage');
      responses.forEach(response => {
        addToGuestCart({
          id: response.data.cart_item?.id,
          package_id: route.params.id,
          quantity: 1
        });
      });
    } else {
      // Save to localStorage for authenticated users
      const currentCart = await window.axios.get('/cart');
      const cartToSave = (currentCart.data.items || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        package_id: item.package_id,
        quantity: item.quantity
      }));
      localStorage.setItem('user_cart_' + authStore.user.id, JSON.stringify(cartToSave));
    }

    showNotification(`Package added to cart${quantity.value > 1 ? ` (${quantity.value} items)` : ''}!`, 'success');
    
    // Dispatch event to update navbar counts
    window.dispatchEvent(new CustomEvent('cart-updated'));
    
    // Reset quantity
    quantity.value = 1;
  } catch (error) {
    const errorMessage = error.response?.data?.message || t('failed_to_add_package_to_cart');
    showNotification(errorMessage, 'error');
  } finally {
    addingToCart.value = false;
  }
};

const fetchComments = async () => {
  commentsLoading.value = true;
  try {
    const response = await window.axios.get(`/packages/${route.params.id}/comments`);
    comments.value = response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
  } finally {
    commentsLoading.value = false;
  }
};

const fetchRating = async () => {
  try {
    const response = await window.axios.get(`/packages/${route.params.id}/rating`);
    ratingData.value = response.data;
  } catch (error) {
    console.error('Error fetching rating:', error);
  }
};

const getUserRating = (userId) => {
  if (!ratingData.value.user_rating || ratingData.value.user_rating.user_id !== userId) {
    return 0;
  }
  return ratingData.value.user_rating.rating || 0;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const handleSubmitReview = async () => {
  if (!user.value) {
    showNotification(t('please_login_to_review'), 'error');
    router.push('/login');
    return;
  }
  
  uploadingComment.value = true;
  try {
    // Submit rating
    await window.axios.post(`/packages/${route.params.id}/rating`, {
      rating: newReview.value.rating,
    });
    
    // Submit comment
    if (newReview.value.comment.trim()) {
      await window.axios.post(`/packages/${route.params.id}/comments`, {
        comment: newReview.value.comment,
      });
    }
    
    // Reset form
    newReview.value = {
      rating: 5,
      comment: ''
    };
    
    // Refresh data
    await fetchRating();
    await fetchComments();
    
    showNotification(t('review_submitted_successfully'), 'success');
  } catch (error) {
    console.error('Error submitting review:', error);
    showNotification(error.response?.data?.message || t('failed_to_submit_review'), 'error');
  } finally {
    uploadingComment.value = false;
  }
};

onMounted(async () => {
  await fetchPackage();
  await fetchProducts();
});
</script>

