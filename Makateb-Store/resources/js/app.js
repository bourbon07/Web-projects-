import './bootstrap';
import '../css/app.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

try {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  app.use(router);
  
  // Global error handler
  app.config.errorHandler = (err, instance, info) => {
    console.error('Global Vue error:', err, info);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      component: instance?.$options?.name || 'Unknown',
      info
    });
  };
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      app.mount('#app');
      console.log('Vue app mounted');
    });
  } else {
    app.mount('#app');
    console.log('Vue app mounted');
  }
} catch (error) {
  console.error('Error mounting Vue app:', error);
  // Show error message on page
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.innerHTML = `
      <div style="padding: 20px; color: red; background: white;">
        <h1>Error Loading Application</h1>
        <p>${error.message}</p>
        <p>Please check the browser console for more details.</p>
      </div>
    `;
  }
}

