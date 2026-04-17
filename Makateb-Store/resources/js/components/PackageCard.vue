<template>
  <div 
    @click="$emit('viewDetails', pkg.id)"
    class="group cursor-pointer bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-950/30 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-amber-300 dark:border-amber-700 hover:scale-105"
  >
    <div class="relative aspect-video overflow-hidden">
      <img 
        v-if="pkg.image_url"
        :src="pkg.image_url" 
        :alt="pkg.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700"
      >
        <CubeIcon class="w-16 h-16 text-gray-400" />
      </div>
      <div v-if="discount > 0" class="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full font-bold">
        {{ t('save') }} {{ discount }}%
      </div>
      <div class="absolute top-2 right-2 bg-amber-800 text-white px-3 py-1 rounded-full flex items-center space-x-1">
        <CubeIcon class="w-4 h-4" />
        <span>{{ pkg.products_count || pkg.products?.length || 0 }} {{ t('items') }}</span>
      </div>
    </div>

    <div class="p-4">
      <h3 class="font-bold text-lg mb-2 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
        {{ getLocalizedName(pkg) }}
      </h3>

      <p class="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
        {{ getLocalizedDescription(pkg) }}
      </p>

      <div class="mb-4">
        <div v-if="discount > 0" class="text-sm text-gray-500 line-through">{{ formatPrice(originalPrice) }} JD</div>
        <div class="flex items-baseline space-x-2">
          <span class="text-2xl font-bold text-amber-900 dark:text-amber-500">
            {{ formatPrice(pkg.price) }} JD
          </span>
          <span v-if="savings > 0" class="text-sm text-green-600 dark:text-green-400 font-medium">
            {{ t('save') }} {{ formatPrice(savings) }} JD
          </span>
        </div>
      </div>

      <div class="flex gap-2">
        <WoodButton 
          @click.stop="handleAddToCart"
          :disabled="addingToCart"
          size="md"
          class="flex-1"
        >
          <ShoppingCartIcon v-if="!addingToCart" class="w-4 h-4" />
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ addingToCart ? t('adding') : t('add_to_cart') }}</span>
        </WoodButton>
        <WoodButton 
          @click.stop="$emit('viewDetails', pkg.id)"
          variant="outline"
          size="md"
        >
          <EyeIcon class="w-4 h-4" />
        </WoodButton>
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
import { ShoppingCartIcon, CubeIcon, EyeIcon } from '@heroicons/vue/24/outline';
import { showNotification } from '../utils/notifications';

const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;
const getLocalizedDescription = languageStore.getLocalizedDescription;

const props = defineProps({
  pkg: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['viewDetails']);

const router = useRouter();
const authStore = useAuthStore();
const addingToCart = ref(false);

const user = computed(() => authStore.user);

const originalPrice = computed(() => {
  if (!props.pkg.products || !Array.isArray(props.pkg.products)) return props.pkg.price || 0;
  return props.pkg.products.reduce((sum, p) => {
    const price = typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price || 0);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);
});

const savings = computed(() => {
  const pkgPrice = typeof props.pkg.price === 'string' ? parseFloat(props.pkg.price) : Number(props.pkg.price || 0);
  return Math.max(0, originalPrice.value - (isNaN(pkgPrice) ? 0 : pkgPrice));
});

const discount = computed(() => {
  if (originalPrice.value === 0) return 0;
  return Math.round((savings.value / originalPrice.value) * 100);
});

const handleAddToCart = async () => {
  addingToCart.value = true;
  try {
    const response = await window.axios.post('/cart/package', {
      package_id: props.pkg.id,
    });
    
    // Save to localStorage for guest users
    if (!user.value) {
      const { addToGuestCart } = await import('../utils/guestStorage');
      addToGuestCart({
        id: response.data.cart_item?.id,
        package_id: props.pkg.id,
        quantity: 1
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
      localStorage.setItem('user_cart_' + user.value.id, JSON.stringify(cartToSave));
    }
    
    showNotification(t('package_added_to_cart'), 'success');
    // Dispatch event to update navbar counts
    window.dispatchEvent(new CustomEvent('cart-updated'));
  } catch (error) {
    if (error.response?.status === 401) {
      // For guests, still save to localStorage even if backend fails
      if (!user.value) {
        const { addToGuestCart } = await import('../utils/guestStorage');
        addToGuestCart({
          package_id: props.pkg.id,
          quantity: 1
        });
        showNotification(t('package_added_to_cart'), 'success');
        window.dispatchEvent(new CustomEvent('cart-updated'));
      } else {
        showNotification(t('please_login_to_add_items'), 'error');
      }
    } else {
      const errorMessage = error.response?.data?.message || t('failed_to_add_package_to_cart');
      showNotification(errorMessage, 'error');
    }
  } finally {
    addingToCart.value = false;
  }
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(numPrice)) return '0.00';
  return numPrice.toFixed(2);
};
</script>


