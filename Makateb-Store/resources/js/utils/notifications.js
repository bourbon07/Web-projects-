import { useNotificationStore } from '../stores/notification';

/**
 * Helper function to show notifications instead of browser alerts
 * @param {string} message - The message to display
 * @param {'success'|'error'|'warning'} type - The notification type
 */
export function showNotification(message, type = 'success') {
  const notificationStore = useNotificationStore();
  
  switch (type) {
    case 'success':
      notificationStore.success(message);
      break;
    case 'error':
      notificationStore.error(message);
      break;
    case 'warning':
      notificationStore.warning(message);
      break;
    default:
      notificationStore.success(message);
  }
}

/**
 * Replace alert() calls with notifications
 * This function can be used as a drop-in replacement for alert()
 */
export function notify(message, type = 'success') {
  showNotification(message, type);
}

