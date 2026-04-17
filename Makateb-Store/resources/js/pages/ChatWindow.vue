<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen flex flex-col">
        <h1 class="text-4xl font-bold mb-6 text-gray-900 dark:text-white">{{ t('contact_support') }}</h1>

        <!-- Chat Container -->
        <div class="flex-1 flex gap-4 overflow-hidden">
          <!-- Left Sidebar - Conversations List -->
          <div class="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 flex flex-col overflow-hidden">
            <!-- Search Conversations -->
            <div class="p-4 border-b-2 border-amber-100 dark:border-amber-900">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  v-model="searchConversations"
                  type="text"
                  :placeholder="t('search_users')"
                  class="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <!-- Conversations List -->
            <div class="flex-1 overflow-y-auto">
              <div v-if="loadingConversations" class="text-center py-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ t('loading') }}
              </div>
              <div v-else-if="filteredConversations.length === 0" class="text-center py-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ t('no_conversations') }}
              </div>
              <div v-else>
                <button
                  v-for="conv in filteredConversations"
                  :key="conv.id || conv.user?.id"
                  @click="selectConversation(conv)"
                  :class="[
                    'w-full p-4 flex items-center space-x-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border-b border-gray-200 dark:border-gray-700',
                    selectedConversationId === (conv.user?.id || conv.id) ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                  ]"
                >
                  <div class="relative">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 dark:from-amber-800 dark:to-amber-600 flex items-center justify-center">
                      <img
                        v-if="getConversationAvatar(conv)"
                        :src="getConversationAvatar(conv)"
                        :alt="getConversationName(conv)"
                        class="w-full h-full rounded-full object-cover"
                        @error="$event.target.src = '/placeholder.png'"
                      />
                      <User v-else :size="24" class="text-amber-900 dark:text-amber-100" />
                    </div>
                    <span 
                      :class="[
                        'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
                        conv.user?.is_online ? 'bg-green-500' : 'bg-gray-400'
                      ]"
                    ></span>
                  </div>
                  <div class="flex-1 text-left min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <p class="font-medium text-gray-900 dark:text-white truncate">{{ getConversationName(conv) }}</p>
                      <span v-if="hasUnread(conv) && conv.unread_count > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {{ conv.unread_count > 99 ? '99+' : conv.unread_count }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ conv.last_message?.message || t('no_messages') }}</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ formatTime(conv.last_message?.created_at, hasUnread(conv)) }}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Chat Area -->
          <div v-if="!selectedConversationId" class="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 flex items-center justify-center">
            <div class="text-center">
              <Users class="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p class="text-gray-500 dark:text-gray-400">{{ t('select_user_to_chat') }}</p>
            </div>
          </div>

          <div v-else class="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 flex flex-col overflow-hidden">
            <!-- Chat Header -->
            <div class="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-4 flex items-center space-x-3">
              <div class="relative">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center">
                  <img
                    v-if="otherUser?.avatar_url"
                    :src="otherUser.avatar_url"
                    :alt="otherUser.name"
                    class="w-full h-full rounded-full object-cover"
                    @error="$event.target.src = '/placeholder.png'"
                  />
                  <User v-else :size="20" class="text-amber-900" />
                </div>
                <span 
                  :class="[
                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-amber-800',
                    otherUser?.is_online ? 'bg-green-500' : 'bg-gray-400'
                  ]"
                ></span>
              </div>
              <div class="flex-1">
                <h2 class="font-bold">{{ otherUser?.name || 'User' }}</h2>
                <p class="text-sm text-amber-200">{{ otherUser?.email || '' }}</p>
              </div>
              <div class="relative">
                <button
                  @click.stop="showMenu = !showMenu"
                  class="p-2 rounded-lg hover:bg-amber-700 transition-colors text-white"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                <div
                  v-if="showMenu"
                  class="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <button
                    @click="viewProfile(otherUser?.id); showMenu = false"
                    class="w-full text-left px-4 py-2 text-sm rounded-t-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    {{ t('view_profile') }}
                  </button>
                  <button
                    @click="clearChat(); showMenu = false"
                    class="w-full text-left px-4 py-2 text-sm transition-colors text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    {{ t('clear_chat') }}
                  </button>
                  <button
                    v-if="user?.role === 'admin'"
                    @click="blockUser(); showMenu = false"
                    class="w-full text-left px-4 py-2 text-sm rounded-b-lg text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    {{ t('block_user') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
              <div
                v-for="msg in messages"
                :key="msg.id"
                :class="['flex', msg.from_user_id === user?.id ? 'justify-end' : 'justify-start']"
              >
                <div :class="[
                  'flex items-start space-x-2 max-w-[70%]',
                  msg.from_user_id === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                ]">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-amber-200 to-amber-400 dark:from-amber-800 dark:to-amber-600">
                    <User class="w-5 h-5 text-amber-900 dark:text-amber-100" />
                  </div>
                  <div>
                    <div :class="[
                      'rounded-lg p-3',
                      msg.from_user_id === user?.id
                        ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    ]">
                      <p class="break-words">{{ msg.message }}</p>
                      <img v-if="msg.image_url" :src="msg.image_url" class="mt-2 rounded max-w-full max-h-64 object-cover" />
                    </div>
                    <div :class="[
                      'flex items-center gap-2 mt-1 px-1',
                      msg.from_user_id === user?.id ? 'justify-end' : 'justify-start'
                    ]">
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatMessageTime(msg.created_at) }}
                      </p>
                      <span v-if="msg.from_user_id === user?.id && msg.is_read" class="text-xs text-blue-500">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>
              <div ref="messagesEndRef"></div>
            </div>

            <!-- Message Input -->
            <form @submit.prevent="sendMessage" class="p-4 border-t-2 border-amber-100 dark:border-amber-900">
              <div class="flex gap-2">
                <input
                  type="text"
                  v-model="newMessage"
                  :placeholder="t('type_your_message')"
                  class="flex-1 px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <WoodButton type="submit" :disabled="!newMessage.trim()" class="flex items-center space-x-2">
                  <Send :size="16" />
                  <span class="hidden sm:inline">{{ t('send') }}</span>
                </WoodButton>
              </div>
              <div v-if="selectedImage" class="mt-2 relative inline-block">
                <img :src="selectedImage" class="w-32 h-32 object-cover rounded-lg" />
                <button
                  @click="removeSelectedImage"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import { Search, User, Users, Send } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import { showNotification } from '../utils/notifications';
