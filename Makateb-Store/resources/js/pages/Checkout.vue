<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Empty Cart State -->
        <div v-if="!loading && cartItems.length === 0" class="min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{{ t('your_cart_is_empty') }}</h2>
            <WoodButton @click="$router.push('/')">{{ t('start_shopping') }}</WoodButton>
          </div>
        </div>

        <div v-else>
          <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">{{ t('checkout_page') }}</h1>

          <form @submit.prevent="completePurchase" class="grid lg:grid-cols-3 gap-8">
            <!-- Checkout Form -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Contact Information -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30">
                <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{{ t('contact_information') }}</h2>
                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('full_name') }} *</label>
                    <input
                      v-model="contactInfo.fullName"
                      type="text"
                      required
                      class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('email') }} *</label>
                    <input
                      v-model="contactInfo.email"
                      type="email"
                      required
                      class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('phone') }} *</label>
                    <input
                      v-model="contactInfo.phone"
                      type="tel"
                      required
                      class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <!-- Shipping Address -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30">
                <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{{ t('shipping_address') }}</h2>
                <div class="space-y-4">
                  <div>
                    <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('address') }} *</label>
                    <input
                      v-model="shippingAddress.address"
                      type="text"
                      required
                      class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div class="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('city') }} *</label>
                      <select
                        v-model="shippingAddress.city"
                        required
                        @change="updateServiceFee"
                        class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">{{ t('select_location') }}</option>
                        <option v-for="location in deliveryLocations" :key="location.id" :value="location.location">
                          {{ location.location }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('zip_code') }} *</label>
                      <input
                        v-model="shippingAddress.zipCode"
                        type="text"
                        required
                        class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30">
                <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{{ t('payment_method') }}</h2>
                
                <div class="space-y-3 mb-6">
                  <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border-amber-200 dark:border-amber-800">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      v-model="selectedPaymentMethod"
                      class="mr-3"
                    />
                    <CreditCard :size="20" class="mr-2 text-amber-800 dark:text-amber-500" />
                    <span class="font-medium text-gray-900 dark:text-white">{{ t('credit_card') }}</span>
                  </label>

                  <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border-amber-200 dark:border-amber-800">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      v-model="selectedPaymentMethod"
                      class="mr-3"
                    />
                    <DollarSign :size="20" class="mr-2 text-amber-800 dark:text-amber-500" />
                    <span class="font-medium text-gray-900 dark:text-white">PayPal</span>
                  </label>

                  <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border-amber-200 dark:border-amber-800">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      v-model="selectedPaymentMethod"
                      class="mr-3"
                    />
                    <Package :size="20" class="mr-2 text-amber-800 dark:text-amber-500" />
                    <span class="font-medium text-gray-900 dark:text-white">{{ t('cash_on_delivery') }}</span>
                  </label>
                </div>

                <!-- Credit Card Details -->
                <div v-if="selectedPaymentMethod === 'credit_card'" class="space-y-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div>
                    <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('card_number') }} *</label>
                    <input
                      v-model="cardDetails.cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      required
                      class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('expiry_date') }} *</label>
                      <input
                        v-model="cardDetails.expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        required
                        class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('cvv') }} *</label>
                      <input
                        v-model="cardDetails.cvv"
                        type="text"
                        placeholder="123"
                        required
                        class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="lg:col-span-1">
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24 border-2 border-amber-200 dark:border-amber-900">
                <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {{ t('order_summary') }}
                </h2>

                <div class="space-y-3 mb-6">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">{{ t('subtotal') }}</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ formatPrice(subtotal) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">{{ t('service_fees') }}</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ formatPrice(serviceFees) }}</span>
                  </div>
                  <div class="border-t-2 border-amber-200 dark:border-amber-800 pt-3">
                    <div class="flex justify-between items-center">
                      <span class="text-xl font-bold text-gray-900 dark:text-white">{{ t('total') }}</span>
                      <span class="text-2xl font-bold text-amber-900 dark:text-amber-500">
                        {{ formatPrice(total) }}
                      </span>
                    </div>
                  </div>
                </div>

                <WoodButton type="submit" class="w-full" size="lg" :disabled="processing">
                  {{ processing ? t('processing') : t('place_order') }}
                </WoodButton>

                <p class="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                  {{ t('agree_terms_conditions') }}
                </p>
              </div>
            </div>
          </form>
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
import { CreditCard, DollarSign, Package } from 'lucide-vue-next';
import { formatPriceDisplay } from '../utils/currency';
import { showNotification } from '../utils/notifications';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;

const cartItems = ref([]);
const loading = ref(false);
const processing = ref(false);
const selectedPaymentMethod = ref('credit_card');
const contactInfo = ref({
  fullName: '',
  email: '',
  phone: '',
});
const shippingAddress = ref({
  address: '',
  city: '',
  zipCode: '',
});
const cardDetails = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
});

const isDarkMode = computed(() => authStore.isDarkMode);

const getItemPrice = (item) => {
  if (item.package_id && item.package) {
    if (item.package.price !== null && item.package.price !== undefined) {
      const price = typeof item.package.price === 'string' ? parseFloat(item.package.price) : Number(item.package.price || 0);
      return isNaN(price) ? 0 : price;
    }
    if (item.package.products) {
      return item.package.products.reduce((sum, product) => {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price || 0);
        return sum + (isNaN(price) ? 0 : price);
      }, 0);
    }
    return 0;
  } else if (item.product) {
    const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : Number(item.product.price || 0);
    return isNaN(price) ? 0 : price;
  }
  return 0;
};

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const price = getItemPrice(item);
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);
});

