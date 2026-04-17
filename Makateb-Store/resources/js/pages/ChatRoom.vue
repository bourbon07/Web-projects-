<template>
  <AppLayout>
    <div v-if="!user" class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 p-8 max-w-md w-full text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-amber-800 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Join the Conversation</h2>
        <p class="mb-6 text-gray-600 dark:text-gray-400">Please login to access the WoodCraft community chat room</p>
        <WoodButton @click="$router.push('/')" class="w-full">
          Sign In
        </WoodButton>
      </div>
    </div>
    <div v-else class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen flex flex-col">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white">Community Chat Room</h1>
        </div>

        <!-- Main Chat Container -->
        <div class="flex-1 flex gap-4 overflow-hidden">
          <!-- Chat Messages Area -->
          <div class="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 flex flex-col overflow-hidden">
            <!-- Chat Header -->
            <div class="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="relative">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span class="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-amber-800"></span>
                  </div>
                  <div>
                    <h2 class="font-bold">WoodCraft Community</h2>
                    <p class="text-sm text-amber-200">
                      {{ onlineUsersCount }} members online
                    </p>
                  </div>
                </div>
                <button
                  @click="showUserList = !showUserList"
                  class="lg:hidden p-2 hover:bg-amber-700 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
              <div
                v-for="msg in messages"
                :key="msg.id"
                :class="['flex', msg.userId === user?.id ? 'justify-end' : 'justify-start']"
              >
                <div :class="[
                  'flex items-start space-x-2 max-w-[70%]',
                  msg.userId === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                ]">
                  <!-- Avatar -->
                  <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-amber-200 to-amber-400 dark:from-amber-800 dark:to-amber-600">
                    <img v-if="msg.userAvatar" :src="msg.userAvatar" :alt="msg.userName" class="w-full h-full rounded-full object-cover" />
                    <svg v-else class="w-5 h-5 text-amber-900 dark:text-amber-100" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  
                  <!-- Message Bubble -->
                  <div>
                    <div :class="[
                      'rounded-lg p-3',
                      msg.userId === user?.id
                        ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    ]">
                      <p v-if="msg.userId !== user?.id" class="text-sm font-medium mb-1 text-amber-800 dark:text-amber-400">
                        {{ msg.userName }}
                      </p>
                      <p>{{ msg.message }}</p>
                    </div>
                    <div :class="[
                      'flex items-center gap-2 mt-1 px-1',
                      msg.userId === user?.id ? 'justify-end' : 'justify-start'
                    ]">
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatMessageTime(msg.timestamp) }}
                      </p>
                      <span v-if="msg.userId === user?.id && msg.isRead" class="text-xs text-blue-500">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Typing Indicator -->
              <div v-if="isTyping.length > 0" class="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
                <p class="text-sm italic">
                  {{ isTyping.length === 1 ? `${isTyping[0]} is typing...` : 'Multiple people are typing...' }}
                </p>
              </div>

              <div ref="messagesEndRef"></div>
            </div>

            <!-- Message Input -->
            <form @submit.prevent="handleSendMessage" class="p-4 border-t-2 border-amber-100 dark:border-amber-900">
              <div class="flex gap-2">
                <button
                  type="button"
                  class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                  title="Attach file"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                  title="Add image"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <input
                  ref="inputRef"
                  type="text"
                  v-model="message"
                  @input="handleTyping"
                  placeholder="Type your message..."
                  class="flex-1 px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                  title="Add emoji"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <WoodButton 
                  type="submit" 
                  :disabled="!message.trim()"
                  class="flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span class="hidden sm:inline">Send</span>
                </WoodButton>
              </div>
            </form>
          </div>

          <!-- Online Users Sidebar -->
          <div :class="[
            showUserList ? 'block absolute right-4 top-24 bottom-4 z-10 w-72' : 'hidden lg:block',
            'lg:relative lg:w-72 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-amber-100 dark:border-amber-900/30 overflow-hidden'
          ]">
            <div class="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-4">
              <h3 class="font-bold flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Members ({{ onlineUsers.length }})</span>
              </h3>
            </div>
            
            <div class="p-4">
              <!-- Search -->
              <div class="mb-4 relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search members..."
                  class="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <!-- Online Users -->
              <div class="space-y-2">
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Online - {{ onlineUsersCount }}
                </h4>
                <div
                  v-for="chatUser in onlineUsers.filter(u => u.isOnline)"
                  :key="chatUser.id"
                  class="flex items-center space-x-3 p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer transition-colors"
                >
                  <div class="relative">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 dark:from-amber-800 dark:to-amber-600 flex items-center justify-center">
                      <img v-if="chatUser.avatar" :src="chatUser.avatar" :alt="chatUser.name" class="w-full h-full rounded-full object-cover" />
                      <svg v-else class="w-5 h-5 text-amber-900 dark:text-amber-100" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white truncate">
                      {{ chatUser.name }}
                    </p>
                    <p class="text-xs text-green-600 dark:text-green-400">Online</p>
                  </div>
                </div>
              </div>

              <!-- Offline Users -->
              <div v-if="offlineUsers.length > 0" class="space-y-2 mt-4">
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Offline - {{ offlineUsers.length }}
                </h4>
                <div
                  v-for="chatUser in offlineUsers"
                  :key="chatUser.id"
                  class="flex items-center space-x-3 p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer transition-colors"
                >
                  <div class="relative">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center opacity-60">
                      <img v-if="chatUser.avatar" :src="chatUser.avatar" :alt="chatUser.name" class="w-full h-full rounded-full object-cover" />
                      <svg v-else class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <span class="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white dark:border-gray-800"></span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-600 dark:text-gray-400 truncate">
                      {{ chatUser.name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-500">{{ chatUser.lastSeen }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import { ChevronLeft } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const message = ref('');
const messages = ref([]);
const isTyping = ref([]);
const onlineUsers = ref([]);
const showUserList = ref(false);
const messagesEndRef = ref(null);
const messagesContainer = ref(null);
const inputRef = ref(null);

const onlineUsersCount = computed(() => onlineUsers.value.filter(u => u.isOnline).length);
const offlineUsers = computed(() => onlineUsers.value.filter(u => !u.isOnline));

// Mock online users - in production, this would come from WebSocket/API
onMounted(() => {
  onlineUsers.value = [
    { id: '1', name: 'Emma Wilson', isOnline: true },
    { id: '2', name: 'James Brown', isOnline: true },
    { id: '3', name: 'Sarah Davis', isOnline: false, lastSeen: '5m ago' },
    { id: '4', name: 'Michael Chen', isOnline: true },
    { id: '5', name: 'Lisa Anderson', isOnline: false, lastSeen: '1h ago' },
  ];

  // Mock initial messages - in production, load from API
  messages.value = [
    {
      id: '1',
      userId: '1',
      userName: 'Emma Wilson',
      message: 'Hey everyone! Has anyone tried the new oak dining table?',
      timestamp: new Date(Date.now() - 1800000),
      isRead: true,
      type: 'text',
    },
    {
      id: '2',
      userId: '2',
      userName: 'James Brown',
      message: 'Yes! I ordered it last week. The quality is amazing!',
      timestamp: new Date(Date.now() - 1500000),
      isRead: true,
      type: 'text',
    },
    {
      id: '3',
      userId: '4',
      userName: 'Michael Chen',
      message: 'I\'m looking at the walnut bookshelf. Anyone have experience with it?',
      timestamp: new Date(Date.now() - 900000),
      isRead: true,
      type: 'text',
    },
    {
      id: '4',
      userId: '1',
      userName: 'Emma Wilson',
      message: 'The walnut collection is beautiful! Very sturdy too.',
      timestamp: new Date(Date.now() - 300000),
      isRead: true,
      type: 'text',
    },
  ];
  
  nextTick(() => scrollToBottom());
});

const scrollToBottom = () => {
  if (messagesEndRef.value) {
    messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};

watch(messages, () => {
  nextTick(() => scrollToBottom());
}, { deep: true });

const handleTyping = () => {
  // In real implementation, emit typing event via WebSocket
};

const handleSendMessage = () => {
  if (!message.value.trim() || !user.value) return;

  const newMessage = {
    id: `msg-${Date.now()}`,
    userId: user.value.id,
    userName: `${user.value.firstName || user.value.first_name} ${user.value.lastName || user.value.last_name}`,
    userAvatar: user.value.profileImage || user.value.avatar_url,
    message: message.value.trim(),
    timestamp: new Date(),
    isRead: false,
    type: 'text',
  };

  messages.value.push(newMessage);
  message.value = '';
  
  // In real implementation, send via WebSocket/API
  // socket.emit('send_message', newMessage);
};

const formatMessageTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
</script>

