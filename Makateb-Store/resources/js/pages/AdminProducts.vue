<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white">{{ t('manage_products') }}</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">{{ t('create_and_manage_products') }}</p>
          </div>
          <WoodButton @click="openCreateModal" class="flex items-center space-x-2">
            <Plus :size="20" />
            <span>{{ t('create_product') }}</span>
          </WoodButton>
        </div>

        <!-- Products Grid -->
        <div v-if="loading" class="text-center py-12 text-gray-500 dark:text-gray-400">
          {{ t('loading_products') }}
        </div>
        <div v-else-if="products.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          {{ t('no_products_found_admin') }}
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="product in products"
            :key="product.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 overflow-hidden"
          >
            <div class="relative">
              <img
                :src="product.image_url || product.image || (product.image_urls && product.image_urls[0]) || '/placeholder.jpg'"
                :alt="product.name"
                class="w-full h-48 object-cover"
              />
              <div v-if="product.stock <= 0" class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                {{ t('out_of_stock') }}
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">{{ product.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{{ getLocalizedDescription(product) || t('no_description_available') }}</p>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <span class="text-2xl font-bold text-amber-800 dark:text-amber-500">{{ formatPrice(product.price || 0) }} JD</span>
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ t('stock') }}: {{ product.stock || 0 }}
                </span>
              </div>
              <div v-if="product.category" class="mb-2">
                <span class="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                  {{ getLocalizedName(product.category) }}
                </span>
              </div>
              <div class="flex gap-2">
                <WoodButton
                  variant="outline"
                  size="sm"
                  @click="handleEditProduct(product)"
                  class="flex-1 flex items-center justify-center space-x-1"
                >
                  <Edit :size="16" />
                  <span>{{ t('edit') }}</span>
                </WoodButton>
                <WoodButton
                  variant="outline"
                  size="sm"
                  @click="openAddToPackageModal(product)"
                  class="flex-1 flex items-center justify-center space-x-1"
                >
                  <Package :size="16" />
                  <span>{{ t('add_to_package') }}</span>
                </WoodButton>
                <button
                  @click="handleDeleteProduct(product)"
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
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-amber-800 to-amber-900 text-white p-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold flex items-center space-x-2">
            <Package :size="24" />
            <span>{{ editingProduct ? t('edit_product') : t('create_product') }}</span>
          </h2>
          <button @click="closeModal" class="p-2 hover:bg-amber-700 rounded-lg">
            <X :size="24" />
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Product Name -->
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
              {{ t('product_name') }} *
            </label>
            <input
              v-model="productForm.name"
              type="text"
              class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              :placeholder="t('product_name')"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
              {{ t('product_description') }} *
            </label>
            <textarea
              v-model="productForm.description"
              rows="4"
              class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              :placeholder="t('product_description')"
            ></textarea>
          </div>

          <!-- Price and Stock -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {{ t('product_price') }} *
              </label>
              <input
                v-model="productForm.price"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {{ t('product_stock') }} *
              </label>
              <input
                v-model="productForm.stock"
                type="number"
                min="0"
                class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="0"
              />
            </div>
          </div>

          <!-- Category Selection (Required) -->
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
              {{ t('product_category') }} *
            </label>
            <select
              v-model="productForm.category_id"
              required
              class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">{{ t('select_category') }}</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ getLocalizedName(category) }}
              </option>
            </select>
          </div>

          <!-- Package Selection (Optional) -->
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
              {{ t('add_to_packages') }} ({{ t('optional') }})
            </label>
            <div class="border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div v-if="packages.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('no_packages_available') }}
              </div>
              <div v-else class="space-y-2">
                <label
                  v-for="pkg in packages"
                  :key="pkg.id"
                  class="flex items-center space-x-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    :value="pkg.id"
                    v-model="productForm.package_ids"
                    class="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                  />
                  <span class="text-sm text-gray-900 dark:text-white">{{ getLocalizedName(pkg) }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Image Upload -->
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
              {{ t('product_images') }}
            </label>
            <ImageUpload
              v-model="productForm.image_urls"
              :multiple="true"
              :show-cloudinary="true"
            />
          </div>

          <!-- Actions -->
          <div class="flex gap-4 pt-4">
            <WoodButton
              @click="saveProduct"
              :disabled="saving || !productForm.name || !productForm.price || !productForm.description || !productForm.stock"
              class="flex-1"
            >
              {{ saving ? t('saving') : (editingProduct ? t('edit_product') : t('create_product')) }}
            </WoodButton>
            <WoodButton
              variant="outline"
              @click="closeModal"
              class="flex-1"
            >
              {{ t('cancel') }}
            </WoodButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Add to Package Modal -->
    <div
      v-if="showAddToPackageModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="closeAddToPackageModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-amber-800 to-amber-900 text-white p-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold flex items-center space-x-2">
            <Package :size="24" />
            <span>{{ t('add_to_package') }}: {{ currentProductForPackage?.name }}</span>
          </h2>
          <button @click="closeAddToPackageModal" class="p-2 hover:bg-amber-700 rounded-lg">
            <X :size="24" />
          </button>
        </div>

        <div class="p-6 space-y-6">
          <div v-if="packages.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            {{ t('no_packages_available') }}
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="pkg in packages"
              :key="pkg.id"
              class="flex items-center justify-between p-4 rounded-lg border-2 border-amber-200 dark:border-amber-800"
            >
              <div class="flex items-center space-x-3">
                <img
                  v-if="pkg.image_url"
                  :src="pkg.image_url"
                  :alt="getLocalizedName(pkg)"
                  class="w-16 h-16 rounded object-cover"
                />
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">{{ getLocalizedName(pkg) }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ pkg.products_count || 0 }} {{ t('products') }}
                  </div>
                </div>
              </div>
              <button
                @click="addProductToPackageFromModal(pkg.id)"
                :disabled="addingToPackage"
                class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors disabled:opacity-50"
              >
                {{ addingToPackage ? t('adding') : t('add') }}
              </button>
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
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import ImageUpload from '../components/ImageUpload.vue';
import { ChevronLeft, Plus, Edit, Trash2, Package, X } from 'lucide-vue-next';
import { showNotification } from '../utils/notifications';
import { confirmAction } from '../utils/confirmation';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;
const getLocalizedDescription = languageStore.getLocalizedDescription;

const products = ref([]);
const categories = ref([]);
const packages = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const editingProduct = ref(null);
const showAddToPackageModal = ref(false);
const currentProductForPackage = ref(null);
const addingToPackage = ref(false);

const productForm = ref({
  name: '',
  description: '',
  price: '',
  stock: '',
  category_id: '',
  package_ids: [],
  image_urls: [],
});

const formatPrice = (price) => {
  if (!price) return '0.00';
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return '0.00';
  return numPrice.toFixed(2);
};

const openCreateModal = () => {
  editingProduct.value = null;
  productForm.value = {
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    package_ids: [],
    image_urls: [],
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingProduct.value = null;
  productForm.value = {
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    package_ids: [],
    image_urls: [],
  };
};

const handleEditProduct = async (product) => {
  editingProduct.value = product;
  
  // Fetch product details if needed
  try {
    const response = await window.axios.get(`/products/${product.id}`);
    const productData = response.data;
    
    productForm.value = {
      name: productData.name || '',
      description: productData.description || '',
      price: productData.price || '',
      stock: productData.stock || '',
      category_id: productData.category_id || '',
      package_ids: [],
      image_urls: productData.image_urls || (productData.image_url ? [productData.image_url] : []),
    };
    
    // Fetch packages that contain this product
    try {
      const packagesResponse = await window.axios.get('/packages');
      const allPackages = packagesResponse.data || [];
      const packageIds = [];
      
      for (const pkg of allPackages) {
        try {
          const productsResponse = await window.axios.get(`/packages/${pkg.id}/products`);
          const products = productsResponse.data || [];
          if (products.some(p => p.id === product.id)) {
            packageIds.push(pkg.id);
          }
        } catch (error) {
          console.error(`Error checking package ${pkg.id}:`, error);
        }
      }
      
      productForm.value.package_ids = packageIds;
    } catch (error) {
      console.error('Error fetching package associations:', error);
    }
    
    showModal.value = true;
  } catch (error) {
    console.error('Error fetching product details:', error);
    // Fallback to basic product data
    productForm.value = {
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      category_id: product.category_id || '',
      package_ids: [],
      image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
    };
    showModal.value = true;
  }
};

const handleDeleteProduct = async (product) => {
  const confirmed = await confirmAction({
    action: t('delete') + ' ' + product.name,
    destructive: true,
  });
  if (!confirmed) return;
  
  try {
    await window.axios.delete(`/admin/products/${product.id}`);
    showNotification(t('product_deleted_successfully'), 'success');
    await fetchProducts();
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_delete_product'), 'error');
  }
};

const saveProduct = async () => {
  if (!productForm.value.name || !productForm.value.price || !productForm.value.description || !productForm.value.stock) {
    showNotification(t('please_fill_all_required_fields'), 'warning');
    return;
  }
  
  saving.value = true;
  try {
    const productData = {
      name: productForm.value.name,
      description: productForm.value.description,
      price: parseFloat(productForm.value.price),
      stock: parseInt(productForm.value.stock),
    };
    
    // Add images only if provided
    if (productForm.value.image_urls && productForm.value.image_urls.length > 0) {
      productData.image_url = productForm.value.image_urls[0];
      productData.image_urls = productForm.value.image_urls;
    }
    
    if (productForm.value.category_id) {
      productData.category_id = productForm.value.category_id;
    }
    
    let productId;
    if (editingProduct.value) {
      // Update existing product using admin endpoint
      await window.axios.put(`/admin/products/${editingProduct.value.id}`, productData);
      productId = editingProduct.value.id;
      showNotification(t('product_updated_successfully'), 'success');
    } else {
      // Create new product - admins can use the general products endpoint
      const response = await window.axios.post('/products', productData);
      productId = response.data.id || response.data.data?.id;
      showNotification(t('product_created_successfully'), 'success');
    }
    
    // Handle package associations
    if (productId && productForm.value.package_ids && productForm.value.package_ids.length > 0) {
      // Get current package associations for editing
      let currentPackageIds = [];
      if (editingProduct.value) {
        try {
          const packagesResponse = await window.axios.get('/packages');
          const allPackages = packagesResponse.data || [];
          
          for (const pkg of allPackages) {
            try {
              const productsResponse = await window.axios.get(`/packages/${pkg.id}/products`);
              const products = productsResponse.data || [];
              if (products.some(p => p.id === productId)) {
                currentPackageIds.push(pkg.id);
              }
            } catch (error) {
              console.error(`Error checking package ${pkg.id}:`, error);
            }
          }
        } catch (error) {
          console.error('Error fetching current package associations:', error);
        }
      }
      
      // Add to new packages using correct admin endpoint
      const packagesToAdd = productForm.value.package_ids.filter(id => !currentPackageIds.includes(id));
      for (const packageId of packagesToAdd) {
        try {
          await window.axios.post(`/admin/packages/${packageId}/attach-products`, {
            product_ids: [productId],
          });
          showNotification(t('product_added_to_package_successfully'), 'success');
        } catch (error) {
          console.error(`Error adding product to package ${packageId}:`, error);
          showNotification(error.response?.data?.message || t('failed_to_add_product_to_package'), 'error');
        }
      }
      
      // Remove from packages that are no longer selected (only when editing)
      if (editingProduct.value) {
        const packagesToRemove = currentPackageIds.filter(id => !productForm.value.package_ids.includes(id));
        for (const packageId of packagesToRemove) {
          try {
            await window.axios.post(`/admin/packages/${packageId}/detach-products`, {
              product_ids: [productId],
            });
          } catch (error) {
            console.error(`Error removing product from package ${packageId}:`, error);
            showNotification(error.response?.data?.message || t('failed_to_remove_product_from_package'), 'error');
          }
        }
      }
    } else if (productId && editingProduct.value) {
      // If editing and no packages selected, remove from all packages
      try {
        const packagesResponse = await window.axios.get('/packages');
        const allPackages = packagesResponse.data || [];
        
        for (const pkg of allPackages) {
          try {
            const productsResponse = await window.axios.get(`/packages/${pkg.id}/products`);
            const products = productsResponse.data || [];
            if (products.some(p => p.id === productId)) {
              await window.axios.post(`/admin/packages/${pkg.id}/detach-products`, {
                product_ids: [productId],
              });
            }
          } catch (error) {
            console.error(`Error removing product from package ${pkg.id}:`, error);
          }
        }
      } catch (error) {
        console.error('Error removing product from packages:', error);
      }
    }
    
    closeModal();
    await fetchProducts();
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_save_product'), 'error');
  } finally {
    saving.value = false;
  }
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    // Use general products endpoint - admins can access all products
    const response = await window.axios.get('/products', { params: { per_page: 1000 } });
    products.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await window.axios.get('/categories');
    categories.value = response.data || response.data?.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories.value = [];
  }
};

const fetchPackages = async () => {
  try {
    const response = await window.axios.get('/packages');
    packages.value = response.data || response.data?.data || [];
  } catch (error) {
    console.error('Error fetching packages:', error);
    packages.value = [];
  }
};

const openAddToPackageModal = (product) => {
  currentProductForPackage.value = product;
  showAddToPackageModal.value = true;
};

const closeAddToPackageModal = () => {
  showAddToPackageModal.value = false;
  currentProductForPackage.value = null;
  addingToPackage.value = false;
};

const addProductToPackageFromModal = async (packageId) => {
  if (!currentProductForPackage.value) return;
  
  addingToPackage.value = true;
  try {
    await window.axios.post(`/admin/packages/${packageId}/attach-products`, {
      product_ids: [currentProductForPackage.value.id],
    });
    showNotification(t('product_added_to_package_successfully'), 'success');
    // Refresh packages to update product count
    await fetchPackages();
  } catch (error) {
    console.error('Error adding product to package:', error);
    showNotification(error.response?.data?.message || t('failed_to_add_product_to_package'), 'error');
  } finally {
    addingToPackage.value = false;
  }
};

onMounted(async () => {
  await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchPackages(),
  ]);
});
</script>

