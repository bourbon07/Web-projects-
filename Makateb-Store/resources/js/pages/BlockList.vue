<template>
  <AppLayout>
    <div class="min-h-screen py-8" :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
      <div class="container mx-auto px-4 max-w-7xl">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ t('block_list') }}</h1>
          <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('manage_blocked_users_description') }}</p>
        </div>

        <!-- Search Bar -->
        <div class="mb-6">
          <div class="relative max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              :placeholder="t('search_by_name_or_email')"
              class="w-full pl-10 pr-4 py-2 rounded-lg border"
              :class="isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'"
            />
          </div>
        </div>

        <!-- Blocked Users Table -->
        <div class="rounded-xl shadow-sm overflow-hidden" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">
                    {{ t('avatar') }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">
                    {{ t('name') }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">
                    {{ t('email') }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">
                    {{ t('role') }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">
                    {{ t('date_blocked') }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">
                    {{ t('action') }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y" :class="isDarkMode ? 'divide-gray-700' : 'divide-gray-200'">
                <tr v-if="loading" class="text-center">
                  <td colspan="6" class="px-6 py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
        {{ t('loading') }}
                  </td>
                </tr>
                <tr v-else-if="blockedUsers.length === 0" class="text-center">
                  <td colspan="6" class="px-6 py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ t('no_blocked_users_found') }}
                  </td>
                </tr>
                <tr
                  v-for="blockedUser in blockedUsers"
                  :key="blockedUser.id"
                  @click="viewBlockedUserProfile(blockedUser)"
                  class="hover:bg-opacity-50 transition-colors cursor-pointer"
                  :class="isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'"
                >
                  <!-- AVATAR -->
                  <td class="px-6 py-4">
                    <div class="flex-shrink-0">
                      <img
                        v-if="blockedUser.avatar_url"
                        :src="blockedUser.avatar_url"
                        :alt="blockedUser.name"
                        class="w-10 h-10 rounded-full object-cover"
                      />
                      <div
                        v-else
                        class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                        :class="getAvatarColor(blockedUser.email)"
                      >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </td>

                  <!-- NAME -->
                  <td class="px-6 py-4">
                    <div class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ blockedUser.name || getEmailName(blockedUser.email) }}
                    </div>
                  </td>

                  <!-- EMAIL -->
                  <td class="px-6 py-4">
                    <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ blockedUser.email }}
                    </div>
                  </td>

                  <!-- ROLE -->
                  <td class="px-6 py-4">
                    <span
                      class="px-3 py-1 text-xs font-semibold rounded-full"
                      :class="getRoleBadgeClass(blockedUser.role || 'customer')"
                    >
                      {{ getRoleDisplay(blockedUser.role || 'customer') }}
                    </span>
                  </td>

                  <!-- DATE BLOCKED -->
                  <td class="px-6 py-4" @click.stop>
                    <div class="flex items-center gap-2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(blockedUser.blocked_at) }}
                    </div>
                  </td>

                  <!-- ACTION -->
                  <td class="px-6 py-4" @click.stop>
                    <button
                      @click="unblockUser(blockedUser.id)"
                      class="px-4 py-2 rounded-lg font-semibold text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors"
                    >
                      {{ t('unblock') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination Footer -->
        <div class="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
            {{ t('showing_results').replace('{from}', pagination.from || 0).replace('{to}', pagination.to || 0).replace('{total}', pagination.total || 0) }}
          </div>
          <div class="flex items-center gap-1">
            <!-- Previous Arrow -->
            <button
              @click="goToPage(pagination.current_page - 1)"
              :disabled="!pagination.prev_page_url"
              class="px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="pagination.prev_page_url 
                ? (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                : (isDarkMode ? 'text-gray-600' : 'text-gray-400')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <!-- Page Numbers -->
            <template v-for="page in getPageNumbers" :key="page">
              <button
                v-if="page !== '...'"
                @click="goToPage(page)"
                class="px-4 py-2 rounded-lg font-medium transition-colors min-w-[40px]"
                :class="page === pagination.current_page
                  ? 'bg-[#6D4C41] text-white'
                  : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')"
              >
                {{ page }}
              </button>
              <span
                v-else
                class="px-2 py-2"
                :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                ...
              </span>
            </template>
            
            <!-- Next Arrow -->
            <button
              @click="goToPage(pagination.current_page + 1)"
              :disabled="!pagination.next_page_url"
              class="px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="pagination.next_page_url 
                ? (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                : (isDarkMode ? 'text-gray-600' : 'text-gray-400')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Blocked User Profile Modal -->
      <div
        v-if="showBlockedUserModal && selectedBlockedUser"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showBlockedUserModal = false"
      >
        <div class="rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Blocked User Profile
            </h2>
            <button
              @click="showBlockedUserModal = false"
              class="p-2 rounded-lg transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
      </div>

          <div class="space-y-4">
            <!-- Avatar and Basic Info -->
            <div class="flex items-center gap-4">
              <div class="flex-shrink-0">
                <img
                  v-if="selectedBlockedUser.avatar_url"
                  :src="selectedBlockedUser.avatar_url"
                  :alt="selectedBlockedUser.name"
                  class="w-20 h-20 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-20 h-20 rounded-full flex items-center justify-center text-white"
                  :class="getAvatarColor(selectedBlockedUser.email)"
        >
                  <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ selectedBlockedUser.name || getEmailName(selectedBlockedUser.email) }}
            </h3>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ selectedBlockedUser.email }}
                </p>
                <span
                  class="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full"
                  :class="getRoleBadgeClass(selectedBlockedUser.role || 'customer')"
                >
                  {{ getRoleDisplay(selectedBlockedUser.role || 'customer') }}
                </span>
              </div>
            </div>

            <!-- Profile Information -->
            <div class="p-4 rounded-lg border" :class="isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'">
              <h4 class="font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Profile Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="block mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Name:</span>
                  <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ selectedBlockedUser.name || getEmailName(selectedBlockedUser.email) }}</span>
                </div>
                <div>
                  <span class="block mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Email:</span>
                  <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ selectedBlockedUser.email }}</span>
                </div>
                <div>
                  <span class="block mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Phone:</span>
                  <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ selectedBlockedUser.phone || 'Not provided' }}</span>
                </div>
                <div>
                  <span class="block mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Location:</span>
                  <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ selectedBlockedUser.location || 'Not provided' }}</span>
                </div>
                <div>
                  <span class="block mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('password') }}:</span>
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ selectedBlockedUser.has_password ? t('stored_encrypted') : t('not_available') }}
                  </span>
                </div>
                <div>
                  <span class="block mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('role') }}:</span>
                  <span
                    class="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                    :class="getRoleBadgeClass(selectedBlockedUser.role || 'customer')"
                  >
                    {{ getRoleDisplay(selectedBlockedUser.role || 'customer') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Blocked Information -->
            <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-red-900/30 border border-red-600' : 'bg-red-50 border border-red-200'">
              <h4 class="font-semibold mb-2" :class="isDarkMode ? 'text-red-400' : 'text-red-800'">{{ t('blocked_information') }}</h4>
              <div class="space-y-2 text-sm">
                <div>
                  <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ t('blocked_date') }}: </span>
                  <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ formatDate(selectedBlockedUser.blocked_at) }}</span>
                </div>
                <div v-if="selectedBlockedUser.blocked_by_name">
                  <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ t('blocked_by') }}: </span>
                  <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ selectedBlockedUser.blocked_by_name }}</span>
                </div>
              </div>
            </div>

            <!-- Note -->
            <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-100'">
              <p class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                <strong>{{ t('note') }}:</strong> {{ t('blocked_user_note') }}
              </p>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="showBlockedUserModal = false"
              class="px-6 py-2 rounded-lg font-semibold border transition-colors"
              :class="isDarkMode ? 'border-gray-600 text-white hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'"
            >
              {{ t('close') }}
            </button>
          <button 
              @click="unblockUser(selectedBlockedUser.id); showBlockedUserModal = false"
            class="px-6 py-2 rounded-lg font-semibold text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors"
          >
              Unblock User
          </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import AppLayout from '../components/AppLayout.vue';
