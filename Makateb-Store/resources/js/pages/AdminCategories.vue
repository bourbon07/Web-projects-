<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white">{{ t('manage_categories') }}</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">{{ t('create_and_organize_categories') }}</p>
          </div>
          <WoodButton @click="openCreateModal" class="flex items-center space-x-2">
            <Plus :size="20" />
            <span>{{ t('create_category') }}</span>
          </WoodButton>
        </div>

        <!-- Categories Grid -->
        <div v-if="loading" class="text-center py-12 text-gray-500 dark:text-gray-400">
          {{ t('loading_categories') }}
        </div>
        <div v-else-if="categories.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          {{ t('no_categories_found') }}
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="category in categories"
            :key="category.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 p-6"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                  <img
                    v-if="category.image_url"
                    :src="category.image_url"
                    :alt="category.name"
                    class="w-full h-full object-cover"
                  />
                  <Tag v-else :size="24" class="text-white" />
                </div>
                <div>
                  <h3 class="font-bold text-lg text-gray-900 dark:text-white">{{ getCategoryDisplayName(category) }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ category.products_count || category.products?.length || 0 }} {{ t('products') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Product Thumbnails -->
            <div v-if="category.products && category.products.length > 0" class="flex -space-x-2 mb-4">
              <img
                v-for="(product, idx) in category.products.slice(0, 5)"
                :key="product.id || idx"
                :src="product.image_url || product.image || '/placeholder.jpg'"
                :alt="product.name"
                class="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
              />
              <div v-if="category.products.length > 5" class="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs">
                +{{ category.products.length - 5 }}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <WoodButton
                variant="outline"
                size="sm"
                @click="handleEditCategory(category)"
                class="flex-1 flex items-center justify-center space-x-1"
              >
                <Edit :size="16" />
                <span>{{ t('edit') }}</span>
              </WoodButton>
              <WoodButton
                variant="outline"
                size="sm"
                @click="handleManageProducts(category)"
                class="flex-1 flex items-center justify-center space-x-1"
              >
                <Tag :size="16" />
                <span>{{ t('manage_products') || 'Manage Products' }}</span>
              </WoodButton>
              <button
                @click="handleDeleteCategory(category)"
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

        <!-- Create/Edit Modal -->
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          @click.self="closeModal"
        >
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-amber-800 to-amber-900 text-white p-6 flex items-center justify-between">
              <h2 class="text-2xl font-bold flex items-center space-x-2">
                <Tag :size="24" />
                <span>{{ editingCategory ? t('edit_category') : t('create_category') }}</span>
              </h2>
              <button @click="closeModal" class="p-2 hover:bg-amber-700 rounded-lg">
                <X :size="24" />
              </button>
            </div>

            <div class="p-6 space-y-6">
              <!-- Category Name (Single Field) -->
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  {{ t('category_name') }} *
                </label>
                <input
                  v-model="categoryForm.name"
                  type="text"
                  :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  :placeholder="currentLanguage === 'ar' ? (t('enter_category_name_arabic') || 'أدخل اسم الفئة بالعربية') : (t('enter_category_name_english') || 'Enter category name in English')"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ currentLanguage === 'ar' 
                    ? 'سيتم حفظ الاسم بالعربية وترجمته تلقائياً للإنجليزية' 
                    : 'Name will be saved in English and automatically translated to Arabic' }}
                </p>
              </div>

              <!-- Category Image -->
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  {{ t('category_image') }} ({{ t('optional') || 'Optional' }})
                </label>
                <ImageUpload
                  v-model="categoryForm.image_url"
                  :show-cloudinary="true"
                  :multiple="false"
                />
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-4">
                <WoodButton
                  @click="saveCategory"
                  :disabled="saving"
                  class="flex-1"
                >
                  {{ saving ? t('saving') : (editingCategory ? t('update_category') : t('create_category')) }}
                </WoodButton>
                <button
                  @click="closeModal"
                  type="button"
                  class="flex-1 px-4 py-2 border-2 border-amber-200 dark:border-amber-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {{ t('cancel') }}
                </button>
              </div>
            </div>
          </div>
        </div>

    <!-- Products Management Modal -->
    <div
      v-if="showProductsModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="closeProductsModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-amber-800 to-amber-900 text-white p-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold flex items-center space-x-2">
            <Tag :size="24" />
            <span>{{ t('manage_products') || 'Manage Products' }} - {{ currentCategory ? getCategoryDisplayName(currentCategory) : '' }}</span>
          </h2>
          <button @click="closeProductsModal" class="p-2 hover:bg-amber-700 rounded-lg">
            <X :size="24" />
          </button>
        </div>

        <div class="p-6">
          <!-- Current Products in Category -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {{ t('products_in_category') || 'Products in Category' }} ({{ categoryProducts.length }})
            </h3>
            <div v-if="loadingProducts" class="text-center py-8 text-gray-500 dark:text-gray-400">
              {{ t('loading') }}
            </div>
            <div v-else-if="categoryProducts.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              {{ t('no_products_in_category') || 'No products in this category' }}
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="product in categoryProducts"
                :key="product.id"
                class="border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4 bg-white dark:bg-gray-700"
              >
                <div class="flex items-center space-x-3 mb-3">
                  <img
                    :src="product.image_url || '/placeholder.jpg'"
                    :alt="product.name"
                    class="w-16 h-16 rounded-lg object-cover"
                  />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 dark:text-white truncate">{{ product.name }}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatPrice(product.price) }}</p>
                  </div>
                </div>
                <button
                  @click="removeProductFromCategory(product.id)"
                  :disabled="removingProduct === product.id"
                  class="w-full px-3 py-1 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg v-if="removingProduct === product.id" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ removingProduct === product.id ? (t('removing') || 'Removing...') : t('remove') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Add Products -->
          <div>
            <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {{ t('add_products') || 'Add Products' }}
            </h3>
            <div class="mb-4">
              <input
                v-model="productSearchQuery"
                type="text"
                :placeholder="t('search_products')"
                class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div v-if="loadingAllProducts" class="text-center py-8 text-gray-500 dark:text-gray-400">
              {{ t('loading') }}
            </div>
            <div v-else-if="filteredAvailableProducts.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              {{ t('no_products_available') || 'No products available' }}
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              <div
                v-for="product in filteredAvailableProducts"
                :key="product.id"
                class="border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4 bg-white dark:bg-gray-700"
              >
                <div class="flex items-center space-x-3 mb-3">
                  <img
                    :src="product.image_url || '/placeholder.jpg'"
                    :alt="product.name"
                    class="w-16 h-16 rounded-lg object-cover"
                  />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 dark:text-white truncate">{{ product.name }}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatPrice(product.price) }}</p>
                  </div>
                </div>
                <button
                  @click="addProductToCategory(product.id)"
                  :disabled="addingProduct"
                  class="w-full px-3 py-1 rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg v-if="addingProduct" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ addingProduct ? (t('adding') || 'Adding...') : t('add') }}
                </button>
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
import { ChevronLeft, Plus, Edit, Trash2, Tag, X } from 'lucide-vue-next';
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

