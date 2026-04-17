<template>
  <div :class="['min-h-screen flex flex-col', isDarkMode ? 'bg-gray-900' : 'bg-gray-50']">
    <!-- Message Banner -->
    <div class="bg-red-600 text-white p-4 text-center">
      <h1 class="text-xl font-bold mb-2">{{ t('account_blocked') }}</h1>
      <p class="mb-4">{{ t('account_blocked_message') }}</p>
      <button
        v-if="blockedByAdmin"
        @click="contactSupport"
        class="px-6 py-2 rounded-lg font-semibold text-white bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
      >
        {{ t('contact_support_team') }}
      </button>
      <div v-else-if="loadingBlockedInfo" class="text-white opacity-75">
        {{ t('loading') }}
      </div>
    </div>

      <!-- Chat Interface (Only with Admin who Blocked) -->
    <div v-if="blockedByAdmin || selectedAdminId" class="flex-1 flex">

      <!-- Right Side: Chat Window -->
      <div class="flex-1 flex flex-col" :class="isDarkMode ? 'bg-gray-900' : 'bg-white'">
        <!-- Chat Header -->
        <div class="h-20 flex items-center justify-between px-4 border-b" :class="isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'">
          <div class="flex items-center gap-3">
            <img
              :src="(selectedAdmin || blockedByAdmin)?.avatar_url || '/placeholder.png'"
              :alt="(selectedAdmin || blockedByAdmin)?.name"
              class="w-10 h-10 rounded-full"
            />
          </div>
          <div class="text-right">
            <span class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-800'">
              {{ (selectedAdmin || blockedByAdmin)?.name }} [{{ (selectedAdmin || blockedByAdmin)?.role }}]
            </span>
          </div>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto space-y-4 p-4">
          <div v-for="msg in messages" :key="msg.id" class="flex justify-end">
            <div class="max-w-xs rounded-lg p-3 bg-[#6D4C41] text-white">
              <p>{{ msg.message }}</p>
              <img v-if="msg.image_url" :src="msg.image_url" class="mt-2 rounded max-w-full" />
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t" :class="isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'">
          <div class="flex gap-2">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              type="text"
              :placeholder="t('type_message')"
              class="flex-1 px-4 py-2 rounded-lg border"
              :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'"
            />
            <button
              @click="sendMessage"
              class="px-6 py-2 rounded-lg font-semibold text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors"
            >
              {{ t('send') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center" :class="isDarkMode ? 'bg-gray-900' : 'bg-white'">
      <div class="text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
        <p class="text-xl">{{ t('loading_blocked_information') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import { ChevronLeft } from 'lucide-vue-next';
import { showNotification } from '../utils/notifications';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const admins = ref([]);
const adminsLoading = ref(false);
const selectedAdminId = ref(null);
const selectedAdmin = ref(null);
const messages = ref([]);
const newMessage = ref('');
const blockedByAdmin = ref(null);
const loadingBlockedInfo = ref(false);

const isDarkMode = computed(() => authStore.isDarkMode);
const user = computed(() => authStore.user);

const fetchBlockedInfo = async () => {
  loadingBlockedInfo.value = true;
  try {
    const response = await window.axios.get('/profile/blocked-info');
    blockedByAdmin.value = response.data.blocked_by;
    // If admin exists, set them as selected
    if (blockedByAdmin.value) {
      selectedAdminId.value = blockedByAdmin.value.id;
      selectedAdmin.value = blockedByAdmin.value;
      fetchMessages();
    }
  } catch (error) {
    console.error('Error fetching blocked info:', error);
    // If not found, fetch all admins as fallback
    fetchAdmins();
  } finally {
    loadingBlockedInfo.value = false;
  }
};

const fetchAdmins = async () => {
  adminsLoading.value = true;
  try {
    const response = await window.axios.get('/admins');
    admins.value = response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
  } finally {
    adminsLoading.value = false;
  }
};

const contactSupport = () => {
  if (blockedByAdmin.value) {
    selectedAdminId.value = blockedByAdmin.value.id;
    selectedAdmin.value = blockedByAdmin.value;
    fetchMessages();
  } else {
    fetchAdmins();
  }
};

const selectAdmin = (adminId) => {
  selectedAdminId.value = adminId;
  selectedAdmin.value = admins.value.find(a => a.id === adminId);
  fetchMessages();
};

const fetchMessages = async () => {
  if (!selectedAdminId.value) return;
  
  try {
    const response = await window.axios.get(`/messages/${selectedAdminId.value}`);
    messages.value = response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedAdminId.value) return;
  try {
    await window.axios.post('/messages', {
      to_user_id: selectedAdminId.value,
      message: newMessage.value,
    });
    newMessage.value = '';
    await fetchMessages();
  } catch (error) {
    console.error('Error sending message:', error);
    showNotification(error.response?.data?.message || t('failed_to_send_message'), 'error');
  }
};

watch(selectedAdminId, () => {
  if (selectedAdminId.value) {
    fetchMessages();
  }
});

onMounted(() => {
  fetchBlockedInfo();
});
</script>