import { ChevronLeft } from 'lucide-vue-next';
import { confirmAction } from '../utils/confirmation';
import { showNotification } from '../utils/notifications';

const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const blockedUsers = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const showBlockedUserModal = ref(false);
const selectedBlockedUser = ref(null);
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 5,
  total: 0,
  from: 0,
  to: 0,
  prev_page_url: null,
  next_page_url: null,
});

const isDarkMode = computed(() => authStore.isDarkMode);

// Debounce search
let searchTimeout = null;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.current_page = 1;
    fetchBlockedUsers();
  }, 500);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const getEmailName = (email) => {
  if (!email) return 'User';
  return email.split('@')[0].split('.').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
};

const getAvatarColor = (email) => {
  const colors = [
    'bg-[#6D4C41]',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-teal-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-red-500',
  ];
  if (!email) return colors[0];
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getRoleBadgeClass = (role) => {
  if (role === 'admin') {
    return isDarkMode.value ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white';
  }
  return isDarkMode.value ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white';
};

const getRoleDisplay = (role) => {
  if (role === 'admin') return t('admin');
  return t('customer');
};

// Generate page numbers with ellipsis
const getPageNumbers = computed(() => {
  const current = pagination.value.current_page || 1;
  const last = pagination.value.last_page || 1;
  const pages = [];
  
  if (last <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= last; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    if (current <= 3) {
      // Near the beginning: show 1, 2, 3, ..., last
      for (let i = 2; i <= 3; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(last);
    } else if (current >= last - 2) {
      // Near the end: show 1, ..., last-2, last-1, last
      pages.push('...');
      for (let i = last - 2; i <= last; i++) {
        pages.push(i);
      }
    } else {
      // In the middle: show 1, ..., current-1, current, current+1, ..., last
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(last);
    }
  }
  
  return pages;
});

const fetchBlockedUsers = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.current_page,
      per_page: pagination.value.per_page,
    };
    
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    
    const response = await window.axios.get('/admin/blocked-users', { params });
    
    if (response.data.data) {
      let users = response.data.data;
      
      // Client-side filtering by name if search is provided
      if (searchQuery.value) {
        const searchLower = searchQuery.value.toLowerCase();
        users = users.filter(user => {
          const name = (user.name || getEmailName(user.email)).toLowerCase();
          const email = (user.email || '').toLowerCase();
          return name.includes(searchLower) || email.includes(searchLower);
        });
      }
      
      blockedUsers.value = users;
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
        prev_page_url: response.data.prev_page_url,
        next_page_url: response.data.next_page_url,
      };
    } else {
    blockedUsers.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    showNotification(error.response?.data?.message || t('failed_to_fetch_blocked_users'), 'error');
  } finally {
    loading.value = false;
  }
};

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page;
    fetchBlockedUsers();
  }
};

const viewBlockedUserProfile = (blockedUser) => {
  selectedBlockedUser.value = blockedUser;
  showBlockedUserModal.value = true;
};

const unblockUser = async (blockedEmailId) => {
  const confirmed = await confirmAction({
    action: t('unblock_user') || 'unblock this user',
    message: t('confirm_unblock_user'),
    destructive: false
  });
  if (!confirmed) return;
  
  try {
    const response = await window.axios.post(`/admin/users/${blockedEmailId}/unblock`);
    showNotification(response.data.message || t('user_unblocked_successfully'), 'success');
    await fetchBlockedUsers();
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_unblock_user'), 'error');
  }
};

onMounted(() => {
  fetchBlockedUsers();
});
</script>
