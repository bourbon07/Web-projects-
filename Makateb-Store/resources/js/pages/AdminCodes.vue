<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <button
            @click="$router.push('/admin/manage-site')"
            class="flex items-center space-x-2 text-amber-800 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-400 mb-4"
          >
            <ChevronLeft :size="20" />
            <span>{{ t('back') }}</span>
          </button>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">{{ t('manage_admin_codes') }}</h1>
          <p class="text-gray-600 dark:text-gray-400">{{ t('create_manage_admin_codes_description') }}</p>
        </div>

        <!-- Add New Code Form -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30 mb-6">
          <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{{ t('add_new_admin_code') }}</h2>
          <form @submit.prevent="addAdminCode" class="flex gap-4">
            <div class="flex-1">
              <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('admin_code') }}</label>
              <input
                v-model="newCode"
                type="text"
                maxlength="4"
                pattern="[0-9]{4}"
                placeholder="0000"
                required
                class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ t('code_must_be_4_digits') }}</p>
            </div>
            <div class="flex items-end">
              <WoodButton type="submit" :disabled="addingCode">
                {{ addingCode ? t('adding') : t('add_code') }}
              </WoodButton>
            </div>
          </form>
        </div>

        <!-- Admin Codes List -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30">
          <div class="p-6">
            <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{{ t('admin_codes_list') }}</h2>
            
            <div v-if="loading" class="text-center py-8 text-gray-600 dark:text-gray-400">
              {{ t('loading') }}
            </div>
            
            <div v-else-if="adminCodes.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
              {{ t('no_admin_codes') }}
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="code in adminCodes"
                :key="code.id"
                :class="[
                  'flex items-center justify-between p-4 rounded-lg border-2',
                  code.super_admin
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                    : code.is_active 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                ]"
              >
                <div class="flex items-center space-x-4">
                  <div 
                    :class="[
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      code.super_admin
                        ? 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg'
                        : 'bg-gradient-to-br from-amber-400 to-amber-600'
                    ]"
                  >
                    <span class="text-white font-bold text-lg">{{ code.code }}</span>
                  </div>
                  <div>
                    <div class="flex items-center space-x-2">
                      <p class="font-bold text-gray-900 dark:text-white">{{ code.code }}</p>
                      <span 
                        v-if="code.super_admin" 
                        class="px-2 py-1 rounded-full text-xs font-bold bg-amber-500 text-white dark:bg-amber-600"
                      >
                        {{ t('super_admin') }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {{ code.is_active ? t('active') : t('inactive') }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {{ t('created_at') }}: {{ formatDate(code.created_at) }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <!-- Only show buttons if NOT a super admin code -->
                  <template v-if="!(code.super_admin === true || code.code === '7986')">
                    <button
                      @click="toggleCode(code)"
                      :class="[
                        'px-4 py-2 rounded-lg font-medium transition-colors',
                        code.is_active
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      ]"
                    >
                      {{ code.is_active ? t('deactivate') : t('activate') }}
                    </button>
                    <button
                      @click="deleteCode(code.id)"
                      class="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                    >
                      {{ t('delete') }}
                    </button>
                  </template>
                  <!-- Show super admin text for super admin codes -->
                  <span 
                    v-else
                    class="px-3 py-2 text-sm text-amber-700 dark:text-amber-400 font-medium bg-amber-100 dark:bg-amber-900/30 rounded-lg"
                  >
                    {{ t('super_admin') }}
                  </span>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLanguageStore } from '../stores/language';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import { ChevronLeft } from 'lucide-vue-next';
import { showNotification } from '../utils/notifications';
import { confirmAction } from '../utils/confirmation';

const router = useRouter();
const languageStore = useLanguageStore();
const t = languageStore.t;

const adminCodes = ref([]);
const newCode = ref('');
const addingCode = ref(false);
const loading = ref(true);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const fetchAdminCodes = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get('/admin/admin-codes');
    adminCodes.value = response.data || [];
  } catch (error) {
    console.error('Error fetching admin codes:', error);
    if (error.response?.status === 403) {
      showNotification(t('unauthorized_access') || 'Unauthorized access', 'error');
      router.push('/admin/manage-site');
    } else {
      showNotification(t('failed_to_fetch_admin_codes') || 'Failed to fetch admin codes', 'error');
    }
  } finally {
    loading.value = false;
  }
};

const addAdminCode = async () => {
  if (!newCode.value || newCode.value.length !== 4 || !/^\d{4}$/.test(newCode.value)) {
    showNotification(t('code_must_be_4_digits') || 'Code must be exactly 4 digits', 'warning');
    return;
  }

  addingCode.value = true;
  try {
    const response = await window.axios.post('/admin/admin-codes', {
      code: newCode.value
    });
    adminCodes.value.unshift(response.data);
    newCode.value = '';
    showNotification(t('admin_code_added_successfully') || 'Admin code added successfully', 'success');
  } catch (error) {
    console.error('Error adding admin code:', error);
    const errorMessage = error.response?.data?.message || t('failed_to_add_admin_code') || 'Failed to add admin code';
    showNotification(errorMessage, 'error');
  } finally {
    addingCode.value = false;
  }
};

const deleteCode = async (id) => {
  // Safety check: prevent deleting super admin codes
  const code = adminCodes.value.find(c => c.id === id);
  if (code?.super_admin) {
    showNotification(t('cannot_delete_super_admin_code') || 'Cannot delete super admin code', 'error');
    return;
  }

  const confirmed = await confirmAction({
    action: t('delete_this_admin_code') || 'delete this admin code',
    message: t('are_you_sure_delete_admin_code') || 'Are you sure you want to delete this admin code?',
    destructive: true
  });
  if (!confirmed) {
    return;
  }

  try {
    await window.axios.delete(`/admin/admin-codes/${id}`);
    adminCodes.value = adminCodes.value.filter(code => code.id !== id);
    showNotification(t('admin_code_deleted_successfully') || 'Admin code deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting admin code:', error);
    const errorMessage = error.response?.data?.message || t('failed_to_delete_admin_code') || 'Failed to delete admin code';
    showNotification(errorMessage, 'error');
  }
};

const toggleCode = async (code) => {
  // Safety check: prevent toggling super admin codes
  if (code?.super_admin) {
    showNotification(t('cannot_modify_super_admin_code') || 'Cannot modify super admin code', 'error');
    return;
  }

  try {
    const response = await window.axios.put(`/admin/admin-codes/${code.id}/toggle`);
    const index = adminCodes.value.findIndex(c => c.id === code.id);
    if (index !== -1) {
      adminCodes.value[index] = response.data;
    }
    showNotification(t('admin_code_updated_successfully') || 'Admin code updated successfully', 'success');
  } catch (error) {
    console.error('Error toggling admin code:', error);
    const errorMessage = error.response?.data?.message || t('failed_to_update_admin_code') || 'Failed to update admin code';
    showNotification(errorMessage, 'error');
  }
};

onMounted(() => {
  fetchAdminCodes();
});
</script>