import { confirmAction } from '../utils/confirmation';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;

const user = computed(() => authStore.user);
const isDarkMode = computed(() => authStore.isDarkMode);

const conversations = ref([]);
const messages = ref([]);
const otherUser = ref(null);
const newMessage = ref('');
const selectedImage = ref(null);
const imageInput = ref(null);
const messagesContainer = ref(null);
const loadingConversations = ref(false);
const searchConversations = ref('');
const activeTab = ref('All');
const selectedConversationId = ref(null);
const showMenu = ref(false);

const unreadCount = computed(() => {
  return conversations.value.filter(c => hasUnread(c)).length;
});

const filteredConversations = computed(() => {
  let result = conversations.value;
  
  if (searchConversations.value) {
    const query = searchConversations.value.toLowerCase();
    result = result.filter(conv => 
      getConversationName(conv).toLowerCase().includes(query) ||
      (conv.last_message?.message || '').toLowerCase().includes(query)
    );
  }
  
  if (activeTab.value === 'Unread') {
    result = result.filter(c => hasUnread(c));
  }
  
  return result;
});

const getConversationName = (conv) => {
  if (conv.user) {
    return conv.user.name;
  }
  return 'Unknown User';
};

const getConversationAvatar = (conv) => {
  if (conv.user) {
    return conv.user.avatar_url;
  }
  return null;
};

const hasUnread = (conv) => {
  return conv.unread_count > 0;
};

