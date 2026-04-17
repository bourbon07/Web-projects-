<template>
  <Teleport to="body">
    <div
      :class="[
        'fixed z-[9999] flex flex-col gap-3 p-4',
        isRTL ? 'top-4 right-4' : 'top-4 left-4',
        'w-auto max-w-sm sm:max-w-md'
      ]"
      :dir="isRTL ? 'rtl' : 'ltr'"
    >
      <TransitionGroup
        name="notification"
        tag="div"
        class="flex flex-col gap-3"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'notification-item',
            'rounded-lg shadow-lg p-4',
            'backdrop-blur-sm',
            'border',
            'transition-all duration-300',
            notification.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
            getNotificationClasses(notification.type)
          ]"
        >
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div class="flex-shrink-0 mt-0.5">
              <component
                :is="getIcon(notification.type)"
                :class="[
                  'w-5 h-5',
                  getIconClasses(notification.type)
                ]"
              />
            </div>

            <!-- Message -->
            <div class="flex-1 min-w-0">
              <p
                :class="[
                  'text-sm font-medium flex items-center gap-2',
                  getTextClasses(notification.type)
                ]"
              >
                <span>{{ getEmoji(notification.type) }}</span>
                <span 
                  @click="navigateToDashboard"
                  class="cursor-pointer hover:underline"
                >{{ notification.message }}</span>
              </p>
            </div>

            <!-- Close/OK Button -->
            <button
              @click.stop="dismiss(notification.id)"
              :class="[
                'flex-shrink-0',
                'px-3 py-1.5',
                'rounded-md',
                'text-xs font-medium',
                'transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                getButtonClasses(notification.type)
              ]"
            >
              {{ t('ok') || 'OK' }}
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notification';
import { useLanguageStore } from '../stores/language';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid';

const router = useRouter();
const notificationStore = useNotificationStore();
const languageStore = useLanguageStore();

const notifications = computed(() => notificationStore.notifications);
const isRTL = computed(() => languageStore.isRTL);
const t = languageStore.t;

const navigateToDashboard = () => {
  router.push('/dashboard');
};

const dismiss = (id) => {
  notificationStore.removeNotification(id);
};

const getNotificationClasses = (type) => {
  const baseClasses = 'bg-white dark:bg-gray-800';
  
  switch (type) {
    case 'success':
      return `${baseClasses} border-green-200 dark:border-green-800`;
    case 'error':
      return `${baseClasses} border-red-200 dark:border-red-800`;
    case 'warning':
      return `${baseClasses} border-yellow-200 dark:border-yellow-800`;
    default:
      return `${baseClasses} border-gray-200 dark:border-gray-700`;
  }
};

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return CheckCircleIcon;
    case 'error':
      return XCircleIcon;
    case 'warning':
      return ExclamationTriangleIcon;
    default:
      return CheckCircleIcon;
  }
};

const getIconClasses = (type) => {
  switch (type) {
    case 'success':
      return 'text-green-500';
    case 'error':
      return 'text-red-500';
    case 'warning':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
};

const getTextClasses = (type) => {
  switch (type) {
    case 'success':
      return 'text-green-800 dark:text-green-200';
    case 'error':
      return 'text-red-800 dark:text-red-200';
    case 'warning':
      return 'text-yellow-800 dark:text-yellow-200';
    default:
      return 'text-gray-800 dark:text-gray-200';
  }
};

const getButtonClasses = (type) => {
  const baseClasses = 'focus:ring-offset-white dark:focus:ring-offset-gray-800';
  
  switch (type) {
    case 'success':
      return `bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 ${baseClasses}`;
    case 'error':
      return `bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 ${baseClasses}`;
    case 'warning':
      return `bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 ${baseClasses}`;
    default:
      return `bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 ${baseClasses}`;
  }
};

const getEmoji = (type) => {
  // All emojis removed as requested
  return '';
};
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.notification-move {
  transition: transform 0.3s ease;
}

.notification-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* RTL Support */
[dir="rtl"] .notification-item {
  direction: rtl;
}

[dir="ltr"] .notification-item {
  direction: ltr;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .fixed {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .notification-item {
    padding: 0.75rem;
  }
}
</style>

