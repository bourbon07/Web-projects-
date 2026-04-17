<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen flex flex-col">
        <h1 class="text-4xl font-bold mb-6 text-gray-900 dark:text-white">{{ user?.role === 'admin' ? t('customer_chat') : t('messages') }}</h1>

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
                  :key="conv.id || conv.user?.id || conv.order?.id"
                  @click="selectConversation(conv)"
                  :class="[
                    'w-full p-4 flex items-center space-x-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border-b border-gray-200 dark:border-gray-700',
                    selectedConversationId === (conv.user?.id || conv.id || conv.order?.id) ? 'bg-amber-50 dark:bg-amber-900/20' : ''
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

          <!-- Chat Area - Empty State -->
          <div v-if="!selectedConversationId" class="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 flex items-center justify-center">
            <div class="text-center">
              <Users class="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p class="text-gray-500 dark:text-gray-400 mb-2">{{ isGuestMode ? (t('no_messages_yet') || 'No messages yet') : t('select_user_to_chat') }}</p>
              <p v-if="isGuestMode" class="text-sm text-gray-400 dark:text-gray-500">{{ t('messages_will_appear_here') || 'Messages about your orders will appear here' }}</p>
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
                    View Profile
                  </button>
                  <button
                    @click="clearChat(); showMenu = false"
                    class="w-full text-left px-4 py-2 text-sm transition-colors text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    Clear Chat
                  </button>
                  <button
                    v-if="user?.role === 'admin'"
                    @click="blockUser(); showMenu = false"
                    class="w-full text-left px-4 py-2 text-sm rounded-b-lg text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Block User
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
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white',
                      // Add shadow for order status messages from admin
                      msg.order_id && msg.from_user_id !== user?.id && msg.sender?.role === 'admin'
                        ? (msg.order?.payment_status === 'approved' || msg.order?.status === 'processing'
                            ? 'shadow-lg shadow-green-500/50 border-2 border-green-300 dark:border-green-600'
                            : msg.order?.payment_status === 'rejected' || msg.order?.status === 'cancelled'
                            ? 'shadow-lg shadow-red-500/50 border-2 border-red-300 dark:border-red-600'
                            : '')
                        : ''
                    ]">
                      <p class="break-words whitespace-pre-line">{{ msg.message }}</p>
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
            <div v-if="isGuestMode" class="p-4 border-t-2 border-amber-100 dark:border-amber-900 bg-gray-50 dark:bg-gray-900/50">
              <div class="text-center text-gray-600 dark:text-gray-400 text-sm">
                <p class="mb-2 font-medium">{{ t('read_only_mode') || 'Read-only mode' }}</p>
                <p class="mb-3">{{ t('create_account_to_chat') || 'Create an account to send messages and chat with support' }}</p>
                <WoodButton @click="router.push('/login')" variant="outline" class="mt-2">
                  {{ t('sign_in') }} / {{ t('sign_up') }}
                </WoodButton>
              </div>
            </div>
            <form v-else @submit.prevent="sendMessage" class="p-4 border-t-2 border-amber-100 dark:border-amber-900">
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
const messagesEndRef = ref(null);
const loadingConversations = ref(false);
const searchConversations = ref('');
const activeTab = ref('All');
const selectedConversationId = ref(null);
const showMenu = ref(false);
const admins = ref([]);
const adminsLoading = ref(false);
const showEmojiPicker = ref(false);
const guestAuthenticated = ref(false);
const guestEmail = ref('');
const guestPhone = ref('');
const guestConversations = ref([]);
const isGuestMode = computed(() => !user.value && guestAuthenticated.value);

const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
  '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
  '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
  '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '🤯',
  '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁',
  '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
  '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
  '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠',
  '🤬', '😈', '👿', '💀', '☠️', '💋', '💌', '💘',
  '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️',
  '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤',
  '🤍', '🤎', '💯', '👍', '👎', '👌', '✌️', '🤞',
  '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️',
  '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲',
  '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶',
  '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️',
  '👅', '👄', '💋', '🩸', '❤️‍🔥', '❤️‍🩹', '💔', '❣️'
];

