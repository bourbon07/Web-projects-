<template>
  <div 
    @click="$emit('viewDetails', product.id)"
    class="group cursor-pointer bg-amber-50 dark:bg-amber-950/20 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-amber-200 dark:border-amber-800/50"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-white">
      <img 
        v-if="product.image_url"
        :src="product.image_url" 
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700"
      >
        <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <button
        v-if="!hideWishlistButton"
        @click.stop="handleToggleWishlist"
        :class="[
          'absolute rounded-full transition-all z-10',
          heartButtonClasses,
          isInWishlist 
            ? 'bg-red-500 text-white' 
            : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
        ]"
      >
        <HeartIcon :class="[heartIconClasses, isInWishlist ? 'fill-current' : '']" />
      </button>
      <div v-if="product.stock && product.stock < 10 && product.stock > 0" class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
        {{ t('only_left') }} {{ product.stock }}!
      </div>
      <div v-if="product.stock === 0" class="absolute top-2 left-2 bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">
        {{ t('out_of_stock') }}
      </div>
    </div>

    <div :class="[paddingClasses, 'bg-amber-50 dark:bg-amber-950/20']">
      <div :class="props.size === 'small' ? 'mb-0.5 sm:mb-1' : 'mb-1 sm:mb-2'">
        <span :class="[categoryTextClasses, 'text-amber-800 dark:text-amber-300 font-medium uppercase tracking-wide']">
          {{ getProductCategoryName(product) }}
        </span>
      </div>

      <div v-if="product.admin_rating" :class="['flex items-center gap-1', props.size === 'small' ? 'mb-0.5 sm:mb-1' : 'mb-1 sm:mb-2']">
        <StarIcon :class="[ratingIconClasses, 'text-yellow-500 fill-yellow-500']" />
        <span :class="[ratingTextClasses, 'font-medium text-gray-700 dark:text-gray-300']">{{ product.admin_rating.rating || 0 }}</span>
      </div>

      <h3 :class="[titleClasses, 'font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white line-clamp-2']">
        {{ product.name }}
      </h3>

      <p :class="[descriptionClasses, 'text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2 leading-relaxed']">
        {{ getLocalizedDescription(product) }}
      </p>

      <div :class="['flex items-center justify-between gap-2', props.size === 'small' ? 'mt-1 sm:mt-2' : 'mt-2 sm:mt-4']">
        <span :class="[priceClasses, 'font-bold text-gray-900 dark:text-white']">
          {{ formatPrice(product.price) }}
        </span>
        <WoodButton 
          v-if="product.stock > 0"
          @click.stop="handleAddToCart"
          :disabled="addingToCart"
          :size="buttonSize"
          :dir="isRTL ? 'rtl' : 'ltr'"
        >
          <template v-if="isRTL">
            <span>{{ addingToCart ? t('adding') : t('add') }}</span>
            <ShoppingCartIcon v-if="!addingToCart" :class="iconSize" />
            <svg v-else :class="[iconSize, 'animate-spin']" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </template>
          <template v-else>
            <ShoppingCartIcon v-if="!addingToCart" :class="iconSize" />
            <svg v-else :class="[iconSize, 'animate-spin']" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ addingToCart ? t('adding') : t('add') }}</span>
          </template>
        </WoodButton>
        <div
          v-else
          :class="[
            'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium',
            props.size === 'small' ? 'px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-[10px]' : 'px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs'
          ]"
        >
          {{ t('out_of_stock') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import WoodButton from './WoodButton.vue';
import { HeartIcon, ShoppingCartIcon, StarIcon } from '@heroicons/vue/24/outline';
import { formatPriceDisplay } from '../utils/currency';
import { showNotification } from '../utils/notifications';

const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;
const getLocalizedDescription = languageStore.getLocalizedDescription;

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default', 'large'].includes(value)
  },
  hideWishlistButton: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['viewDetails']);

const router = useRouter();
const authStore = useAuthStore();
const isInWishlist = ref(false);
const addingToCart = ref(false);
const addingToWishlist = ref(false);

const user = computed(() => authStore.user);

