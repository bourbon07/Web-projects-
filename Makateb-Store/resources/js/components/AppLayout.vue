<template>
  <div :class="['h-screen flex w-full overflow-hidden', isDarkMode ? 'bg-gray-900' : 'bg-gray-50']">
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto w-full" :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
        <div class="w-full min-h-full" :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
          <slot />
        </div>
      </main>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import WoodButton from './WoodButton.vue';

const woodTexture = '/bde3a495c5ad0d23397811532fdfa02fe66f448c.png';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;

const isDarkMode = computed(() => authStore.isDarkMode);
const isRTL = computed(() => languageStore.isRTL);
const user = computed(() => authStore.user);
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

onMounted(async () => {
  await fetchCartCount();
  window.addEventListener('cart-updated', handleCartUpdated);
});

onUnmounted(() => {
  window.removeEventListener('cart-updated', handleCartUpdated);
});
</script>

