<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white">{{ t('service_fees_page_title') }}</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">{{ t('configure_delivery_service_fees') }}</p>
        </div>

        <!-- Service Fee -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 p-6 mb-6">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <DollarSign :size="24" class="text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ t('base_service_fee') }}</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('applied_to_all_orders') }}
              </p>
            </div>
          </div>

          <div class="flex gap-4 items-end">
            <div class="flex-1">
              <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {{ t('service_fee_label') }} ($)
              </label>
              <input
                v-model="serviceFeeForm.fee"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="0.00"
              />
            </div>
            <WoodButton @click="saveServiceFee" :disabled="savingServiceFee">
              {{ savingServiceFee ? t('saving') : t('save_service_fee') }}
            </WoodButton>
          </div>
        </div>

        <!-- Delivery Locations -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <MapPin :size="24" class="text-white" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ t('delivery_locations') }}</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ t('set_delivery_fees_for_locations') }}
                </p>
              </div>
            </div>
            <WoodButton @click="openCreateModal" class="flex items-center space-x-2">
              <Plus :size="20" />
              <span>{{ t('add_location') }}</span>
            </WoodButton>
          </div>

          <!-- Locations List -->
          <div v-if="loadingLocations" class="text-center py-8 text-gray-500 dark:text-gray-400">
            {{ t('loading_location_fees') }}
          </div>
          <div v-else-if="deliveryFees.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            {{ t('no_delivery_locations_configured') }}
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="fee in deliveryFees"
              :key="fee.id"
              class="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
            >
              <div class="flex items-center space-x-3">
                <MapPin :size="20" class="text-amber-800 dark:text-amber-500" />
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">{{ fee.location || fee.name }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ t('delivery_fee_label') }}: {{ formatPrice(fee.fee || fee.deliveryFee) }}
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="editFee(fee)"
                  class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                  <Edit :size="20" />
                </button>
                <button
                  @click="deleteFee(fee)"
                  class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 :size="20" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Fee Calculation Example -->
        <div class="mt-6 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-lg p-6 border-2 border-amber-300 dark:border-amber-700">
          <h3 class="font-bold mb-3 text-gray-900 dark:text-white">{{ t('fee_calculation_example') }}</h3>
          <div class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div class="flex justify-between">
              <span>{{ t('product_total') }}:</span>
              <span class="font-medium">$100.00</span>
            </div>
            <div class="flex justify-between">
              <span>{{ t('service_fee') }}:</span>
              <span class="font-medium">{{ formatPrice(serviceFeeForm.fee || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span>{{ t('delivery_fee') }} ({{ t('example') }}: {{ deliveryFees[0]?.location || deliveryFees[0]?.name || t('location') }}):</span>
              <span class="font-medium">{{ formatPrice(deliveryFees[0]?.fee || deliveryFees[0]?.deliveryFee || 0) }}</span>
            </div>
            <div class="border-t-2 border-amber-400 dark:border-amber-600 pt-2 mt-2 flex justify-between font-bold text-base">
              <span>{{ t('total') }}:</span>
              <span class="text-amber-800 dark:text-amber-500">
                ${{ (100 + parseFloat(serviceFeeForm.fee || 0) + parseFloat(deliveryFees[0]?.fee || deliveryFees[0]?.deliveryFee || 0)).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

        <!-- Location Modal -->
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          @click.self="closeModal"
        >
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div class="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-6 flex items-center justify-between rounded-t-lg">
              <h2 class="text-2xl font-bold flex items-center space-x-2">
                <MapPin :size="24" />
                <span>{{ editingFee ? t('edit_location') : t('add_new_location') }}</span>
              </h2>
              <button @click="closeModal" class="p-2 hover:bg-amber-700 rounded-lg">
                <X :size="24" />
              </button>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  {{ t('location_name') }} *
                </label>
                <input
                  v-model="feeForm.location"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  :placeholder="t('location_name_placeholder')"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  {{ t('delivery_fee_amount') }} ($) *
                </label>
                <input
                  v-model="feeForm.fee"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0.00"
                />
              </div>

              <div class="flex gap-3 pt-4">
                <WoodButton
                  @click="saveLocationFee"
                  :disabled="savingLocation"
                  class="flex-1"
                >
                  {{ savingLocation ? t('saving') : (editingFee ? t('update_location') : t('add_location')) }}
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
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import { ChevronLeft, DollarSign, Plus, Edit, Trash2, MapPin, X } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import { formatPriceDisplay } from '../utils/currency';
import { showNotification } from '../utils/notifications';
import { confirmAction } from '../utils/confirmation';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const serviceFee = ref(null);
const deliveryFees = ref([]);
const loadingServiceFee = ref(false);
const loadingLocations = ref(false);
const savingServiceFee = ref(false);
const savingLocation = ref(false);
const showModal = ref(false);
const editingFee = ref(null);

const serviceFeeForm = ref({
  fee: '',
});

const feeForm = ref({
  location: '',
  fee: '',
});

const isDarkMode = computed(() => authStore.isDarkMode);

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const fetchServiceFee = async () => {
  loadingServiceFee.value = true;
  try {
    const response = await window.axios.get('/admin/service-fee');
    serviceFee.value = response.data;
    serviceFeeForm.value = {
      fee: response.data.fee ? response.data.fee.toString() : '0',
    };
  } catch (error) {
    console.error('Error fetching services fee:', error);
    serviceFeeForm.value = { fee: '0' };
  } finally {
    loadingServiceFee.value = false;
  }
};

const fetchDeliveryFees = async () => {
  loadingLocations.value = true;
  try {
    const response = await window.axios.get('/admin/delivery-fees');
    deliveryFees.value = response.data || [];
  } catch (error) {
    console.error('Error fetching delivery fees:', error);
    showNotification(error.response?.data?.message || t('failed_to_fetch_locations'), 'error');
  } finally {
    loadingLocations.value = false;
  }
};

const saveServiceFee = async () => {
  const fee = parseFloat(serviceFeeForm.value.fee);
  if (isNaN(fee) || fee < 0) {
    showNotification(t('please_enter_service_fee'), 'warning');
    return;
  }

  savingServiceFee.value = true;
  try {
    const response = await window.axios.put('/admin/service-fee', { fee });
    serviceFee.value = response.data;
    showNotification(t('service_fee_updated_successfully'), 'success');
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_save_service_fee'), 'error');
  } finally {
    savingServiceFee.value = false;
  }
};

const openCreateModal = () => {
  editingFee.value = null;
  feeForm.value = {
    location: '',
    fee: '',
  };
  showModal.value = true;
};

const editFee = (fee) => {
  editingFee.value = fee;
  feeForm.value = {
    location: fee.location,
    fee: fee.fee,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingFee.value = null;
  feeForm.value = {
    location: '',
    fee: '',
  };
};

const saveLocationFee = async () => {
  if (!feeForm.value.location || !feeForm.value.fee) {
    showNotification(t('please_fill_all_fields'), 'warning');
    return;
  }

  savingLocation.value = true;
  try {
    const locationData = {
      location: feeForm.value.location,
      name: feeForm.value.location,
      fee: parseFloat(feeForm.value.fee),
      deliveryFee: parseFloat(feeForm.value.fee),
    };

    if (editingFee.value) {
      await window.axios.put(`/admin/delivery-fees/${editingFee.value.id}`, locationData);
      showNotification(t('location_saved_successfully'), 'success');
    } else {
      await window.axios.post('/admin/delivery-fees', locationData);
      showNotification(t('location_saved_successfully'), 'success');
    }
    closeModal();
    await fetchDeliveryFees();
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_save_location_fee'), 'error');
  } finally {
    savingLocation.value = false;
  }
};

const deleteFee = async (fee) => {
  const confirmed = await confirmAction({
    action: languageStore.currentLanguage === 'ar' ? 'حذف هذا الموقع' : 'delete this location',
    destructive: true,
  });
  if (!confirmed) return;
  
  try {
    await window.axios.delete(`/admin/delivery-fees/${fee.id}`);
    showNotification(t('location_deleted_successfully'), 'success');
    await fetchDeliveryFees();
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_delete_location'), 'error');
  }
};

onMounted(() => {
  fetchServiceFee();
  fetchDeliveryFees();
});
</script>
