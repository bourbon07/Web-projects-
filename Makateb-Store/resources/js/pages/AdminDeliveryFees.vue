<template>
  <AppLayout>
    <div class="min-h-screen py-8" :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
      <div class="container mx-auto px-4 max-w-7xl">
        <!-- Page Header -->
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Manage Tax</h1>
            <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Set tax by location</p>
          </div>
          <button
            @click="openCreateModal"
            class="px-6 py-2 rounded-lg font-semibold text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors"
          >
            + Add Location
          </button>
        </div>

        <!-- Delivery Fees List -->
        <div v-if="loading" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          Loading tax rates...
        </div>
        <div v-else-if="deliveryFees.length === 0" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          No tax rates configured. Add your first location!
        </div>
        <div v-else class="rounded-lg shadow-sm overflow-hidden" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
          <table class="w-full">
            <thead>
              <tr class="border-b" :class="isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'">
                <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Location</th>
                <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Fee (JD)</th>
                <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="fee in deliveryFees"
                :key="fee.id"
                class="border-b hover:bg-gray-50 transition-colors"
                :class="isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200'"
              >
                <td class="py-4 px-4">
                  <span class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ fee.location }}
                  </span>
                </td>
                <td class="py-4 px-4">
                  <span class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ formatPrice(fee.fee) }} JD
                  </span>
                </td>
                <td class="py-4 px-4">
                  <div class="flex items-center gap-2">
                    <button
                      @click="editFee(fee)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'"
                      title="Edit"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="deleteFee(fee)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'"
                      title="Delete"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div
        class="rounded-xl shadow-xl max-w-md w-full"
        :class="isDarkMode ? 'bg-gray-800' : 'bg-white'"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              {{ editingFee ? 'Edit Tax' : 'Add Tax' }}
            </h2>
            <button
              @click="closeModal"
              class="p-2 rounded-lg transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveFee" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Location *
              </label>
              <input
                v-model="feeForm.location"
                type="text"
                required
                class="w-full px-4 py-2 rounded-lg border"
                :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                placeholder="e.g., Amman, Irbid, Zarqa"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Tax (JD) *
              </label>
              <input
                v-model="feeForm.fee"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-4 py-2 rounded-lg border"
                :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                placeholder="0.00"
              />
            </div>


            <div class="flex items-center gap-3 pt-4">
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 px-4 py-2 rounded-lg font-semibold text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors disabled:bg-gray-400"
              >
                {{ saving ? 'Saving...' : (editingFee ? 'Update Fee' : 'Add Fee') }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 rounded-lg font-semibold transition-colors"
                :class="isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import AppLayout from '../components/AppLayout.vue';
import { ChevronLeft } from 'lucide-vue-next';
import { showNotification } from '../utils/notifications';
import { confirmAction } from '../utils/confirmation';

const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const deliveryFees = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const editingFee = ref(null);

const feeForm = ref({
  location: '',
  fee: '',
});

const isDarkMode = computed(() => authStore.isDarkMode);

const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(numPrice)) return '0.00';
  return numPrice.toFixed(2);
};

const fetchDeliveryFees = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get('/admin/delivery-fees');
    deliveryFees.value = response.data || [];
  } catch (error) {
    console.error('Error fetching delivery fees:', error);
    showNotification(error.response?.data?.message || t('failed_to_fetch_delivery_fees'), 'error');
  } finally {
    loading.value = false;
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

const saveFee = async () => {
  saving.value = true;
  try {
    if (editingFee.value) {
      await window.axios.put(`/admin/delivery-fees/${editingFee.value.id}`, feeForm.value);
      showNotification(t('tax_updated_successfully'), 'success');
    } else {
      await window.axios.post('/admin/delivery-fees', feeForm.value);
      showNotification(t('tax_created_successfully'), 'success');
    }
    closeModal();
    await fetchDeliveryFees();
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_save_tax'), 'error');
  } finally {
    saving.value = false;
  }
};

const deleteFee = async (fee) => {
  const confirmed = await confirmAction({
    action: languageStore.currentLanguage === 'ar' 
      ? `حذف الضريبة لـ "${fee.location}"`
      : `delete the tax for "${fee.location}"`,
    destructive: true,
  });
  if (!confirmed) return;
  
  try {
    await window.axios.delete(`/admin/delivery-fees/${fee.id}`);
    showNotification(t('tax_deleted_successfully'), 'success');
    await fetchDeliveryFees();
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_delete_tax'), 'error');
  }
};

onMounted(() => {
  fetchDeliveryFees();
});
</script>