// Size-based classes
const paddingClasses = computed(() => {
  if (props.size === 'small') return 'p-2 sm:p-3'; // Smaller padding on mobile, normal on larger screens
  if (props.size === 'large') return 'p-4 sm:p-5';
  return 'p-3 sm:p-4';
});

const categoryTextClasses = computed(() => {
  if (props.size === 'small') return 'text-[10px] sm:text-xs';
  if (props.size === 'large') return 'text-xs';
  return 'text-[10px] sm:text-xs';
});

const ratingIconClasses = computed(() => {
  if (props.size === 'small') return 'w-3 h-3 sm:w-4 sm:h-4';
  if (props.size === 'large') return 'w-4 h-4 sm:w-5 sm:h-5';
  return 'w-3 h-3 sm:w-4 sm:h-4';
});

const ratingTextClasses = computed(() => {
  if (props.size === 'small') return 'text-xs sm:text-sm';
  if (props.size === 'large') return 'text-sm sm:text-base';
  return 'text-xs sm:text-sm';
});

const titleClasses = computed(() => {
  if (props.size === 'small') return 'text-sm sm:text-base';
  if (props.size === 'large') return 'text-base sm:text-lg';
  return 'text-sm sm:text-base';
});

const descriptionClasses = computed(() => {
  if (props.size === 'small') return 'text-xs sm:text-sm';
  if (props.size === 'large') return 'text-sm';
  return 'text-xs sm:text-sm';
});

const priceClasses = computed(() => {
  if (props.size === 'small') return 'text-base sm:text-lg';
  if (props.size === 'large') return 'text-lg sm:text-xl';
  return 'text-base sm:text-lg';
});

const buttonSize = computed(() => {
  if (props.size === 'small') return 'sm'; // Small button size
  if (props.size === 'large') return 'md sm:lg';
  return 'sm';
});

const iconSize = computed(() => {
  if (props.size === 'small') return 'w-4 h-4';
  if (props.size === 'large') return 'w-5 h-5';
  return 'w-4 h-4';
});

const isRTL = computed(() => languageStore.isRTL);

const heartIconClasses = computed(() => {
  if (props.size === 'small') return 'w-4 h-4';
  if (props.size === 'large') return 'w-5 h-5';
  return 'w-4 h-4';
});

const heartButtonClasses = computed(() => {
  if (props.size === 'small') return 'top-1.5 right-1.5 p-1';
  if (props.size === 'large') return 'top-3 right-3 p-2';
  return 'top-2 right-2 p-1.5';
});

// Check wishlist status
const checkWishlistStatus = async () => {
  if (!user.value) {
    // For guest users, check localStorage
    const { isInGuestWishlist } = await import('../utils/guestStorage');
    isInWishlist.value = isInGuestWishlist(props.product.id, null);
    return;
  }
  try {
    const response = await window.axios.get(`/wishlist/check/${props.product.id}`);
    isInWishlist.value = response.data.is_favorite || false;
  } catch (error) {
    isInWishlist.value = false;
  }
};

const handleAddToCart = async () => {
  addingToCart.value = true;
  try {
    const response = await window.axios.post('/cart', {
      product_id: props.product.id,
      quantity: 1,
    });
    
    // Save to localStorage for guest users
    if (!user.value) {
      const { addToGuestCart, saveGuestCart } = await import('../utils/guestStorage');
      addToGuestCart({
        id: response.data.id,
        product_id: props.product.id,
        quantity: 1
      });
    } else {
      // Save to localStorage for authenticated users
      const { getGuestCart } = await import('../utils/guestStorage');
      const currentCart = await window.axios.get('/cart');
      const cartToSave = (currentCart.data.items || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        package_id: item.package_id,
        quantity: item.quantity
      }));
      localStorage.setItem('user_cart_' + user.value.id, JSON.stringify(cartToSave));
    }
    
    showNotification(t('added_to_cart'), 'success');
    // Dispatch event to update navbar counts
    window.dispatchEvent(new CustomEvent('cart-updated'));
  } catch (error) {
    if (error.response?.status === 401) {
      // For guests, still save to localStorage even if backend fails
      if (!user.value) {
        const { addToGuestCart } = await import('../utils/guestStorage');
        addToGuestCart({
          product_id: props.product.id,
          quantity: 1
        });
        showNotification(t('added_to_cart'), 'success');
        window.dispatchEvent(new CustomEvent('cart-updated'));
      } else {
        showNotification(t('please_login_to_add_items'), 'error');
      }
    } else {
      const errorMessage = error.response?.data?.message || t('failed_to_add_to_cart');
      showNotification(errorMessage, 'error');
    }
  } finally {
    addingToCart.value = false;
  }
};

