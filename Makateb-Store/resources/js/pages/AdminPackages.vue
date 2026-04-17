<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white">{{ t('manage_packages') }}</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">{{ t('create_and_manage_packages') }}</p>
          </div>
          <WoodButton @click="openCreateModal" class="flex items-center space-x-2">
            <Plus :size="20" />
            <span>{{ t('create_package') }}</span>
          </WoodButton>
        </div>

        <!-- Packages Grid -->
        <div v-if="loading" class="text-center py-12 text-gray-500 dark:text-gray-400">
          {{ t('loading_packages') }}
        </div>
        <div v-else-if="packages.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          {{ t('no_packages_available') }}
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="pkg in packages"
            :key="pkg.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 overflow-hidden"
          >
            <img
              :src="pkg.image_url || pkg.image || '/placeholder-package.jpg'"
              :alt="pkg.name"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">{{ getPackageDisplayName(pkg) }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ getLocalizedDescription(pkg) || t('no_description') }}</p>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <span class="text-2xl font-bold text-amber-800 dark:text-amber-500">{{ formatPrice(pkg.price || pkg.min_price || 0) }}</span>
                  <span v-if="pkg.discount && pkg.discount > 0" class="ml-2 text-sm text-green-600 dark:text-green-400">
                    {{ pkg.discount }}% {{ t('off') }}
                  </span>
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ pkg.products_count || pkg.products?.length || 0 }} {{ t('products') }}
                </span>
              </div>
              <div v-if="pkg.stock !== undefined" class="mb-4">
                <span class="text-sm font-medium" :class="pkg.stock > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ t('stock') }}: {{ pkg.stock }}
                </span>
              </div>
              <div class="flex gap-2">
                <WoodButton
                  variant="outline"
                  size="sm"
                  @click="handleEditPackage(pkg)"
                  class="flex-1 flex items-center justify-center space-x-1"
                >
                  <Edit :size="16" />
                  <span>{{ t('edit') }}</span>
                </WoodButton>
                <button
                  @click="handleDeletePackage(pkg)"
                  class="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center space-x-1"
                >
                  <Trash2 :size="16" />
                  <span>{{ t('delete') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

        <!-- Create/Edit Modal -->
        <div
          v-if="showPackageModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          @click.self="closePackageModal"
        >
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-amber-800 to-amber-900 text-white p-6 flex items-center justify-between">
              <h2 class="text-2xl font-bold flex items-center space-x-2">
                <PackageIcon :size="24" />
                <span>{{ editingPackage ? t('edit_package') : t('create_package') }}</span>
              </h2>
              <button @click="closePackageModal" class="p-2 hover:bg-amber-700 rounded-lg">
                <X :size="24" />
              </button>
            </div>

            <div class="p-6 space-y-6">
              <!-- Package Name (Single Field) -->
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  {{ t('package_name') }} *
                </label>
                <input
                  v-model="packageForm.name"
                  type="text"
                  :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  :placeholder="currentLanguage === 'ar' ? (t('enter_package_name_arabic') || 'أدخل اسم الباقة بالعربية') : (t('enter_package_name_english') || 'Enter package name in English')"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ currentLanguage === 'ar' ? 'سيتم حفظ الاسم بالعربية والإنجليزية' : 'Name will be saved in both Arabic and English' }}
                </p>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  {{ t('description') }} *
                </label>
                <textarea
                  v-model="packageForm.description"
                  rows="3"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  :placeholder="t('enter_package_description')"
                ></textarea>
              </div>

              <!-- Price, Discount, and Stock -->
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    {{ t('price') }} *
                  </label>
                  <input
                    v-model="packageForm.price"
                    type="number"
                    step="0.01"
                    class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    {{ t('discount') }} (%)
                  </label>
                  <input
                    v-model="packageForm.discount"
                    type="number"
                    step="0.01"
                    class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    {{ t('stock') }} *
                  </label>
                  <input
                    v-model="packageForm.stock"
                    type="number"
                    class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <!-- Image Upload -->
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  {{ t('image_url') }}
                </label>
                <ImageUpload
                  v-model="packageForm.image_url"
                  :show-cloudinary="true"
                />
              </div>

              <!-- Select Products -->
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  {{ t('select_products') }} * ({{ selectedProducts.length }} {{ t('selected') }})
                </label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-4 border-2 border-amber-200 dark:border-amber-800 rounded-lg">
                  <button
                    v-for="product in allProducts"
                    :key="product.id"
                    @click="toggleProductSelection(product)"
                    type="button"
                    :class="[
                      'p-3 rounded-lg border-2 transition-all',
                      selectedProducts.find(p => p.id === product.id)
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-amber-400'
                    ]"
                  >
                    <img
                      :src="product.image_url || product.image || '/placeholder.jpg'"
                      :alt="product.name"
                      class="w-full h-24 object-cover rounded mb-2"
                    />
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ product.name }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">{{ formatPrice(product.price) }}</p>
                  </button>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-4">
                <WoodButton
                  @click="savePackage"
                  :disabled="saving"
                  class="flex-1"
                >
                  {{ saving ? t('saving') : (editingPackage ? t('update_package') : t('create_package')) }}
                </WoodButton>
                <button
                  @click="closePackageModal"
                  type="button"
                  class="flex-1 px-4 py-2 border-2 border-amber-200 dark:border-amber-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {{ t('cancel') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Manage Products Modal (kept for backward compatibility) -->
        <div
          v-if="showProductsModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          @click.self="closeProductsModal"
        >
      <div
        class="rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-gray-800' : 'bg-white'"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Manage Products - {{ getPackageDisplayName(currentPackage) }}
            </h2>
            <button
              @click="closeProductsModal"
              class="p-2 rounded-lg transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="loadingProducts" class="text-center py-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
            {{ t('loading_products') }}
          </div>
          <div v-else>
            <!-- Search Products -->
            <div class="mb-4">
              <input
                v-model="productSearchQuery"
                type="text"
                :placeholder="t('search_products')"
                class="w-full px-4 py-2 rounded-lg border"
                :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              />
            </div>

            <!-- Available Products List -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Available Products
              </h3>
              <div class="max-h-64 overflow-y-auto space-y-2">
                <div
                  v-for="product in filteredAvailableProducts"
                  :key="product.id"
                  class="flex items-center justify-between p-3 rounded-lg"
                  :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-50'"
                >
                  <div class="flex items-center gap-3">
                    <div
                      v-if="!product.image_url"
                      class="w-12 h-12 rounded flex items-center justify-center"
                      :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'"
                    >
                      <svg class="w-8 h-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <img
                      v-else
                      :src="product.image_url"
                      :alt="product.name"
                      class="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ product.name }}
                      </div>
                      <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ formatPrice(product.price) }} JD
                      </div>
                    </div>
                  </div>
                  <button
                    @click="addProductToPackage(product.id)"
                    class="px-3 py-1 rounded-lg text-sm font-medium text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <!-- Package Products List -->
            <div>
              <h3 class="text-lg font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Products in Package ({{ packageProducts.length }})
              </h3>
              <div v-if="packageProducts.length === 0" class="text-center py-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                No products in this package
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="product in packageProducts"
                  :key="product.id"
                  class="flex items-center justify-between p-3 rounded-lg"
                  :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-50'"
                >
                  <div class="flex items-center gap-3">
                    <div
                      v-if="!product.image_url"
                      class="w-12 h-12 rounded flex items-center justify-center"
                      :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'"
                    >
                      <svg class="w-8 h-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <img
                      v-else
                      :src="product.image_url"
                      :alt="product.name"
                      class="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ product.name }}
                      </div>
                      <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ formatPrice(product.price) }} JD
                      </div>
                    </div>
                  </div>
                  <button
                    @click="removeProductFromPackage(product.id)"
                    class="px-3 py-1 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Remove
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import { ChevronLeft, Plus, Edit, Trash2, Package as PackageIcon, X } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import ImageUpload from '../components/ImageUpload.vue';
import { formatPriceDisplay } from '../utils/currency';
import { showNotification } from '../utils/notifications';
import { confirmAction } from '../utils/confirmation';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const currentLanguage = computed(() => languageStore.currentLanguage);
const getLocalizedDescription = languageStore.getLocalizedDescription;

