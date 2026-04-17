<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <Ban :size="40" class="text-red-600 dark:text-red-500" />
            <span>{{ t('blocked_users') }}</span>
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            {{ t('manage_blocked_users_restore_access') }}
          </p>
        </div>

        <!-- Stats -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div class="text-3xl font-bold text-red-600 dark:text-red-500">
                {{ Array.isArray(blockedUsers) ? blockedUsers.length : 0 }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ t('total_blocked') }}</div>
            </div>
            <div class="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div class="text-3xl font-bold text-amber-600 dark:text-amber-500">
                {{ blockedThisWeek }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ t('blocked_this_week') }}</div>
            </div>
            <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="text-3xl font-bold text-blue-600 dark:text-blue-500">
                {{ blockedOver30Days }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ t('blocked_over_30_days') }}</div>
            </div>
          </div>
        </div>

        <!-- Blocked Users List -->
        <div v-if="Array.isArray(blockedUsers) && blockedUsers.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="user in blockedUsers"
            :key="user.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-red-100 dark:border-red-900/30 p-6"
          >
            <!-- User Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center opacity-60">
                  <img v-if="user.avatar_url || user.profileImage" :src="user.avatar_url || user.profileImage" :alt="user.name || user.first_name" class="w-full h-full rounded-full object-cover" />
                  <User v-else :size="32" class="text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <h3 class="font-bold text-lg text-gray-900 dark:text-white">
                    {{ user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || t('unknown_user') }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</p>
                </div>
              </div>
              <span :class="[
                'inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm',
                user.role === 'admin'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
              ]">
                <Shield v-if="user.role === 'admin'" :size="16" />
                <User v-else :size="16" />
                <span class="capitalize">{{ user.role || 'customer' }}</span>
              </span>
            </div>

            <!-- User Info -->
            <div class="space-y-3 mb-4">
              <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('phone') }}:</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ user.phone || t('not_provided') }}
                </span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('location') }}:</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ user.location || t('not_provided') }}
                </span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('blocked_date') }}:</span>
                <span class="text-sm font-medium text-red-600 dark:text-red-400">
                  {{ formatDate(user.blocked_date || user.blockedDate) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <WoodButton
              @click="handleUnblockUser(user)"
              class="w-full flex items-center justify-center space-x-2"
              variant="outline"
            >
              <Unlock :size="20" />
              <span>{{ t('unblock_user') }}</span>
            </WoodButton>
          </div>
        </div>
        <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 p-12 text-center">
          <Ban :size="64" class="mx-auto mb-4 text-gray-400" />
          <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">{{ t('no_blocked_users') }}</h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('all_users_have_access') }}
          </p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLanguageStore } from '../stores/language';
import { ChevronLeft, Ban, User, Shield, Unlock } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import { confirmAction } from '../utils/confirmation';
import { showNotification } from '../utils/notifications';

const router = useRouter();
const languageStore = useLanguageStore();
const t = languageStore.t;
const blockedUsers = ref([]);

const blockedThisWeek = computed(() => {
  if (!Array.isArray(blockedUsers.value)) return 0;
  return blockedUsers.value.filter(u => {
    if (!u.blocked_date && !u.blockedDate) return false;
    const blockedDate = u.blocked_date || u.blockedDate;
    const daysSince = (Date.now() - new Date(blockedDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  }).length;
});

const blockedOver30Days = computed(() => {
  if (!Array.isArray(blockedUsers.value)) return 0;
  return blockedUsers.value.filter(u => {
    if (!u.blocked_date && !u.blockedDate) return false;
    const blockedDate = u.blocked_date || u.blockedDate;
    const daysSince = (Date.now() - new Date(blockedDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 30;
  }).length;
});

const loadBlockedUsers = async () => {
  try {
    const response = await window.axios.get('/admin/blocked-users');
    // Handle different response structures
    if (Array.isArray(response.data)) {
      blockedUsers.value = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      blockedUsers.value = response.data.data;
    } else if (response.data && Array.isArray(response.data.users)) {
      blockedUsers.value = response.data.users;
    } else {
      blockedUsers.value = [];
    }
  } catch (error) {
    console.error('Error loading blocked users:', error);
    blockedUsers.value = [];
  }
};

const handleUnblockUser = async (user) => {
  const confirmed = await confirmAction({
    action: t('unblock_user') || 'unblock this user',
    message: t('confirm_unblock_user_message'),
    destructive: false
  });
  if (!confirmed) return;
  try {
    await window.axios.post('/admin/users/unblock-by-email', { email: user.email });
    blockedUsers.value = blockedUsers.value.filter(u => u.id !== user.id && u.email !== user.email);
    showNotification(t('user_unblocked_success_message') || t('user_unblocked_successfully'), 'success');
  } catch (error) {
    console.error('Error unblocking user:', error);
    showNotification(error.response?.data?.message || t('failed_to_unblock_user_message') || t('failed_to_unblock_user'), 'error');
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadBlockedUsers();
});
</script>