const handleToggleWishlist = async () => {
  addingToWishlist.value = true;
  try {
    const { addToGuestWishlist, removeFromGuestWishlist, saveGuestWishlist, isInGuestWishlist } = await import('../utils/guestStorage');
    
    if (isInWishlist.value) {
      await window.axios.delete(`/wishlist/product/${props.product.id}`);
      
      // Update localStorage for guest users
      if (!user.value) {
        removeFromGuestWishlist(props.product.id, null);
        // Check if wishlist is empty and clear localStorage
        const { getGuestWishlist, clearGuestWishlist } = await import('../utils/guestStorage');
        const guestWishlist = getGuestWishlist();
        if (guestWishlist.length === 0) {
          clearGuestWishlist();
        }
      } else {
        // Save to localStorage for authenticated users
        const currentWishlist = await window.axios.get('/wishlist');
        const wishlistData = currentWishlist.data || [];
        if (wishlistData.length === 0) {
          // Clear localStorage if wishlist is empty
          localStorage.removeItem('user_wishlist_' + user.value.id);
        } else {
          const wishlistToSave = wishlistData.map(item => ({
            id: item.id,
            product_id: item.product_id,
            package_id: item.package_id
          }));
          localStorage.setItem('user_wishlist_' + user.value.id, JSON.stringify(wishlistToSave));
        }
      }
      
      isInWishlist.value = false;
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
      showNotification(t('removed_from_wishlist'), 'success');
    } else {
      const response = await window.axios.post('/wishlist', {
        product_id: props.product.id,
      });
      
      // Save to localStorage for guest users
      if (!user.value) {
        addToGuestWishlist({
          id: response.data.id,
          product_id: props.product.id
        });
      } else {
        // Save to localStorage for authenticated users
        const currentWishlist = await window.axios.get('/wishlist');
        const wishlistToSave = (currentWishlist.data || []).map(item => ({
          id: item.id,
          product_id: item.product_id,
          package_id: item.package_id
        }));
        localStorage.setItem('user_wishlist_' + user.value.id, JSON.stringify(wishlistToSave));
      }
      
      isInWishlist.value = true;
      showNotification(t('added_to_wishlist'), 'success');
    }
    // Dispatch event to update navbar counts
    window.dispatchEvent(new CustomEvent('wishlist-updated'));
  } catch (error) {
    if (error.response?.status === 401) {
      // For guests, still save to localStorage even if backend fails
      if (!user.value) {
        const { addToGuestWishlist, removeFromGuestWishlist } = await import('../utils/guestStorage');
        if (isInWishlist.value) {
          removeFromGuestWishlist(props.product.id, null);
          isInWishlist.value = false;
          showNotification(t('removed_from_wishlist'), 'success');
        } else {
          addToGuestWishlist({
            product_id: props.product.id
          });
          isInWishlist.value = true;
          showNotification(t('added_to_wishlist'), 'success');
        }
        window.dispatchEvent(new CustomEvent('wishlist-updated'));
      } else {
        showNotification(t('please_login_to_add_items'), 'error');
      }
    } else {
      const errorMessage = error.response?.data?.message || t('failed_to_update_wishlist');
      showNotification(errorMessage, 'error');
    }
  } finally {
    addingToWishlist.value = false;
  }
};

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const getProductCategoryName = (product) => {
  if (!product) return t('general');
  
  // Check for multiple categories (many-to-many)
  if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
    // Return first category name
    return getLocalizedName(product.categories[0]);
  }
  
  // Fallback to single category
  if (product.category) return getLocalizedName(product.category);
  return t('general');
};

// Initialize wishlist status
if (user.value) {
  checkWishlistStatus();
}
</script>


