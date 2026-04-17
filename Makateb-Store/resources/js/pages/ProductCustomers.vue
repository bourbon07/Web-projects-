<template>
  <AppLayout>
    <div class="container mx-auto px-4 py-6" :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
      <div class="flex items-center gap-4 mb-6">
        <h1 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-800'">
          Customers Who Added to Cart
        </h1>
      </div>

      <!-- Product Info -->
      <div v-if="product" class="mb-6 p-4 rounded-lg shadow-md" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
        <div class="flex items-center gap-4">
          <img
            :src="product.image_url || '/placeholder.png'"
            :alt="product.name"
            class="w-20 h-20 object-cover rounded"
          />
          <div>
            <h2 class="text-xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-800'">
              {{ product.name }}
            </h2>
            <p class="text-lg font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">
              {{ product.price }} JD
            </p>
          </div>
        </div>
      </div>

      <!-- Customers List -->
      <div v-if="loading" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
        Loading customers...
      </div>
      <div v-else-if="customers.length === 0" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
        No customers have added this product to cart yet.
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="customer in customers"
          :key="customer.id"
          class="rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          :class="isDarkMode ? 'bg-gray-800' : 'bg-white'"
          @click="viewProfile(customer.id)"
        >
          <div class="flex items-center gap-4">
            <img
              :src="customer.avatar_url || '/placeholder.png'"
              :alt="customer.name"
              class="w-16 h-16 rounded-full"
            />
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-800'">
                {{ customer.name }}
              </h3>
              <p class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ customer.email }}
              </p>
              <div v-if="customer.carts && customer.carts.length > 0" class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Quantity in cart: {{ customer.carts[0].quantity }}
              </div>
            </div>
            <button
              @click.stop="viewProfile(customer.id)"
              class="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              View Profile
            </button>
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
import { ChevronLeft } from 'lucide-vue-next';
import { showNotification } from '../utils/notifications';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const product = ref(null);
const customers = ref([]);
const loading = ref(false);

const isDarkMode = computed(() => authStore.isDarkMode);

const fetchCustomers = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get(`/admin/product/${route.params.id}/customers`);
    product.value = response.data.product;
    customers.value = response.data.customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    const languageStore = useLanguageStore();
    const t = languageStore.t;
    showNotification(error.response?.data?.message || t('failed_to_fetch_customers') || 'Failed to fetch customers', 'error');
  } finally {
    loading.value = false;
  }
};

const viewProfile = (userId) => {
  router.push(`/profile/${userId}`);
};

onMounted(() => {
  fetchCustomers();
});
</script>

