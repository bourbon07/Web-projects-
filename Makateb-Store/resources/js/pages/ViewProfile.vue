<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div v-if="loading" class="flex items-center justify-center min-h-screen" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
        {{ t('loading') }}
      </div>
      
      <div v-else-if="userProfile" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <button
          @click="$router.back()"
          class="flex items-center space-x-2 text-amber-800 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-400 mb-6"
        >
          <ChevronLeft :size="20" />
          <span>{{ t('back') }}</span>
        </button>

        <!-- Profile Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-amber-800 to-amber-900 p-8 text-white">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-6">
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center">
                  <img
                    v-if="userProfile.avatar_url"
                    :src="userProfile.avatar_url"
                    :alt="userProfile.name"
                    class="w-full h-full rounded-full object-cover"
                    @error="userProfile.avatar_url = null"
                  />
                  <User v-else :size="48" class="text-amber-900" />
                </div>
                <div>
                  <h1 class="text-3xl font-bold mb-2">
                    {{ userProfile.name }}
                  </h1>
                  <p class="text-amber-200 capitalize">{{ getRoleDisplay(userProfile.role) }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  v-if="currentUser?.id !== userProfile?.id"
                  @click="openChat"
                  class="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Chat with user"
                >
                  <MessageSquare :size="20" />
                </button>
                <button
                  v-if="currentUser?.role === 'admin' && userProfile.role !== 'admin'"
                  @click="blockUser"
                  class="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors"
                  title="Block user"
                >
                  <Ban :size="20" />
                </button>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="p-8">
            <!-- Edit Toggle (only for admins viewing other users) -->
            <div v-if="currentUser?.role === 'admin' && currentUser?.id !== userProfile?.id" class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('user_information') }}</h2>
              <div v-if="!isEditing">
                <WoodButton @click="isEditing = true" size="sm">
                  {{ t('edit_information') }}
                </WoodButton>
              </div>
              <div v-else class="flex gap-2">
                <WoodButton @click="handleSaveChanges" size="sm" class="flex items-center space-x-2">
                  <Save :size="16" />
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
            <div v-else class="mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('user_information') }}</h2>
            </div>

            <!-- Private Account Message -->
            <div v-if="userProfile.is_private && currentUser?.role !== 'admin'" class="text-center py-8">
              <div class="mb-4">
                <svg class="w-16 h-16 mx-auto" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ t('private_account') }}
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ t('private_profile_message') }}
              </p>
            </div>

            <!-- Information Grid -->
            <div v-else class="space-y-6">
              <!-- First Name -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <User :size="16" />
                  <span>{{ t('first_name') }}</span>
                </label>
                <input
                  v-if="isEditing && currentUser?.role === 'admin'"
                  type="text"
                  v-model="formData.firstName"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p v-else class="text-lg text-gray-900 dark:text-white">{{ getFirstName(userProfile.name) }}</p>
              </div>

              <!-- Last Name -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <User :size="16" />
                  <span>{{ t('last_name') }}</span>
                </label>
                <input
                  v-if="isEditing && currentUser?.role === 'admin'"
                  type="text"
                  v-model="formData.lastName"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p v-else class="text-lg text-gray-900 dark:text-white">{{ getLastName(userProfile.name) }}</p>
              </div>

              <!-- Email -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <Mail :size="16" />
                  <span>{{ t('email') }}</span>
                </label>
                <input
                  v-if="isEditing && currentUser?.role === 'admin'"
                  type="email"
                  v-model="formData.email"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p v-else class="text-lg text-gray-900 dark:text-white">{{ userProfile.email }}</p>
              </div>

              <!-- Phone -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <Phone :size="16" />
                  <span>{{ t('phone') }}</span>
                </label>
                <input
                  v-if="isEditing && currentUser?.role === 'admin'"
                  type="tel"
                  v-model="formData.phone"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p v-else class="text-lg text-gray-900 dark:text-white">{{ userProfile.phone || t('not_provided') }}</p>
              </div>

              <!-- Location -->
              <div>
                <label class="flex items-center space-x-2 text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                  <MapPin :size="16" />
                  <span>{{ t('location') }}</span>
                </label>
                <input
                  v-if="isEditing && currentUser?.role === 'admin'"
                  type="text"
                  v-model="formData.location"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p v-else class="text-lg text-gray-900 dark:text-white">{{ userProfile.location || t('not_provided') }}</p>
              </div>

              <!-- Bio -->
              <div v-if="userProfile.bio">
                <label class="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400 block">
                  {{ t('bio') }}
                </label>
                <p class="text-gray-900 dark:text-white">{{ userProfile.bio }}</p>
              </div>
            </div>

            <!-- Privacy Settings -->
            <div class="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <h3 class="font-bold mb-2 text-gray-900 dark:text-white">{{ t('privacy_settings') }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('profile_visibility') }}: <span class="font-medium">{{ userProfile.is_private ? t('private') : t('public') }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import { ChevronLeft, User, Mail, Phone, MapPin, Ban, MessageSquare, Save } from 'lucide-vue-next';