const unreadCount = computed(() => {
  return conversations.value.filter(c => hasUnread(c)).length;
});

const filterTabs = computed(() => {
  if (user.value?.role === 'admin') {
    return ['All', 'Customers'];
  } else if (user.value?.role === 'customer') {
    return ['All', 'Admins'];
  }
  return ['All'];
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
  
  if (activeTab.value === 'All') {
    // Show all conversations
    return result;
  } else if (activeTab.value === 'Customers') {
    result = result.filter(conv => conv.user?.role === 'customer');
  } else if (activeTab.value === 'Admins') {
    result = result.filter(conv => conv.user?.role === 'admin');
  }
  
  return result;
});

const getConversationName = (conv) => {
  if (isGuestMode.value) {
    return conv.order ? `Order #${conv.order.id}` : 'Order';
  }
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
    if (isGuestMode.value) {
      // Fetch guest conversations
      const response = await window.axios.post('/guest/conversations', {
        email: guestEmail.value,
        phone: guestPhone.value
      });
      guestConversations.value = response.data || [];
      conversations.value = guestConversations.value.map(conv => ({
        ...conv,
        user: { id: 'admin', name: 'Admin', role: 'admin' },
        last_message: conv.last_message
      }));
    } else {
      const response = await window.axios.get('/conversations');
      conversations.value = response.data || [];
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    conversations.value = [];
    if (isGuestMode.value) {
      showNotification(error.response?.data?.message || t('failed_to_fetch_messages') || 'Failed to fetch messages', 'error');
    }
  } finally {
    loadingConversations.value = false;
  }
};

const authenticateGuest = async () => {
  try {
    // Verify guest credentials by fetching conversations
    const response = await window.axios.post('/guest/conversations', {
      email: guestEmail.value,
      phone: guestPhone.value
    });
    
    // Save to localStorage for auto-loading next time
    localStorage.setItem('guest_email', guestEmail.value);
    localStorage.setItem('guest_phone', guestPhone.value);
    
    guestAuthenticated.value = true;
    await fetchConversations();
    
    // Auto-select first conversation if available
    if (conversations.value.length > 0) {
      selectConversation(conversations.value[0]);
    } else {
      // No messages yet, but still show the chat interface
      guestAuthenticated.value = true;
    }
  } catch (error) {
    console.error('Error authenticating guest:', error);
    showNotification(error.response?.data?.message || t('failed_to_authenticate') || 'Failed to authenticate. Please check your email and phone number.', 'error');
  }
};

const fetchAdmins = async () => {
  if (user.value?.role === 'admin') return;
  adminsLoading.value = true;
  try {
    const response = await window.axios.get('/admins');
    admins.value = response.data || [];
  } catch (error) {
    console.error('Error fetching admins:', error);
  } finally {
    adminsLoading.value = false;
  }
};

const setupRealtime = () => {
  if (!user.value || !window.Echo) return;

  window.Echo.private(`chat.${user.value.id}`)
    .listen('.message.sent', (data) => {
      // If the message is between current users, add it
      if (selectedConversationId.value && data.from_user_id === selectedConversationId.value) {
        if (!messages.value.find(m => m.id === data.id)) {
          messages.value.push({
            id: data.id,
            from_user_id: data.from_user_id,
            to_user_id: data.to_user_id,
            message: data.message,
            created_at: data.created_at,
            is_read: false
          });
          // Mark as read
          window.axios.post(`/chat/${selectedConversationId.value}/read`);
        }
      }
      
      // Refresh conversations list to update last message and unread count
      fetchConversations();
    })
    .listen('.chat.cleared', (data) => {
      if (selectedConversationId.value && (data.from_user_id === selectedConversationId.value || data.to_user_id === selectedConversationId.value)) {
        messages.value = [];
        showNotification(t('chat_cleared') || 'Chat was cleared', 'info');
      }
      fetchConversations();
    });
};

