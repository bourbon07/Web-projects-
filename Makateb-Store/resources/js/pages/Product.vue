<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div v-if="loading" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('loading') }}</div>
        
        <div v-else-if="product">
          <!-- Product Details -->
          <div class="grid md:grid-cols-2 gap-8 mb-12">
            <!-- Image with Carousel -->
            <div class="space-y-4">
              <!-- Main Image -->
              <div class="relative rounded-lg overflow-hidden shadow-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center min-h-[400px]">
                <img
                  :src="currentImage"
                  :alt="product.name"
                  class="max-w-full max-h-[600px] w-auto h-auto object-contain"
                />
                <!-- Navigation Arrows (only show if multiple images) -->
                <button
                  v-if="productImages.length > 1"
                  @click="previousImage"
                  class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                  aria-label="Previous image"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  v-if="productImages.length > 1"
                  @click="nextImage"
                  class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                  aria-label="Next image"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <!-- Image Counter -->
                <div v-if="productImages.length > 1" class="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {{ currentImageIndex + 1 }} / {{ productImages.length }}
                </div>
                <div v-if="product.stock < 10 && product.stock > 0" class="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold z-10">
                  {{ t('only_left_in_stock') }} {{ product.stock }} {{ t('left_in_stock') }}
                </div>
              </div>
              
              <!-- Thumbnail Gallery (only show if multiple images) -->
              <div v-if="productImages.length > 1" class="flex gap-2 overflow-x-auto pb-2">
                <button
                  v-for="(img, index) in productImages"
                  :key="index"
                  @click="currentImageIndex = index"
                  :class="[
                    'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all bg-gray-50 dark:bg-gray-700 flex items-center justify-center',
                    currentImageIndex === index
                      ? 'border-amber-600 dark:border-amber-500 ring-2 ring-amber-500 ring-offset-2'
                      : 'border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-600'
                  ]"
                  :aria-label="`View image ${index + 1}`"
                >
                  <img
                    :src="img"
                    :alt="`${product.name} - Image ${index + 1}`"
                    class="max-w-full max-h-full w-auto h-auto object-contain"
                  />
                </button>
              </div>
            </div>

            <!-- Details -->
            <div>
              <span class="text-amber-700 dark:text-amber-500 font-medium">
                {{ product.category ? getLocalizedName(product.category) : t('uncategorized') }}
              </span>
              <h1 class="text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">
                {{ product.name }}
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

              <!-- Price -->
              <div class="text-4xl font-bold text-amber-900 dark:text-amber-500 mb-6">
                {{ formatPrice(calculatedPrice) }}
              </div>

              <!-- Description -->
              <p class="text-gray-700 dark:text-gray-300 mb-8 text-lg">
                {{ getLocalizedDescription(product) || t('no_description_available') }}
              </p>

              <!-- Quantity Selector -->
              <div class="mb-6">
                <label class="block font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ t('quantity') }}</label>
                <div class="flex items-center gap-4">
                  <button
                    @click="decreaseQuantity"
                    class="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors flex items-center justify-center"
                  >
                    <Minus class="w-5 h-5" />
                  </button>
                  <span class="text-2xl font-bold w-16 text-center" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ quantity }}</span>
                  <button
                    @click="increaseQuantity"
                    :disabled="product.stock <= quantity"
                    class="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Plus class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4">
                <WoodButton
                  @click="addToCart"
                  :disabled="product.stock < quantity || product.stock <= 0"
                  size="lg"
                >
                  <ShoppingCart class="w-5 h-5" />
                  <span>{{ product.stock <= 0 ? t('out_of_stock') : t('add_to_cart') }}</span>
                </WoodButton>
                <WoodButton
                  @click="toggleWishlist"
                  :variant="isInWishlist ? 'primary' : 'outline'"
                  size="lg"
                >
                  <Heart class="w-5 h-5" :class="isInWishlist ? 'fill-current' : ''" />
                </WoodButton>
              </div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="border-t-2 border-amber-200 dark:border-amber-900 pt-8">
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
import { Star, ShoppingCart, Heart, Minus, Plus } from 'lucide-vue-next';
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

const product = ref(null);
const comments = ref([]);
const ratingData = ref({});
const loading = ref(false);
const commentsLoading = ref(false);
const currentImageIndex = ref(0);
const uploadingComment = ref(false);
const quantity = ref(1);
const isInWishlist = ref(false);
const checkingWishlist = ref(false);
const newReview = ref({
  rating: 5,
  comment: ''
});

const isDarkMode = computed(() => authStore.isDarkMode);
const user = computed(() => authStore.user);