const serviceFees = computed(() => {
  return Number(serviceFee.value) + Number(locationFee.value);
});

const total = computed(() => {
  return subtotal.value + serviceFees.value;
});

const deliveryLocations = ref([]);
const serviceFee = ref(0);
const locationFee = ref(0);

const updateServiceFee = async () => {
  if (!shippingAddress.value.city) {
    locationFee.value = 0;
    return;
  }
  
  try {
    const location = deliveryLocations.value.find(loc => loc.location === shippingAddress.value.city);
    if (location && location.is_active !== false) {
      locationFee.value = parseFloat(location.fee || 0);
    } else {
      locationFee.value = 0;
    }
  } catch (error) {
    console.error('Error updating location fee:', error);
    locationFee.value = 0;
  }
};

const fetchDeliveryLocations = async () => {
  try {
    const locationsResponse = await window.axios.get('/delivery-fees');
    deliveryLocations.value = locationsResponse.data || [];
    
    const serviceFeeResponse = await window.axios.get('/service-fee');
    if (serviceFeeResponse.data) {
      serviceFee.value = parseFloat(serviceFeeResponse.data.fee || 0);
    }
  } catch (error) {
    console.error('Error fetching delivery locations:', error);
    deliveryLocations.value = [];
  }
};

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const fetchCart = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get('/cart');
    cartItems.value = response.data.items || [];
  } catch (error) {
    console.error('Error fetching cart:', error);
    cartItems.value = [];
  } finally {
    loading.value = false;
  }
};

const completePurchase = async () => {
  // Allow guests to complete purchase - removed authentication check

  if (!selectedPaymentMethod.value) {
    showNotification(t('please_select_payment_method') || 'Please select a payment method', 'warning');
    return;
  }

  if (!contactInfo.value.fullName || !contactInfo.value.email || !contactInfo.value.phone) {
    showNotification(t('please_fill_contact_info') || 'Please fill in all contact information fields', 'warning');
    return;
  }

  if (!shippingAddress.value.address || !shippingAddress.value.city || !shippingAddress.value.zipCode) {
    showNotification(t('please_fill_shipping_address') || 'Please fill in all shipping address fields', 'warning');
    return;
  }

  if (selectedPaymentMethod.value === 'credit_card' && (!cardDetails.value.cardNumber || !cardDetails.value.expiryDate || !cardDetails.value.cvv)) {
    showNotification(t('please_fill_card_details') || 'Please fill in all credit card details', 'warning');
    return;
  }

  processing.value = true;
  try {
    const serviceFees = Number(serviceFee.value) + Number(locationFee.value);
    
    const checkoutData = {
      payment_method: selectedPaymentMethod.value,
      delivery_location: `${shippingAddress.value.address}, ${shippingAddress.value.city}, ${shippingAddress.value.zipCode}`,
      customer_name: contactInfo.value.fullName,
      customer_phone: contactInfo.value.phone,
      customer_email: contactInfo.value.email,
    };
    
    // Add card details if credit card payment
    if (selectedPaymentMethod.value === 'credit_card') {
      checkoutData.card_details = cardDetails.value;
    }
    
    const response = await window.axios.post('/cart/checkout', checkoutData);
    
    console.log('Order created successfully:', response.data);
    
    // Clear cart from localStorage for both authenticated and guest users
    if (authStore.isAuthenticated && authStore.user) {
      localStorage.removeItem('user_cart_' + authStore.user.id);
    } else {
      const { clearGuestCart } = await import('../utils/guestStorage');
      clearGuestCart();
    }
    
    // Save guest email/phone for auto-loading messages later
    if (!authStore.isAuthenticated) {
      localStorage.setItem('guest_email', contactInfo.value.email);
      localStorage.setItem('guest_phone', contactInfo.value.phone);
      
      // Save order info for auto-loading messages
      const recentOrders = JSON.parse(localStorage.getItem('recent_guest_orders') || '[]');
      recentOrders.push({
        id: response.data.data?.id || response.data.id,
        customer_email: contactInfo.value.email,
        customer_phone: contactInfo.value.phone,
        created_at: new Date().toISOString()
      });
      // Keep only last 10 orders
      if (recentOrders.length > 10) {
        recentOrders.shift();
      }
      localStorage.setItem('recent_guest_orders', JSON.stringify(recentOrders));
    }
    
    // Dispatch event to update navbar counts
    window.dispatchEvent(new CustomEvent('cart-updated'));
    
    showNotification(t('order_placed_successfully') || 'Order placed successfully!', 'success');
    
    // Redirect to payment URL if provided
    if (response.data.payment_url) {
      window.location.href = response.data.payment_url;
      return;
    }
    
    // Redirect to orders page to see the new order
    router.push('/orders');
  } catch (error) {
    console.error('Error completing purchase:', error);
    showNotification(error.response?.data?.message || t('failed_to_complete_purchase') || 'Failed to complete purchase', 'error');
  } finally {
    processing.value = false;
  }
};

onMounted(() => {
  fetchCart();
  fetchDeliveryLocations();
  
  // Pre-fill for authenticated users only
  if (authStore.isAuthenticated && authStore.user) {
    contactInfo.value.email = authStore.user.email || '';
    contactInfo.value.fullName = authStore.user.name || '';
    contactInfo.value.phone = authStore.user.phone || '';

    // Load saved payment method
    const savedCard = localStorage.getItem(`payment_method_${authStore.user.id}`);
    if (savedCard) {
      cardDetails.value = JSON.parse(savedCard);
      selectedPaymentMethod.value = 'credit_card';
    }
  }
});
</script>

