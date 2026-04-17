<template>
  <AppLayout>
    <div v-if="!user" class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div class="text-center">
        <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{{ t('please_login_to_view_profile') }}</h2>
        <WoodButton @click="$router.push('/login')">{{ t('sign_in') }}</WoodButton>
      </div>
    </div>
    <div v-else class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">{{ t('my_profile') }}</h1>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border-2 border-amber-100 dark:border-amber-900/30">
          <!-- Profile Image -->
          <div class="flex flex-col items-center mb-8">
            <div class="relative">
              <img
                v-if="profile.avatar_url || user?.avatar_url"
                :src="profile.avatar_url || user?.avatar_url"
                :alt="getUserInitials()"
                class="w-32 h-32 rounded-full object-cover border-4 border-amber-300 dark:border-amber-700"
              />
              <div
                v-else
                class="w-32 h-32 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-4xl font-bold text-amber-900 dark:text-amber-100 border-4 border-amber-300 dark:border-amber-700"
              >
                {{ getUserInitials() }}
              </div>
            </div>
            <div class="mt-4 w-full max-w-md">
              <ImageUpload
                :model-value="profile.avatar_url || user?.avatar_url"
                :show-cloudinary="true"
                @update:model-value="handleAvatarUpdate"
              />
            </div>
            <h2 class="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
              {{ getUserFullName() }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">{{ user?.email || '' }}</p>
          </div>

          <!-- Profile Details -->
          <div class="space-y-6">
            <div>
              <label class="block font-semibold mb-2 text-gray-900 dark:text-white">{{ t('bio') }}</label>
              <textarea
                v-if="editMode"
                v-model="formData.bio"
                class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows="3"
                :placeholder="t('tell_us_about_yourself')"
              ></textarea>
              <p v-else class="text-gray-700 dark:text-gray-300">
                {{ profile.bio || user?.bio || t('no_bio_added') }}
              </p>
            </div>

            <div class="grid sm:grid-cols-2 gap-6">
              <div>
                <label class="block font-semibold mb-2 flex items-center space-x-2 text-gray-900 dark:text-white">
                  <Phone :size="16" />
                  <span>{{ t('phone_number') }}</span>
                </label>
                <input
                  v-if="editMode"
                  v-model="formData.phone"
                  type="tel"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  :placeholder="t('phone_placeholder')"
                />
                <p v-else class="text-gray-700 dark:text-gray-300">
                  {{ profile.phone || user?.phone || t('no_phone_added') }}
                </p>
              </div>

              <div>
                <label class="block font-semibold mb-2 flex items-center space-x-2 text-gray-900 dark:text-white">
                  <MapPin :size="16" />
                  <span>{{ t('location') }}</span>
                </label>
                <input
                  v-if="editMode"
                  v-model="formData.location"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  :placeholder="t('location_placeholder')"
                />
                <p v-else class="text-gray-700 dark:text-gray-300">
                  {{ profile.location || user?.location || t('no_location_added') }}
                </p>
              </div>
            </div>

            <div>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="formData.isPrivate"
                  :disabled="!editMode"
                  class="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <span class="font-semibold flex items-center space-x-2 text-gray-900 dark:text-white">
                  <Lock v-if="formData.isPrivate" :size="16" />
                  <Unlock v-else :size="16" />
                  <span>{{ t('private_account') }}</span>
                </span>
              </label>
              <p class="text-sm text-gray-600 dark:text-gray-400 ml-8">
                {{ t('private_account_description') }}
              </p>
            </div>

            <div class="flex gap-4 pt-4">
              <WoodButton
                v-if="editMode"
                @click="handleSave"
                :disabled="saving"
                class="flex-1"
              >
                {{ saving ? t('saving') : t('save_changes') }}
              </WoodButton>
              <WoodButton
                v-if="editMode"
                @click="handleCancel"
                variant="outline"
                class="flex-1"
              >
                {{ t('cancel') }}
              </WoodButton>
              <WoodButton
                v-else
                @click="editMode = true"
                class="w-full"
              >
                {{ t('edit_profile') }}
              </WoodButton>
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
import { Camera, MapPin, Phone, Lock, Unlock } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import ImageUpload from '../components/ImageUpload.vue';
import { showNotification } from '../utils/notifications';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const user = computed(() => authStore.user);
const profile = ref({ avatar_url: '', bio: '', location: '', phone: '', is_private: false });
const editMode = ref(false);
const saving = ref(false);
const formData = ref({
  bio: '',
  phone: '',
  location: '',
  isPrivate: false,
});

const isDarkMode = computed(() => authStore.isDarkMode);

const getUserFullName = () => {
  if (user.value?.name) {
    return user.value.name;
  }
  if (user.value?.first_name || user.value?.last_name) {
    return `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim();
  }
  return 'User';
};

const getUserInitials = () => {
  const name = getUserFullName();
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};


const fetchProfile = async () => {
  try {
    const response = await window.axios.get('/profile');
    profile.value = {
      avatar_url: response.data.avatar_url || '',
      bio: response.data.bio || '',
      location: response.data.location || '',
      phone: response.data.phone || '',
      is_private: response.data.is_private || false,
    };
    formData.value = {
      bio: profile.value.bio || '',
      phone: profile.value.phone || '',
      location: profile.value.location || '',
      isPrivate: profile.value.is_private || false,
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
};

const handleAvatarUpdate = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    // If it's a URL (from link or cloudinary), use updateAvatar endpoint
    if (imageUrl.startsWith('http')) {
      await window.axios.post('/profile/avatar', {
        avatar_url: imageUrl
      });
    } else {
      // If it's a file upload, it's already handled by ImageUpload component
      // Just update the local state
      profile.value.avatar_url = imageUrl;
    }
    
    profile.value.avatar_url = imageUrl;
    await authStore.fetchUser();
    showNotification(t('profile_image_updated'), 'success');
  } catch (error) {
    console.error('Error updating avatar:', error);
    showNotification(error.response?.data?.message || t('failed_to_update_profile_image'), 'error');
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    await window.axios.put('/profile', {
      bio: formData.value.bio,
      location: formData.value.location,
      phone: formData.value.phone,
      is_private: formData.value.isPrivate,
    });
    await authStore.fetchUser();
    await fetchProfile();
    editMode.value = false;
    showNotification(t('profile_updated_successfully'), 'success');
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_update_profile'), 'error');
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  editMode.value = false;
  formData.value = {
    bio: profile.value.bio || '',
    phone: profile.value.phone || '',
    location: profile.value.location || '',
    isPrivate: profile.value.is_private || false,
  };
};

onMounted(() => {
  fetchProfile();
});
</script>