const getDefaultProductIcon = () => {
  return 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <path d="M9 9h6v6H9z"/>
    </svg>
  `);
};

const productImages = computed(() => {
  if (!product.value) return [getDefaultProductIcon()];
  const images = [];
  
  // Prioritize image_urls array if it exists and has items
  if (product.value.image_urls && Array.isArray(product.value.image_urls) && product.value.image_urls.length > 0) {
    // Filter out empty/null URLs and add them
    product.value.image_urls.forEach(url => {
      if (url && typeof url === 'string' && url.trim() && !images.includes(url)) {
        images.push(url);
      }
    });
  }
  
  // If no images from image_urls, fallback to image_url
  if (images.length === 0 && product.value.image_url) {
    images.push(product.value.image_url);
  }
  
  return images.length > 0 ? images : [getDefaultProductIcon()];
});

const currentImage = computed(() => {
  return productImages.value[currentImageIndex.value] || getDefaultProductIcon();
});

const nextImage = () => {
  if (productImages.value.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % productImages.value.length;
  }
};

const previousImage = () => {
  if (productImages.value.length > 1) {
    currentImageIndex.value = currentImageIndex.value === 0 
      ? productImages.value.length - 1 
      : currentImageIndex.value - 1;
  }
};


const calculatedPrice = computed(() => {
  return parseFloat(product.value?.price || 0);
});

const averageRating = computed(() => {
  return parseFloat(ratingData.value?.average_rating || 0);
});

const increaseQuantity = () => {
  if (product.value && product.value.stock > quantity.value) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
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
    await window.axios.post(`/products/${route.params.id}/rating`, {
      rating: newReview.value.rating,
    });
    
    // Submit comment
    if (newReview.value.comment.trim()) {
      await window.axios.post(`/products/${route.params.id}/comments`, {
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

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fetchProduct = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get(`/products/${route.params.id}`);
    product.value = response.data;
    currentImageIndex.value = 0;
    await fetchRating();
    await checkWishlistStatus();
  } catch (error) {
    console.error('Error fetching product:', error);
  } finally {
    loading.value = false;
  }
};

const checkWishlistStatus = async () => {
  if (!user.value) {
    isInWishlist.value = false;
    return;
  }
  
  checkingWishlist.value = true;
  try {
    const response = await window.axios.get(`/wishlist/check/${route.params.id}`);
    isInWishlist.value = response.data.is_favorite || false;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    isInWishlist.value = false;
  } finally {
    checkingWishlist.value = false;
  }
};

const toggleWishlist = async () => {
  try {
    if (isInWishlist.value) {
      // Remove from wishlist
      await window.axios.delete(`/wishlist/product/${route.params.id}`);
      
      // Update localStorage for guest users
      if (!authStore.user) {
        const { removeFromGuestWishlist, getGuestWishlist, clearGuestWishlist } = await import('../utils/guestStorage');
        removeFromGuestWishlist(route.params.id, null);
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
      const response = await window.axios.post('/wishlist', {
        product_id: route.params.id,
      });
      
      // Save to localStorage for guest users
      if (!authStore.user) {
        const { addToGuestWishlist } = await import('../utils/guestStorage');
        addToGuestWishlist({
          id: response.data.id,
          product_id: route.params.id
        });
      }
      
      isInWishlist.value = true;
      showNotification(t('added_to_wishlist'), 'success');
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    if (error.response?.status === 401) {
      // For guests, still save to localStorage even if backend fails
      if (!authStore.user) {
        const { addToGuestWishlist, removeFromGuestWishlist } = await import('../utils/guestStorage');
        if (isInWishlist.value) {
          removeFromGuestWishlist(route.params.id, null);
          isInWishlist.value = false;
          showNotification(t('removed_from_wishlist'), 'success');
        } else {
          addToGuestWishlist({
            product_id: route.params.id
          });
          isInWishlist.value = true;
          showNotification(t('added_to_wishlist'), 'success');
        }
      } else {
      showNotification(t('please_login_to_add_items'), 'error');
      }
    } else {
      showNotification(error.response?.data?.message || t('failed_to_update_wishlist'), 'error');
    }
  }
};

const fetchComments = async () => {
  commentsLoading.value = true;
  try {
    const response = await window.axios.get(`/products/${route.params.id}/comments`);
    comments.value = response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
  } finally {
    commentsLoading.value = false;
  }
};

const fetchRating = async () => {
  try {
    const response = await window.axios.get(`/products/${route.params.id}/rating`);
    ratingData.value = response.data;
  } catch (error) {
    console.error('Error fetching rating:', error);
  }
};

const getUserRating = (userId) => {
  // Try to find rating for this user
  // Since we don't have a direct endpoint for all ratings, we'll use the user's rating from ratingData if available
  if (ratingData.value.user_rating && ratingData.value.user_rating.user_id === userId) {
    return ratingData.value.user_rating.rating;
  }
  // Default to 5 if no rating found (since comments don't have individual ratings)
  return 5;
};

const deleteComment = async (commentId) => {
  const confirmed = await confirmAction({
    action: t('delete_this_comment') || 'delete this comment',
    message: t('are_you_sure_delete_comment'),
    destructive: true
  });
  if (!confirmed) return;
  
  try {
    await window.axios.delete(`/comments/${commentId}`);
    await fetchComments();
    await fetchRating();
  } catch (error) {
    console.error('Error deleting comment:', error);
    showNotification(error.response?.data?.message || t('failed_to_delete_comment'), 'error');
  }
};

const addToCart = async () => {
  if (!product.value) return;
  
  // Check stock before attempting to add
  if (product.value.stock < quantity.value) {
    const message = t('only_x_items_available').replace('{count}', product.value.stock);
    showNotification(message, 'warning');
    return;
  }
  
  if (product.value.stock <= 0) {
    showNotification(t('product_out_of_stock_wishlist'), 'warning');
    return;
  }
  
  try {
    const response = await window.axios.post('/cart', {
      product_id: product.value.id,
      quantity: quantity.value,
    });
    
    // Save to localStorage for guest users
    if (!authStore.user) {
      const { addToGuestCart } = await import('../utils/guestStorage');
      addToGuestCart({
        id: response.data.id,
        product_id: product.value.id,
        quantity: quantity.value
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
    
    showNotification(t('added_to_cart'), 'success');
    // Dispatch event to update navbar counts
    window.dispatchEvent(new CustomEvent('cart-updated'));
  } catch (error) {
    if (error.response?.status === 401) {
      // For guests, still save to localStorage even if backend fails
      if (!authStore.user) {
        const { addToGuestCart } = await import('../utils/guestStorage');
        addToGuestCart({
          product_id: product.value.id,
          quantity: quantity.value
        });
        showNotification(t('added_to_cart'), 'success');
        window.dispatchEvent(new CustomEvent('cart-updated'));
      } else {
      showNotification(t('please_login_to_add_items'), 'error');
      }
      return;
    }
    
    const errorMessage = error.response?.data?.message || t('failed_to_add_to_cart');
    showNotification(errorMessage, 'error');
    
    // If out of stock, suggest adding to wishlist
    if (errorMessage.includes('out of stock') || errorMessage.includes('stock')) {
      const confirmed = await confirmAction({
        message: t('would_you_like_to_add_to_wishlist') || 'Would you like to add this product to your wishlist instead?',
        destructive: false
      });
      if (confirmed) {
        try {
          const response = await window.axios.post('/wishlist', {
            product_id: product.value.id,
          });
          
          // Save to localStorage for guest users
          if (!authStore.user) {
            const { addToGuestWishlist } = await import('../utils/guestStorage');
            addToGuestWishlist({
              id: response.data.id,
              product_id: product.value.id
            });
          }
          
          showNotification(t('added_to_wishlist'), 'success');
        } catch (wishlistError) {
          console.error('Error adding to wishlist:', wishlistError);
          if (wishlistError.response?.status === 401) {
            // For guests, still save to localStorage
            if (!authStore.user) {
              const { addToGuestWishlist } = await import('../utils/guestStorage');
              addToGuestWishlist({
                product_id: product.value.id
              });
              showNotification(t('added_to_wishlist'), 'success');
            } else {
            showNotification(t('please_login_to_add_items'), 'error');
            }
          }
        }
      }
    }
  }
};

const viewUserProfile = (userId) => {
  router.push(`/view-profile/${userId}`);
};

const chatWithUser = (userId) => {
  if (!user.value) {
    showNotification(t('please_login_to_use_chat'), 'error');
    return;
  }
  router.push({ path: '/chat', query: { userId: userId } });
};

const viewProductCustomers = () => {
  router.push(`/admin/product/${product.value.id}/customers`);
};

const deleteProduct = async () => {
  const confirmed = await confirmAction({
    action: t('delete_this_product') || 'delete this product',
    message: t('are_you_sure_delete_product_permanent') || 'Are you sure you want to delete this product? This action cannot be undone.',
    destructive: true
  });
  if (!confirmed) return;
  
  try {
    await window.axios.delete(`/admin/products/${product.value.id}`);
    showNotification(t('product_deleted_successfully'), 'success');
    router.push('/dashboard');
  } catch (error) {
    console.error('Error deleting product:', error);
    showNotification(error.response?.data?.message || t('failed_to_delete_product'), 'error');
  }
};

onMounted(async () => {
  await fetchProduct();
  fetchComments();
});
</script>
