<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
    <!-- Hero Section -->
    <div 
      class="relative h-64 sm:h-80 md:h-96 bg-cover bg-center flex items-center justify-center"
      :style="{
        backgroundImage: 'url(/background%20image.png)',
      }"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-amber-900/40 to-amber-950/40" />
      <div class="relative z-10 text-center text-white px-4">
        <h1 
          @click="$router.push('/dashboard')"
          class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 cursor-pointer hover:text-amber-200 transition-colors"
        >
          {{ t('makateb_store') }}
        </h1>
        <p class="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 md:mb-8 px-2">{{ t('welcome_description') }}</p>
        <div class="flex justify-center">
          <WoodButton size="sm" class="sm:!px-4 sm:!py-2 sm:!text-base md:!px-6 md:!py-3 md:!text-lg" @click="scrollToProducts">
            {{ t('shop_now') }}
          </WoodButton>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      <!-- Toggle between Products and Packages -->
      <div class="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        <WoodButton
          :variant="showPackages ? 'outline' : 'primary'"
          @click="showPackages = false"
          size="sm"
          class="sm:size-md"
        >
          {{ t('products') }}
        </WoodButton>
        <WoodButton
          :variant="showPackages ? 'primary' : 'outline'"
          @click="showPackages = true"
          class="flex items-center gap-1 sm:gap-2"
          size="sm"
        >
          <CubeIcon class="w-3 h-3 sm:w-4 sm:h-4" />
          <span>{{ t('packages') }}</span>
        </WoodButton>
      </div>

      <div v-if="showPackages">
        <!-- Packages Section -->
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
            {{ t('special_package_deals') }}
          </h2>
          <div v-if="loadingPackages" class="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
            {{ t('loading') }}
          </div>
          <div v-else-if="packages.length === 0" class="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
            {{ t('no_packages_available') }}
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <PackageCard
              v-for="pkg in packages"
              :key="pkg.id"
              :pkg="pkg"
              @view-details="(id) => router.push(`/package/${id}`)"
            />
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Category Filter (only for products) -->
        <div v-if="!showPackages" class="mb-4 sm:mb-6 md:mb-8">
          <h3 class="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-center text-gray-900 dark:text-white">
            {{ t('categories') }}
          </h3>
          <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
            <WoodButton
              :variant="selectedCategory === null ? 'primary' : 'outline'"
              size="xs"
              class="sm:size-sm rounded-full text-xs sm:text-sm"
              @click="selectedCategory = null"
            >
              {{ t('all') }}
            </WoodButton>
            <WoodButton
              v-for="category in categories"
              :key="category.id"
              :variant="selectedCategory === category.id ? 'primary' : 'outline'"
              size="xs"
              class="sm:size-sm rounded-full text-xs sm:text-sm"
              @click="selectedCategory = category.id"
            >
              {{ getLocalizedName(category) }}
            </WoodButton>
          </div>
        </div>

        <!-- Products Grid -->
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
            {{ selectedCategory === null ? t('all_products') : getLocalizedName(categories.find(c => c.id === selectedCategory)) || t('products') }}
            <span class="text-sm sm:text-base md:text-lg font-normal text-gray-600 dark:text-gray-400 ml-1 sm:ml-2 md:ml-3">
              ({{ filteredProducts.length }} {{ t('items') }})
            </span>
          </h2>
          <div v-if="loadingProducts" class="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
            {{ t('loading') }}
          </div>
          <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <ProductCard
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              size="small"
              @view-details="(id) => router.push(`/product/${id}`)"
            />
          </div>
          <div v-else class="text-center py-8 sm:py-12">
            <p class="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
              {{ t('no_products_found') }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { useLanguageStore } from '../stores/language';
import ProductCard from '../components/ProductCard.vue';
import PackageCard from '../components/PackageCard.vue';
import WoodButton from '../components/WoodButton.vue';
import Footer from '../components/Footer.vue';
import { CubeIcon } from '@heroicons/vue/24/outline';

const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;

const router = useRouter();
const store = useAppStore();
const selectedCategory = ref(null);
const showPackages = ref(false);
const products = ref([]);
const packages = ref([]);
const categories = ref([]);
const loadingProducts = ref(false);
const loadingPackages = ref(false);
const loadingCategories = ref(false);

const filteredProducts = computed(() => {
  let filtered = products.value;

  // Filter by category - support multiple categories per product
  if (selectedCategory.value !== null) {
    filtered = filtered.filter(p => {
      // Check if product has categories array (many-to-many)
      if (p.categories && Array.isArray(p.categories)) {
        return p.categories.some(cat => cat.id === selectedCategory.value);
      }
      // Fallback to category_id for backward compatibility
      return p.category_id === selectedCategory.value;
    });
  }

  // Filter by search query
  if (store.searchQuery) {
    const query = store.searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.category && p.category.name && p.category.name.toLowerCase().includes(query))
    );
  }

  return filtered;
});

const fetchProducts = async () => {
  loadingProducts.value = true;
  try {
    const response = await window.axios.get('/products');
    products.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    products.value = [];
  } finally {
    loadingProducts.value = false;
  }
};

const fetchPackages = async () => {
  loadingPackages.value = true;
  try {
    const response = await window.axios.get('/packages');
    packages.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching packages:', error);
    packages.value = [];
  } finally {
    loadingPackages.value = false;
  }
};

const fetchCategories = async () => {
  loadingCategories.value = true;
  try {
    const response = await window.axios.get('/categories');
    categories.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories.value = [];
  } finally {
    loadingCategories.value = false;
  }
};

const scrollToProducts = () => {
  window.scrollTo({ top: 600, behavior: 'smooth' });
};

onMounted(async () => {
  await Promise.all([
    fetchProducts(),
    fetchPackages(),
    fetchCategories(),
  ]);
});
</script>