// Get package display name based on current language
const getPackageDisplayName = (pkg) => {
  return languageStore.getLocalizedName(pkg);
};
const packages = ref([]);
const loading = ref(false);
const saving = ref(false);
const showPackageModal = ref(false);
const showProductsModal = ref(false);
const editingPackage = ref(null);
const currentPackage = ref(null);
const packageProducts = ref([]);
const allProducts = ref([]);
const loadingProducts = ref(false);
const productSearchQuery = ref('');

const packageForm = ref({
  name: '',
  description: '',
  image_url: '',
  price: '',
  discount: '',
  stock: 0,
});

const selectedProducts = ref([]);

const isDarkMode = computed(() => authStore.isDarkMode);

const filteredAvailableProducts = computed(() => {
  if (!productSearchQuery.value) return allProducts.value;
  const query = productSearchQuery.value.toLowerCase();
  return allProducts.value.filter(p => 
    p.name.toLowerCase().includes(query) ||
    (p.description && p.description.toLowerCase().includes(query))
  );
});

const fetchPackages = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get('/admin/packages');
    
    // Handle both array and paginated responses
    let packagesData = [];
    if (Array.isArray(response.data)) {
      packagesData = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      packagesData = response.data.data;
    } else if (Array.isArray(response.data)) {
      packagesData = response.data;
    }
    
    packages.value = packagesData.map(pkg => ({
      ...pkg,
      products_count: pkg.products_count || 0,
      min_price: pkg.min_price || pkg.price || 0,
    }));
  } catch (error) {
    console.error('Error fetching packages:', error);
    packages.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchAllProducts = async () => {
  try {
    const response = await window.axios.get('/products');
    allProducts.value = response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const fetchPackageProducts = async (packageId) => {
  loadingProducts.value = true;
  try {
    const response = await window.axios.get(`/admin/packages/${packageId}/products`);
    packageProducts.value = response.data || [];
  } catch (error) {
    console.error('Error fetching package products:', error);
    showNotification(error.response?.data?.message || t('failed_to_fetch_package_products'), 'error');
  } finally {
    loadingProducts.value = false;
  }
};

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const openCreateModal = async () => {
  editingPackage.value = null;
  packageForm.value = {
    name: '',
    description: '',
    image_url: '',
    price: '',
    discount: '',
    stock: 0,
  };
  selectedProducts.value = [];
  await fetchAllProducts();
  showPackageModal.value = true;
};

const handleEditPackage = async (pkg) => {
  editingPackage.value = pkg;
  // Use the name in the current language for editing
  const displayName = getPackageDisplayName(pkg);
  packageForm.value = {
    name: displayName || pkg.name_ar || pkg.name_en || pkg.name || '',
    description: pkg.description || '',
    image_url: pkg.image_url || pkg.image || '',
    price: pkg.price ? pkg.price.toString() : '',
    discount: pkg.discount ? pkg.discount.toString() : '',
    stock: pkg.stock || 0,
  };
  
  // Fetch package products
  try {
    const response = await window.axios.get(`/admin/packages/${pkg.id}/products`);
    selectedProducts.value = response.data || [];
  } catch (error) {
    console.error('Error fetching package products:', error);
    selectedProducts.value = [];
  }
  
  await fetchAllProducts();
  showPackageModal.value = true;
};

const closePackageModal = () => {
  showPackageModal.value = false;
  editingPackage.value = null;
  packageForm.value = {
    name: '',
    description: '',
    image_url: '',
    price: '',
    discount: '',
    stock: 0,
  };
  selectedProducts.value = [];
};

const toggleProductSelection = (product) => {
  const index = selectedProducts.value.findIndex(p => p.id === product.id);
  if (index > -1) {
    selectedProducts.value.splice(index, 1);
  } else {
    selectedProducts.value.push(product);
  }
};

const savePackage = async () => {
  if (!packageForm.value.name || !packageForm.value.name.trim() || !packageForm.value.description || !packageForm.value.price || packageForm.value.stock === '' || selectedProducts.value.length === 0) {
    showNotification(t('please_fill_all_fields_and_select_product'), 'warning');
    return;
  }

  saving.value = true;
  try {
    const enteredName = packageForm.value.name.trim();
    const packageData = {
      description: packageForm.value.description,
      image_url: packageForm.value.image_url || null,
      price: parseFloat(packageForm.value.price),
      discount: parseFloat(packageForm.value.discount) || 0,
      stock: parseInt(packageForm.value.stock) || 0,
      product_ids: selectedProducts.value.map(p => p.id),
    };

    // Handle bilingual names based on current language
    if (editingPackage.value) {
      // When editing: update only the current language's field, preserve the other
      if (currentLanguage.value === 'ar') {
        packageData.name_ar = enteredName;
        packageData.name_en = editingPackage.value.name_en || enteredName;
      } else {
        packageData.name_en = enteredName;
        packageData.name_ar = editingPackage.value.name_ar || enteredName;
      }
    } else {
      // When creating: set both to entered name
      packageData.name_ar = enteredName;
      packageData.name_en = enteredName;
    }

    if (editingPackage.value) {
      await window.axios.put(`/admin/packages/${editingPackage.value.id}`, packageData);
      showNotification(t('package_updated_successfully'), 'success');
    } else {
      await window.axios.post('/admin/packages', packageData);
      showNotification(t('package_created_successfully'), 'success');
    }
    closePackageModal();
    await fetchPackages();
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_save_package'), 'error');
  } finally {
    saving.value = false;
  }
};

const handleDeletePackage = async (pkg) => {
  const confirmed = await confirmAction({
    action: currentLanguage.value === 'ar' ? 'حذف هذه الباقة' : 'delete this package',
    destructive: true,
  });
  if (!confirmed) return;
  
  try {
    await window.axios.delete(`/admin/packages/${pkg.id}`);
    showNotification(t('package_deleted_successfully'), 'success');
    await fetchPackages();
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_delete_package'), 'error');
  }
};

const manageProducts = async (pkg) => {
  currentPackage.value = pkg;
  productSearchQuery.value = '';
  await Promise.all([
    fetchAllProducts(),
    fetchPackageProducts(pkg.id),
  ]);
  showProductsModal.value = true;
};

const closeProductsModal = () => {
  showProductsModal.value = false;
  currentPackage.value = null;
  packageProducts.value = [];
  productSearchQuery.value = '';
};

const addProductToPackage = async (productId) => {
  try {
    await window.axios.post(`/admin/packages/${currentPackage.value.id}/attach-products`, {
      product_ids: [productId],
    });
    await fetchPackageProducts(currentPackage.value.id);
    await fetchPackages(); // Refresh to update product count
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_add_product_to_package'), 'error');
  }
};

const removeProductFromPackage = async (productId) => {
  try {
    await window.axios.post(`/admin/packages/${currentPackage.value.id}/detach-products`, {
      product_ids: [productId],
    });
    await fetchPackageProducts(currentPackage.value.id);
    await fetchPackages(); // Refresh to update product count
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_remove_product_from_package'), 'error');
  }
};

onMounted(() => {
  fetchPackages();
  fetchAllProducts();
});
</script>