const formatTime = (dateString, isUnread = false) => {
  if (isUnread) return 'New';
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return `${hours} hr`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const fetchConversations = async () => {
  loadingConversations.value = true;
  try {
    const response = await window.axios.get('/conversations');
    conversations.value = response.data || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
  } finally {
    loadingConversations.value = false;
  }
};

const selectConversation = (conv) => {
  selectedConversationId.value = conv.user?.id || conv.id;
  otherUser.value = conv.user;
  if (!otherUser.value || otherUser.value.id !== selectedConversationId.value) {
    fetchOtherUser(selectedConversationId.value);
  }
  fetchMessages();
};

const fetchOtherUser = async (userId) => {
  if (!userId) return;
  
  try {
    const response = await window.axios.get(`/users/${userId}/profile`);
    otherUser.value = response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    // Try admin endpoint if regular endpoint fails (for admin users)
    try {
      const adminResponse = await window.axios.get(`/admin/users/${userId}`);
      otherUser.value = adminResponse.data;
    } catch (adminError) {
      console.error('Error fetching user from admin endpoint:', adminError);
    }
  }
};

const fetchMessages = async () => {
  if (!selectedConversationId.value) return;
  
  try {
    // Fetch other user info if not already set
    if (!otherUser.value || otherUser.value.id !== selectedConversationId.value) {
      await fetchOtherUser(selectedConversationId.value);
    }
    
    const response = await window.axios.get(`/messages/${selectedConversationId.value}`);
    messages.value = response.data || [];
    
    await window.axios.post(`/chat/${selectedConversationId.value}/read`);
    
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

const messagesEndRef = ref(null);

const scrollToBottom = () => {
  if (messagesEndRef.value) {
    messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};

const viewProfile = (userId) => {
  if (userId) {
    router.push(`/profile/${userId}`);
  }
};

const triggerImageInput = () => {
  if (imageInput.value) {
    imageInput.value.click();
  }
};

const handleImageSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    showNotification(t('please_select_an_image_file'), 'warning');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    selectedImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removeSelectedImage = () => {
  selectedImage.value = null;
  if (imageInput.value) {
    imageInput.value.value = '';
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() && !selectedImage.value) return;
  if (!selectedConversationId.value) return;
  
  try {
    let imageUrl = null;
    
    if (selectedImage.value) {
      const formData = new FormData();
      const file = imageInput.value.files[0];
      formData.append('image', file);
      
      const uploadResponse = await window.axios.post('/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      imageUrl = uploadResponse.data.url;
    }
    
    await window.axios.post('/messages', {
      to_user_id: selectedConversationId.value,
      message: newMessage.value,
      image_url: imageUrl,
    });
    
    newMessage.value = '';
    removeSelectedImage();
    await fetchMessages();
    await fetchConversations();
  } catch (error) {
    console.error('Error sending message:', error);
    showNotification(error.response?.data?.message || 'Failed to send message', 'error');
  }
};

const clearChat = async () => {
  const confirmed = await confirmAction({
    action: t('clear_this_chat') || 'clear this chat',
    message: t('are_you_sure_clear_chat') || 'Are you sure you want to clear this chat?',
    destructive: true
  });
  if (!confirmed) return;
  
  try {
    // Delete all messages
    for (const msg of messages.value) {
      await window.axios.delete(`/messages/${msg.id}`);
    }
    messages.value = [];
  } catch (error) {
    console.error('Error clearing chat:', error);
  }
};

const blockUser = async () => {
  const confirmed = await confirmAction({
    action: t('block_user') || 'block this user',
    message: t('are_you_sure_block_user').replace('{name}', otherUser.value?.name || ''),
    destructive: true
  });
  if (!confirmed) return;
  
  try {
    await window.axios.post(`/admin/users/${otherUser.value?.id}/block`);
    router.push('/dashboard');
  } catch (error) {
    console.error('Error blocking user:', error);
    showNotification(error.response?.data?.message || t('failed_to_block_user'), 'error');
  }
};

const closeMenu = (event) => {
  if (!event.target.closest('.relative')) {
    showMenu.value = false;
  }
};

onMounted(async () => {
  await fetchConversations();
  document.addEventListener('click', closeMenu);
  
  if (route.params.userId) {
    selectedConversationId.value = parseInt(route.params.userId);
    await fetchOtherUser(selectedConversationId.value);
    await fetchMessages();
  }
});

onUnmounted(() => {
  document.removeEventListener('click', closeMenu);
});

watch(() => route.params.userId, async (newId) => {
  if (newId) {
    selectedConversationId.value = parseInt(newId);
    await fetchOtherUser(selectedConversationId.value);
    await fetchMessages();
  }
});
</script>