import { confirmAction } from '../utils/confirmation';
import { showNotification } from '../utils/notifications';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const userProfile = ref(null);
const loading = ref(false);
const isEditing = ref(false);
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
});

const isDarkMode = computed(() => authStore.isDarkMode);
const currentUser = computed(() => authStore.user);

const getRoleDisplay = (role) => {
  const roleMap = {
    'admin': 'Admin',
    'customer': 'Customer'
  };
  return roleMap[role] || role;
};

const getRoleBadgeClass = (role) => {
  if (role === 'admin') {
    return isDarkMode.value ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800';
  }
  // customer - keep as is (blue)
  return isDarkMode.value ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
};

const getFirstName = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  return parts[0] || '';
};

const getLastName = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  return parts.slice(1).join(' ') || '';
};

const cancelEdit = () => {
  isEditing.value = false;
  formData.value = {
    firstName: getFirstName(userProfile.value?.name || ''),
    lastName: getLastName(userProfile.value?.name || ''),
    email: userProfile.value?.email || '',
    phone: userProfile.value?.phone || '',
    location: userProfile.value?.location || '',
  };
};

const handleSaveChanges = async () => {
  try {
    const updateData = {
      name: `${formData.value.firstName} ${formData.value.lastName}`.trim(),
      email: formData.value.email,
      phone: formData.value.phone,
      location: formData.value.location,
    };
    
    await window.axios.put(`/admin/users/${route.params.userId}`, updateData);
    userProfile.value = {
      ...userProfile.value,
      name: updateData.name,
      email: updateData.email,
      phone: updateData.phone,
      location: updateData.location,
    };
    isEditing.value = false;
    showNotification(t('user_profile_updated_successfully'), 'success');
  } catch (error) {
    console.error('Error updating user profile:', error);
    showNotification(error.response?.data?.message || t('failed_to_update_user_profile'), 'error');
  }
};

const fetchUserProfile = async () => {
  loading.value = true;
  try {
    if (currentUser.value?.role === 'admin') {
      const response = await window.axios.get(`/admin/users/${route.params.userId}`);
      userProfile.value = response.data;
    } else {
      const response = await window.axios.get(`/users/${route.params.userId}/profile`);
      userProfile.value = response.data;
    }
    
    // Initialize form data
    formData.value = {
      firstName: getFirstName(userProfile.value?.name || ''),
      lastName: getLastName(userProfile.value?.name || ''),
      email: userProfile.value?.email || '',
      phone: userProfile.value?.phone || '',
      location: userProfile.value?.location || '',
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    const errorMessage = error.response?.data?.message || error.message || t('failed_to_load_profile');
    showNotification(errorMessage, 'error');
    if (currentUser.value?.role !== 'admin') {
      router.push('/dashboard');
    }
  } finally {
    loading.value = false;
  }
};

const openChat = () => {
  router.push({ path: '/chat', query: { userId: route.params.userId } });
};

const blockUser = async () => {
  const confirmed = await confirmAction({
    action: t('block_user') || 'block this user',
    message: t('are_you_sure_block_user_with_name')?.replace('{name}', userProfile.value?.name || '') || `Are you sure you want to block ${userProfile.value?.name}? This will delete their account and all their products.`,
    destructive: true
  });
  if (!confirmed) return;
  
  try {
    await window.axios.post(`/admin/users/${route.params.userId}/block`);
    showNotification(t('user_blocked_successfully'), 'success');
    router.push('/block-list');
  } catch (error) {
    console.error('Error blocking user:', error);
    showNotification(error.response?.data?.message || t('failed_to_block_user'), 'error');
  }
};

onMounted(() => {
  fetchUserProfile();
});
</script>
