<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white">{{ t('manage_users') }}</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">{{ t('view_manage_all_users') }}</p>
        </div>

        <!-- Filters -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 p-6 mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Search -->
            <div class="flex-1 relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                :placeholder="t('search_by_name_or_email')"
                class="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <!-- Role Filter -->
            <div class="flex items-center space-x-2">
              <Filter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <select
                v-model="filterRole"
                @change="handleFilterChange"
                class="px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">{{ t('all_users') }}</option>
                <option value="customer">{{ t('customers') }}</option>
                <option value="admin">{{ t('admins') }}</option>
              </select>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 mt-4">
            <div class="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div class="text-2xl font-bold text-amber-800 dark:text-amber-500">
                {{ activeUsersCount }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('active_users') }}</div>
            </div>
            <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="text-2xl font-bold text-blue-800 dark:text-blue-500">
                {{ customersCount }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('customers') }}</div>
            </div>
            <div class="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="text-2xl font-bold text-purple-800 dark:text-purple-500">
                {{ adminsCount }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('admins') }}</div>
            </div>
          </div>
        </div>

        <!-- Users List -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gradient-to-r from-amber-800 to-amber-900 text-white">
                <tr>
                  <th class="px-6 py-4 text-left">{{ t('user') }}</th>
                  <th class="px-6 py-4 text-left">{{ t('email') }}</th>
                  <th class="px-6 py-4 text-left">{{ t('role') }}</th>
                  <th class="px-6 py-4 text-left">{{ t('status') }}</th>
                  <th class="px-6 py-4 text-right">{{ t('actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-if="loading" class="text-center">
                  <td colspan="5" class="px-6 py-12 text-gray-500 dark:text-gray-400">
                    {{ t('loading_users') }}
                  </td>
                </tr>
                <tr v-else-if="filteredUsers.length === 0" class="text-center">
                  <td colspan="5" class="px-6 py-12">
                    <div class="flex flex-col items-center">
                      <User :size="64" class="mb-4 text-gray-400" />
                      <p class="text-gray-500 dark:text-gray-400">{{ t('no_users_found') }}</p>
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="hover:bg-amber-50 dark:hover:bg-amber-900/10"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 dark:from-amber-800 dark:to-amber-600 flex items-center justify-center">
                        <img
                          v-if="user.avatar_url || user.profileImage"
                          :src="user.avatar_url || user.profileImage"
                          :alt="user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()"
                          class="w-full h-full rounded-full object-cover"
                        />
                        <User v-else :size="20" class="text-amber-900 dark:text-amber-100" />
                      </div>
                      <div>
                        <div class="font-medium text-gray-900 dark:text-white">
                          {{ user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || t('unknown_user') }}
                        </div>
                        <div v-if="user.phone" class="text-sm text-gray-500 dark:text-gray-400">
                          {{ user.phone }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {{ user.email }}
                  </td>
                  <td class="px-6 py-4">
                    <span :class="[
                      'inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm',
                      user.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                    ]">
                      <Shield v-if="user.role === 'admin'" :size="16" />
                      <User v-else :size="16" />
                      <span class="capitalize">{{ user.role === 'admin' ? t('admin') : t('customer') }}</span>
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span :class="[
                      'inline-flex px-3 py-1 rounded-full text-sm',
                      user.is_private || user.isPrivate
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    ]">
                      {{ user.is_private || user.isPrivate ? t('private') : t('public') }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-end space-x-2">
                      <button
                        @click="viewUserProfile(user.id)"
                        class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        :title="t('view_profile')"
                      >
                        <Eye :size="20" />
                      </button>
                      <button
                        @click="openChat(user.id)"
                        class="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                        :title="t('chat')"
                      >
                        <MessageSquare :size="20" />
                      </button>
                      <button
                        v-if="user.role !== 'admin'"
                        @click="handleBlockUser(user)"
                        class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        :title="t('block_user')"
                      >
                        <Ban :size="20" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import { ChevronLeft, User, Shield, Filter, Search, MessageSquare, Ban, Eye } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import { confirmAction } from '../utils/confirmation';
import { showNotification } from '../utils/notifications';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const users = ref([]);
const loading = ref(false);
const filterRole = ref('all');
const searchQuery = ref('');

const isDarkMode = computed(() => authStore.isDarkMode);

// Filtered users based on search and role filter
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    // Exclude blocked users
    if (user.is_blocked) return false;
    
    // Role filter
    const matchesRole = filterRole.value === 'all' || user.role === filterRole.value;
    
    // Search filter
    const searchLower = searchQuery.value.toLowerCase();
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower));
    
    return matchesRole && matchesSearch;
  });
});

// Stats
const activeUsersCount = computed(() => {
  return users.value.filter(u => !u.is_blocked).length;
});

const customersCount = computed(() => {
  return users.value.filter(u => u.role === 'customer' && !u.is_blocked).length;
});

const adminsCount = computed(() => {
  return users.value.filter(u => u.role === 'admin').length;
});

// Debounce search
let searchTimeout = null;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // Filtering is done client-side via computed property
  }, 300);
};

const handleFilterChange = () => {
  // Filtering is done client-side via computed property
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get('/admin/users');
    
    if (response.data.data) {
      users.value = response.data.data;
    } else {
      users.value = response.data || [];
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    users.value = [];
  } finally {
    loading.value = false;
  }
};

const viewUserProfile = (userId) => {
  router.push(`/admin/user/${userId}/profile`);
};

const openChat = (userId) => {
  router.push({ name: 'admin-chat', params: { userId: userId } });
};

const handleBlockUser = async (user) => {
  const confirmed = await confirmAction({
    action: t('block_user') || 'block this user',
    message: t('confirm_block_user'),
    destructive: true
  });
  if (!confirmed) return;
  
  try {
    await window.axios.post(`/admin/users/${user.id}/block`);
    await fetchUsers();
    showNotification(t('user_blocked_successfully'), 'success');
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_block_user'), 'error');
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