const selectConversation = (conv) => {
  if (isGuestMode.value) {
    selectedConversationId.value = conv.order?.id;
    otherUser.value = { id: 'admin', name: 'Admin', role: 'admin' };
  } else {
    selectedConversationId.value = conv.user?.id || conv.id;
    otherUser.value = conv.user;
  }
  fetchMessages();
};

const selectAdmin = (adminId) => {
  selectedConversationId.value = adminId;
  otherUser.value = admins.value.find(a => a.id === adminId);
  fetchMessages();
};

const fetchOtherUser = async (userId) => {
  if (!userId) return;
  
  try {
    const response = await window.axios.get(`/users/${userId}/profile`);
    otherUser.value = response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
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
    if (isGuestMode.value) {
      // Fetch guest messages by order
      const response = await window.axios.post('/guest/messages', {
        email: guestEmail.value,
        phone: guestPhone.value
      });
      
      // Filter messages for selected order
      const selectedOrder = guestConversations.value.find(conv => conv.order?.id === selectedConversationId.value);
      if (selectedOrder) {
        const filteredMessages = response.data.filter(msg => msg.order_id === selectedConversationId.value) || [];
        messages.value = filteredMessages.map(msg => ({
          id: msg.id,
          from_user_id: msg.from_user_id,
          to_user_id: msg.to_user_id,
          message: msg.message,
          image_url: msg.image_url,
          created_at: msg.created_at,
          is_read: msg.is_read || false,
          order_id: msg.order_id,
          order: msg.order || selectedOrder.order || null,
          sender: msg.sender || null,
          receiver: msg.receiver || null,
        }));
        otherUser.value = { id: 'admin', name: 'Admin', role: 'admin' };
      }
    } else {
      if (!otherUser.value || otherUser.value.id !== selectedConversationId.value) {
        await fetchOtherUser(selectedConversationId.value);
      }
      
      const response = await window.axios.get(`/messages/${selectedConversationId.value}`);
      const messagesData = response.data || [];
      messages.value = messagesData.map(msg => ({
        id: msg.id,
        from_user_id: msg.from_user_id,
        to_user_id: msg.to_user_id,
        message: msg.message,
        image_url: msg.image_url,
        created_at: msg.created_at,
        is_read: msg.is_read || false,
        order_id: msg.order_id,
        order: msg.order || null,
        sender: msg.sender || null,
        receiver: msg.receiver || null,
      }));
      
      await window.axios.post(`/chat/${selectedConversationId.value}/read`);
    }
    
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

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
    showNotification(t('please_select_image_file'), 'warning');
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
  
  // Guests cannot send messages - show login prompt
  if (isGuestMode.value) {
    const confirmed = await confirmAction({
      message: t('please_login_to_chat') || 'Please login to send messages. Would you like to login now?',
      destructive: false
    });
    if (confirmed) {
      router.push({ name: 'login', query: { redirect: '/chat' } });
    }
    return;
  }
  
  const msgText = newMessage.value;
  const tempId = Date.now();

  // Optimistically add message
  if (!selectedImage.value) {
    messages.value.push({
      id: tempId,
      from_user_id: user.value.id,
      to_user_id: selectedConversationId.value,
      message: msgText,
      created_at: new Date().toISOString(),
      is_read: false,
      isTemp: true
    });
  }

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
    
    newMessage.value = '';
    const response = await window.axios.post('/messages', {
      to_user_id: selectedConversationId.value,
      message: msgText,
      image_url: imageUrl,
    });
    
    if (!selectedImage.value) {
      // Replace temp message
      const index = messages.value.findIndex(m => m.id === tempId);
      if (index !== -1) {
        messages.value[index].id = response.data.id;
        messages.value[index].created_at = response.data.created_at;
        delete messages.value[index].isTemp;
      }
    } else {
      await fetchMessages();
    }
    
    removeSelectedImage();
    await fetchConversations();
  } catch (error) {
    console.error('Error sending message:', error);
    showNotification(error.response?.data?.message || t('failed_to_send_message'), 'error');
    if (!selectedImage.value) {
      messages.value = messages.value.filter(m => m.id !== tempId);
      newMessage.value = msgText;
    }
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
    await window.axios.delete(`/messages/clear/${selectedConversationId.value}`);
    messages.value = [];
    fetchConversations();
  } catch (error) {
    console.error('Error clearing chat:', error);
    showNotification(error.response?.data?.message || t('failed_to_clear_chat'), 'error');
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

const insertEmoji = (emoji) => {
  newMessage.value += emoji;
  showEmojiPicker.value = false;
};

const insertQuickReply = (text) => {
  const quickReplies = {
    'Order Status': 'Can you please provide me with the status of my order?',
    'Refund Policy': 'What is your refund policy?',
    'Greeting': 'Hello! How can I help you today?',
    'Thank You': 'Thank you for your assistance!'
  };
  newMessage.value = quickReplies[text] || text;
};

const closeMenu = (event) => {
  if (!event.target.closest('.relative')) {
    showMenu.value = false;
    showEmojiPicker.value = false;
  }
};

onMounted(async () => {
  if (user.value) {
    await fetchConversations();
    await fetchAdmins();
    setupRealtime();
  } else {
// ... existing guest logic (truncated for brevity in chunk but will be handled by tool)
    // For guests, try to auto-load messages from localStorage
    const savedGuestEmail = localStorage.getItem('guest_email');
    const savedGuestPhone = localStorage.getItem('guest_phone');
    
    if (savedGuestEmail && savedGuestPhone) {
      guestEmail.value = savedGuestEmail;
      guestPhone.value = savedGuestPhone;
      guestAuthenticated.value = true;
      await fetchConversations();
      
      // Auto-select first conversation if available
      if (conversations.value.length > 0) {
        selectConversation(conversations.value[0]);
      }
    } else {
      // Try to get email/phone from recent orders in localStorage
      try {
        const recentOrders = JSON.parse(localStorage.getItem('recent_guest_orders') || '[]');
        if (recentOrders.length > 0) {
          const latestOrder = recentOrders[recentOrders.length - 1];
          if (latestOrder.customer_email && latestOrder.customer_phone) {
            guestEmail.value = latestOrder.customer_email;
            guestPhone.value = latestOrder.customer_phone;
            localStorage.setItem('guest_email', latestOrder.customer_email);
            localStorage.setItem('guest_phone', latestOrder.customer_phone);
            guestAuthenticated.value = true;
            await fetchConversations();
            
            // Auto-select first conversation if available
            if (conversations.value.length > 0) {
              selectConversation(conversations.value[0]);
            }
          }
        }
      } catch (e) {
        console.error('Error loading guest orders:', e);
      }
    }
  }
  
  document.addEventListener('click', closeMenu);
  
  // Check for userId in route params or query params
  const userId = route.params.userId || route.query.userId;
  if (userId) {
    selectedConversationId.value = parseInt(userId);
    await fetchOtherUser(selectedConversationId.value);
    await fetchMessages();
    
    // Clear query parameter after selecting to keep URL clean
    if (route.query.userId) {
      router.replace({ path: '/chat', query: {} });
    }
  }
});

onUnmounted(() => {
  if (user.value && window.Echo) {
    window.Echo.leave(`chat.${user.value.id}`);
  }
  document.removeEventListener('click', closeMenu);
});

watch(() => route.params.userId || route.query.userId, async (newId) => {
  if (newId) {
    selectedConversationId.value = parseInt(newId);
    await fetchOtherUser(selectedConversationId.value);
    await fetchMessages();
    
    // Clear query parameter after selecting to keep URL clean
    if (route.query.userId) {
      router.replace({ path: '/chat', query: {} });
    }
  }
});

watch(filterTabs, (newTabs) => {
  // Ensure activeTab is valid when tabs change
  if (!newTabs.includes(activeTab.value)) {
    activeTab.value = 'All';
  }
});
</script>
