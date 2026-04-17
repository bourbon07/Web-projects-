<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Profile Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-amber-800 to-amber-900 p-8 text-white">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-6">
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center">
                  <img v-if="userData.profileImage || userData.avatar_url" :src="userData.profileImage || userData.avatar_url" :alt="userData.firstName || userData.first_name" class="w-full h-full rounded-full object-cover" />
                  <svg v-else class="w-12 h-12 text-amber-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-3xl font-bold mb-2">
                    {{ userData.firstName || userData.first_name }} {{ userData.lastName || userData.last_name }}
                  </h1>
                  <p class="text-amber-200 capitalize">{{ userData.role === 'admin' ? t('admin') : t('customer') }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="handleChatWithUser"
                  class="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  :title="t('chat_with_user')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button
                  v-if="userData.role !== 'admin'"
                  @click="handleBlockUser"
                  class="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors"
                  :title="t('block_user')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="p-8">
            <!-- Edit Toggle -->
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('user_information') }}</h2>
              <WoodButton v-if="!isEditing" @click="isEditing = true" size="sm">
                {{ t('edit_information') }}
              </WoodButton>
              <div v-else class="flex gap-2">
                <WoodButton @click="handleSaveChanges" size="sm" class="flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{{ t('save_changes') }}</span>
                </WoodButton>
                <button
                  @click="cancelEdit"
                  class="px-4 py-2 text-sm border-2 border-amber-200 dark:border-amber-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {{ t('cancel') }}
                </button>
              </div>
            </div>

            <!-- Information Grid -->
            <div class="space-y-6">
              <!-- First Name -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span>{{ t('first_name') }}</span>
                </label>
                <input
                  v-if="isEditing"
                  type="text"
                  v-model="formData.firstName"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p v-else class="text-lg text-gray-900 dark:text-white">{{ userData.firstName || userData.first_name || t('not_provided') }}</p>
              </div>

              <!-- Last Name -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span>{{ t('last_name') }}</span>
                </label>
                <input
                  v-if="isEditing"
                  type="text"
                  v-model="formData.lastName"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p v-else class="text-lg text-gray-900 dark:text-white">{{ userData.lastName || userData.last_name || t('not_provided') }}</p>
              </div>

              <!-- Email -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{{ t('email') }}</span>
                </label>
                <input
                  v-if="isEditing"
                  type="email"
                  v-model="formData.email"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p v-else class="text-lg text-gray-900 dark:text-white">{{ userData.email || t('not_provided') }}</p>
              </div>

              <!-- Phone -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{{ t('phone') }}</span>
                </label>
                <input
                  v-if="isEditing"
                  type="tel"
                  v-model="formData.phone"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p v-else class="text-lg text-gray-900 dark:text-white">{{ userData.phone || t('not_provided') }}</p>
              </div>

              <!-- Location -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ t('location') }}</span>
                </label>
                <input
                  v-if="isEditing"
                  type="text"
                  v-model="formData.location"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p v-else class="text-lg text-gray-900 dark:text-white">{{ userData.location || t('not_provided') }}</p>
              </div>

              <!-- Bio -->
              <div v-if="userData.bio">
                <label class="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400 block">
                  {{ t('bio') }}
                </label>
                <p class="text-gray-900 dark:text-white">{{ userData.bio }}</p>
              </div>
            </div>

            <!-- Privacy Settings -->
            <div class="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <h3 class="font-bold mb-2 text-gray-900 dark:text-white">{{ t('privacy_settings') }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('profile_visibility') }}: <span class="font-medium">{{ userData.isPrivate || userData.is_private ? t('private') : t('public') }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import { ChevronLeft } from 'lucide-vue-next';
import { confirmAction } from '../utils/confirmation';
import { showNotification } from '../utils/notifications';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;

const userData = ref({
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  first_name: '',
  last_name: '',
  role: 'customer',
  isPrivate: false,
  is_private: false,
  phone: '',
  location: '',
  bio: '',
  profileImage: '',
  avatar_url: '',
});
const isEditing = ref(false);
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
});

const loadUser = async () => {
  try {
    const response = await window.axios.get(`/admin/users/${route.params.userId}`);
    userData.value = response.data;
    formData.value = {
      firstName: userData.value.firstName || userData.value.first_name || '',
      lastName: userData.value.lastName || userData.value.last_name || '',
      email: userData.value.email || '',
      phone: userData.value.phone || '',
      location: userData.value.location || '',
    };
  } catch (error) {
    console.error('Error loading user:', error);
    showNotification(t('failed_to_load_user_data') || 'Failed to load user data', 'error');
  }
};

const handleSaveChanges = async () => {
  try {
    await window.axios.put(`/admin/users/${route.params.userId}`, {
      first_name: formData.value.firstName,
      last_name: formData.value.lastName,
      email: formData.value.email,
      phone: formData.value.phone,
      location: formData.value.location,
    });
    userData.value = { 
      ...userData.value, 
      first_name: formData.value.firstName,
      firstName: formData.value.firstName,
      last_name: formData.value.lastName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      phone: formData.value.phone,
      location: formData.value.location,
    };
    isEditing.value = false;
    const t = useLanguageStore().t;
    showNotification(t('user_profile_updated_successfully') || 'User profile updated successfully!', 'success');
  } catch (error) {
    console.error('Error updating user:', error);
    const t = useLanguageStore().t;
    showNotification(error.response?.data?.message || t('failed_to_update_user_profile') || 'Failed to update user profile', 'error');
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  formData.value = {
    firstName: userData.value.firstName || userData.value.first_name || '',
    lastName: userData.value.lastName || userData.value.last_name || '',
    email: userData.value.email || '',
    phone: userData.value.phone || '',
    location: userData.value.location || '',
  };
};

const handleBlockUser = async () => {
  const confirmed = await confirmAction({
    action: t('block_this_user') || 'block this user',
    message: t('are_you_sure_block_user_message') || 'Are you sure you want to block this user?',
    destructive: true
  });
  if (!confirmed) return;
  try {
    await window.axios.post(`/admin/users/${route.params.userId}/block`);
    router.push('/admin/blocked-users');
  } catch (error) {
    console.error('Error blocking user:', error);
    const t = useLanguageStore().t;
    showNotification(error.response?.data?.message || t('failed_to_block_user') || 'Failed to block user', 'error');
  }
};

const handleChatWithUser = () => {
  router.push({ name: 'admin-chat', params: { userId: userData.value.id } });
};

onMounted(() => {
  loadUser();
});
</script>

