import { useNotificationStore } from '../stores/notification';

export function useToast() {
  const notificationStore = useNotificationStore();

  return {
    toast: {
      success: (message, options) => {
        notificationStore.success(message);
      },
      error: (message, options) => {
        notificationStore.error(message);
      },
      warning: (message, options) => {
        notificationStore.warning(message);
      },
      info: (message, options) => {
        notificationStore.success(message); // Treat info as success
      },
    }
  };
}