// Get category display name based on current language
const getCategoryDisplayName = (category) => {
  return languageStore.getLocalizedName(category);
};
const categories = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const showProductsModal = ref(false);
const editingCategory = ref(null);
const currentCategory = ref(null);
const categoryProducts = ref([]);
const allProducts = ref([]);
const loadingProducts = ref(false);
const loadingAllProducts = ref(false);
const productSearchQuery = ref('');
const addingProduct = ref(false);
const removingProduct = ref(null);

const categoryForm = ref({
  name: '',
  image_url: '',
});

const isDarkMode = computed(() => authStore.isDarkMode);

const filteredAvailableProducts = computed(() => {
  if (!productSearchQuery.value) {
    // Filter out products that are already in this category
    const categoryProductIds = categoryProducts.value.map(p => p.id);
    return allProducts.value.filter(p => !categoryProductIds.includes(p.id));
  }
  const query = productSearchQuery.value.toLowerCase();
  const categoryProductIds = categoryProducts.value.map(p => p.id);
  return allProducts.value.filter(p => 
    !categoryProductIds.includes(p.id) &&
    (p.name.toLowerCase().includes(query) ||
    (p.description && p.description.toLowerCase().includes(query)))
  );
});

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const fetchCategories = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get('/admin/categories');
    
    if (response.data.data) {
      categories.value = response.data.data;
    } else {
      categories.value = response.data || [];
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories.value = [];
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingCategory.value = null;
  categoryForm.value = {
    name: '',
    image_url: '',
  };
  showModal.value = true;
};

