import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([]);
  let notificationId = 0;

  const addNotification = (message, type = 'success', duration = null) => {
    const id = ++notificationId;
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning'
      visible: true,
    };

    notifications.value.push(notification);

    // Auto-remove after duration if specified (default: null means manual dismiss only)
    if (duration !== null) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value[index].visible = false;
      // Remove from array after animation
      setTimeout(() => {
        notifications.value = notifications.value.filter(n => n.id !== id);
      }, 300);
    }
  };

  const success = (message) => {
    return addNotification(message, 'success', 6000); // Auto-dismiss after 6 seconds
  };

  const error = (message) => {
    return addNotification(message, 'error', 6000); // Auto-dismiss after 6 seconds
  };

  const warning = (message) => {
    return addNotification(message, 'warning', 6000); // Auto-dismiss after 6 seconds
  };

  const clearAll = () => {
    notifications.value.forEach(n => {
      n.visible = false;
    });
    setTimeout(() => {
      notifications.value = [];
    }, 300);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    clearAll,
  };
});

