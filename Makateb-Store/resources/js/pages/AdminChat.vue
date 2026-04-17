<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen flex flex-col">
        <h1 class="text-4xl font-bold mb-6 text-gray-900 dark:text-white">{{ t('customer_chat') }}</h1>

        <!-- Chat Container -->
        <div class="flex-1 flex gap-4 overflow-hidden">
          <!-- Users List -->
          <div class="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 flex flex-col overflow-hidden">
            <!-- Search -->
            <div class="p-4 border-b-2 border-amber-100 dark:border-amber-900">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  :placeholder="t('search_users')"
                  v-model="searchQuery"
                  class="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
C:\Users\Metafortech\Desktop\code\Backend\Makateb Project\resources\js\pages\AdminChat.vue
            <!-- Users -->
            <div class="flex-1 overflow-y-auto">
              <button
                v-for="chatUser in filteredUsers"
                :key="chatUser.id"
                @click="selectUser(chatUser)"
                :class="[
                  'w-full p-4 flex items-center space-x-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border-b border-gray-200 dark:border-gray-700',
                  selectedUser?.id === chatUser.id ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                ]"
              >
                <div class="relative">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 dark:from-amber-800 dark:to-amber-600 flex items-center justify-center">
                    <img v-if="chatUser.avatar" :src="chatUser.avatar" :alt="chatUser.name" class="w-full h-full rounded-full object-cover" />
                    <User v-else :size="24" class="text-amber-900 dark:text-amber-100" />
                  </div>
                  <span :class="[
                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
                    chatUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  ]"></span>
                </div>
                <div class="flex-1 text-left min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <p class="font-medium text-gray-900 dark:text-white truncate">{{ chatUser.name }}</p>
                    <span v-if="chatUser.unreadCount && chatUser.unreadCount > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {{ chatUser.unreadCount }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ chatUser.lastMessage }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ chatUser.lastMessageTime }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Chat Area -->
          <div v-if="selectedUser" class="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 flex flex-col overflow-hidden">
            <!-- Chat Header -->
            <div class="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-4 flex items-center space-x-3">
              <div class="relative">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center">
                  <img v-if="selectedUser.avatar" :src="selectedUser.avatar" :alt="selectedUser.name" class="w-full h-full rounded-full object-cover" />
                  <User v-else :size="20" class="text-amber-900" />
                </div>
                <span :class="[
                  'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-amber-800',
                  selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                ]"></span>
              </div>
              <div class="flex-1">
                <h2 class="font-bold">{{ selectedUser.name }}</h2>
                <p class="text-sm text-amber-200">{{ selectedUser.email }}</p>
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
                    @click="viewProfile(selectedUser?.id); showMenu = false"
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
                :class="['flex', msg.senderId === user?.id ? 'justify-end' : 'justify-start']"
              >
                <div :class="[
                  'flex items-start space-x-2 max-w-[70%]',
                  msg.senderId === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                ]">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-amber-200 to-amber-400 dark:from-amber-800 dark:to-amber-600">
                    <User :size="20" class="text-amber-900 dark:text-amber-100" />
                  </div>
                  <div>
                    <div :class="[
                      'rounded-lg p-3',
                      msg.senderId === user?.id
                        ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    ]">
                      <p>{{ msg.message }}</p>
                    </div>
                    <div :class="[
                      'flex items-center gap-2 mt-1 px-1',
                      msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                    ]">
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatTime(msg.timestamp) }}
                      </p>
                      <span v-if="msg.senderId === user?.id && msg.isRead" class="text-xs text-blue-500">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>
              <div ref="messagesEndRef"></div>
            </div>

            <!-- Message Input -->
            <form @submit.prevent="handleSendMessage" class="p-4 border-t-2 border-amber-100 dark:border-amber-900">
              <div class="flex gap-2">
                <input
                  type="text"
                  v-model="message"
                  :placeholder="t('type_message')"
                  class="flex-1 px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <WoodButton type="submit" :disabled="!message.trim()" class="flex items-center space-x-2">
                  <Send :size="16" />
                  <span class="hidden sm:inline">{{ t('send') }}</span>
                </WoodButton>
              </div>
            </form>
          </div>
          <div v-else class="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 flex items-center justify-center">
            <div class="text-center">
              <Users :size="64" class="mx-auto mb-4 text-gray-400" />
              <p class="text-gray-500 dark:text-gray-400">{{ t('select_user_to_chat') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import { ChevronLeft, Send, User, Search, Users } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import { showNotification } from '../utils/notifications';
import { confirmAction } from '../utils/confirmation';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const user = computed(() => authStore.user);

const selectedUser = ref(null);
const message = ref('');
const messages = ref([]);
const searchQuery = ref('');
const messagesEndRef = ref(null);
const messagesContainer = ref(null);
const showMenu = ref(false);

const chatUsers = ref([]);

const filteredUsers = computed(() => {
  if (!searchQuery.value) return chatUsers.value;
  return chatUsers.value.filter(u =>
    u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const loadChatUsers = async () => {
  try {
    const response = await window.axios.get('/admin/users');
    const usersData = response.data.data || response.data;
    chatUsers.value = usersData
      .filter(u => u.id !== user.value?.id && !u.is_blocked)
      .map(u => ({
        id: u.id,
        name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim(),
        email: u.email,
        avatar: u.avatar_url,
        isOnline: false,
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0,
      }));
    
    // Load conversations for each user
    for (const chatUser of chatUsers.value) {
      try {
        const convResponse = await window.axios.get(`/messages/${chatUser.id}`);
        const convMessages = convResponse.data || [];
        if (convMessages.length > 0) {
          const lastMsg = convMessages[convMessages.length - 1];
          chatUser.lastMessage = lastMsg.message || '';
          chatUser.lastMessageTime = formatRelativeTime(new Date(lastMsg.created_at || lastMsg.timestamp));
          chatUser.unreadCount = convMessages.filter(m => 
            m.to_user_id === user.value?.id && !m.is_read
          ).length;
        }
      } catch (error) {
        // No messages yet
      }
    }
    
    if (route.params.userId && chatUsers.value.length > 0) {
      const targetUser = chatUsers.value.find(u => u.id.toString() === route.params.userId.toString());
      if (targetUser) {
        selectUser(targetUser);
      } else if (chatUsers.value.length > 0 && !selectedUser.value) {
        selectUser(chatUsers.value[0]);
      }
    } else if (chatUsers.value.length > 0 && !selectedUser.value) {
      selectUser(chatUsers.value[0]);
    }
  } catch (error) {
    console.error('Error loading chat users:', error);
  }
};

const setupRealtime = () => {
  if (!user.value || !window.Echo) return;

  window.Echo.private(`chat.${user.value.id}`)
    .listen('.message.sent', (data) => {
      // If the message is from the currently selected user, add it to messages
      if (selectedUser.value && data.from_user_id === selectedUser.value.id) {
        // Check if message already exists (to avoid duplicates if we sent it)
        if (!messages.value.find(m => m.id === data.id)) {
          messages.value.push({
            id: data.id,
            senderId: data.from_user_id,
            receiverId: data.to_user_id,
            message: data.message,
            timestamp: new Date(data.created_at),
            isRead: false
          });
          // Mark as read immediately since we are viewing it
          window.axios.post(`/chat/${selectedUser.value.id}/read`);
        }
      }
      
      // Refresh chat users list to update last message and unread count
      loadChatUsers();
    })
    .listen('.chat.cleared', (data) => {
      if (selectedUser.value && (data.from_user_id === selectedUser.value.id || data.to_user_id === selectedUser.value.id)) {
        messages.value = [];
        showNotification(t('chat_cleared') || 'Chat was cleared', 'info');
      }
      loadChatUsers();
    });
};

const selectUser = async (chatUser) => {
  selectedUser.value = chatUser;
  await loadMessages(chatUser);
};

const loadMessages = async (chatUser) => {
  try {
    const response = await window.axios.get(`/messages/${chatUser.id}`);
    const messagesData = response.data || [];
    messages.value = messagesData.map(msg => ({
      id: msg.id,
      senderId: msg.from_user_id,
      receiverId: msg.to_user_id,
      message: msg.message,
      timestamp: new Date(msg.created_at || msg.timestamp),
      isRead: msg.is_read || false,
    }));
    nextTick(() => scrollToBottom());
  } catch (error) {
    console.error('Error loading messages:', error);
    messages.value = [];
  }
};

const scrollToBottom = () => {
  if (messagesEndRef.value) {
    messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};

watch(messages, () => {
  nextTick(() => scrollToBottom());
}, { deep: true });

const handleSendMessage = async () => {
  if (!message.value.trim() || !selectedUser.value || !user.value) return;

  const msgText = message.value.trim();
  const tempId = Date.now();
  
  // Optimistically add message
  const newMsg = {
    id: tempId,
    senderId: user.value.id,
    receiverId: selectedUser.value.id,
    message: msgText,
    timestamp: new Date(),
    isRead: false,
    isTemp: true
  };
  messages.value.push(newMsg);
  message.value = '';

  try {
    const response = await window.axios.post('/messages', {
      to_user_id: selectedUser.value.id,
      message: msgText,
    });
    
    // Replace temp message with real one from server
    const index = messages.value.findIndex(m => m.id === tempId);
    if (index !== -1) {
      messages.value[index].id = response.data.id;
      messages.value[index].timestamp = new Date(response.data.created_at);
      delete messages.value[index].isTemp;
    }
    
    // Update last message in chat list
    const userIndex = chatUsers.value.findIndex(u => u.id === selectedUser.value.id);
    if (userIndex !== -1) {
      chatUsers.value[userIndex].lastMessage = msgText;
      chatUsers.value[userIndex].lastMessageTime = 'Just now';
    }
  } catch (error) {
    console.error('Error sending message:', error);
    showNotification(error.response?.data?.message || 'Failed to send message', 'error');
    // Remove the failed message
    messages.value = messages.value.filter(m => m.id !== tempId);
    message.value = msgText; // restore text
  }
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const viewProfile = (userId) => {
  if (userId) {
    router.push(`/admin/user/${userId}/profile`);
  }
};

const clearChat = async () => {
  const confirmed = await confirmAction({
    action: t('clear_this_chat') || 'clear this chat',
    message: t('are_you_sure_clear_chat'),
    destructive: true
  });
  if (!confirmed) return;
  
  try {
    await window.axios.delete(`/messages/clear/${selectedUser.value.id}`);
    messages.value = [];
    loadChatUsers();
  } catch (error) {
    console.error('Error clearing chat:', error);
    showNotification(error.response?.data?.message || t('failed_to_clear_chat'), 'error');
  }
};

const blockUser = async () => {
  const confirmed = await confirmAction({
    action: t('block_user') || 'block this user',
    message: t('are_you_sure_block_user').replace('{name}', selectedUser.value?.name || ''),
    destructive: true
  });
  if (!confirmed) return;
  
  try {
    await window.axios.post(`/admin/users/${selectedUser.value?.id}/block`);
    showNotification(t('user_blocked_successfully'), 'success');
    await loadChatUsers();
    selectedUser.value = null;
    messages.value = [];
  } catch (error) {
    console.error('Error blocking user:', error);
    showNotification(error.response?.data?.message || t('failed_to_block_user'), 'error');
  }
};

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (showMenu.value && !event.target.closest('.relative')) {
    showMenu.value = false;
  }
};

onMounted(() => {
  loadChatUsers();
  setupRealtime();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  if (user.value && window.Echo) {
    window.Echo.leave(`chat.${user.value.id}`);
  }
  document.removeEventListener('click', handleClickOutside);
});
</script>