const handleEditCategory = (category) => {
  editingCategory.value = category;
  // Use the name in the current language for editing
  const displayName = getCategoryDisplayName(category);
  categoryForm.value = {
    name: displayName || category.name_ar || category.name_en || category.name || '',
    image_url: category.image_url || '',
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingCategory.value = null;
  categoryForm.value = {
    name: '',
    image_url: '',
  };
};

const saveCategory = async () => {
  if (!categoryForm.value.name || !categoryForm.value.name.trim()) {
    showNotification(t('please_enter_category_name'), 'warning');
    return;
  }

  saving.value = true;
  try {
    const enteredName = categoryForm.value.name.trim();
    const categoryData = {
      name: enteredName, // Send the entered name - backend will detect language and auto-translate
      image_url: categoryForm.value.image_url || null,
    };

    // The backend will automatically detect the language of the entered text
    // and generate the translation for the other language automatically

    if (editingCategory.value) {
      await window.axios.put(`/admin/categories/${editingCategory.value.id}`, categoryData);
      showNotification(t('category_updated_successfully'), 'success');
    } else {
      await window.axios.post('/admin/categories', categoryData);
      showNotification(t('category_created_successfully'), 'success');
    }
    closeModal();
    await fetchCategories();
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_save_category'), 'error');
  } finally {
    saving.value = false;
  }
};

const handleDeleteCategory = async (category) => {
  const confirmed = await confirmAction({
    action: currentLanguage.value === 'ar' ? 'حذف هذه الفئة' : 'delete this category',
    destructive: true,
  });
  if (!confirmed) return;
  
  try {
    await window.axios.delete(`/admin/categories/${category.id}`);
    showNotification(t('category_deleted_successfully'), 'success');
    await fetchCategories();
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_delete_category'), 'error');
  }
};

const handleManageProducts = async (category) => {
  currentCategory.value = category;
  await Promise.all([
    fetchCategoryProducts(category.id),
    fetchAllProducts(),
  ]);
  showProductsModal.value = true;
};

const closeProductsModal = () => {
  showProductsModal.value = false;
  currentCategory.value = null;
  categoryProducts.value = [];
  allProducts.value = [];
  productSearchQuery.value = '';
};

const fetchCategoryProducts = async (categoryId) => {
  loadingProducts.value = true;
  try {
    const response = await window.axios.get(`/admin/categories/${categoryId}/products`);
    categoryProducts.value = response.data || [];
  } catch (error) {
    console.error('Error fetching category products:', error);
    showNotification(error.response?.data?.message || t('failed_to_fetch_category_products'), 'error');
  } finally {
    loadingProducts.value = false;
  }
};

const fetchAllProducts = async () => {
  loadingAllProducts.value = true;
  try {
    const response = await window.axios.get('/products');
    allProducts.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    allProducts.value = [];
  } finally {
    loadingAllProducts.value = false;
  }
};

const addProductToCategory = async (productId) => {
  if (!currentCategory.value) return;
  
  addingProduct.value = true;
  try {
    await window.axios.post(`/admin/categories/${currentCategory.value.id}/attach-products`, {
      product_ids: [productId],
    });
    await fetchCategoryProducts(currentCategory.value.id);
    await fetchCategories(); // Refresh to update product count
    await fetchAllProducts(); // Refresh available products
    showNotification(t('product_added_to_category_successfully'), 'success');
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_add_product_to_category'), 'error');
  } finally {
    addingProduct.value = false;
  }
};

const removeProductFromCategory = async (productId) => {
  if (!currentCategory.value) return;
  
  const confirmed = await confirmAction({
    action: currentLanguage.value === 'ar' ? 'إزالة هذا المنتج من الفئة' : 'remove this product from the category',
    destructive: true,
  });
  if (!confirmed) return;
  
  removingProduct.value = productId;
  try {
    await window.axios.post(`/admin/categories/${currentCategory.value.id}/detach-products`, {
      product_ids: [productId],
    });
    await fetchCategoryProducts(currentCategory.value.id);
    await fetchCategories(); // Refresh to update product count
    await fetchAllProducts(); // Refresh available products
    showNotification(t('product_removed_from_category_successfully'), 'success');
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_remove_product_from_category'), 'error');
  } finally {
    removingProduct.value = null;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

