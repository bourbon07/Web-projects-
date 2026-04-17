import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { trackPageVisit } from '../utils/pageVisits';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../pages/Dashboard.vue')
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../pages/Cart.vue')
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../pages/Checkout.vue')
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: () => import('../pages/Wishlist.vue')
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../pages/Orders.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/:id',
    name: 'order-details',
    component: () => import('../pages/OrderDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/product/:id',
    name: 'product',
    component: () => import('../pages/Product.vue')
  },
  {
    path: '/packages',
    name: 'packages',
    component: () => import('../pages/Packages.vue')
  },
  {
    path: '/package/:id',
    name: 'package',
    component: () => import('../pages/Package.vue')
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../pages/Chat.vue')
    // Removed requiresAuth to allow guests to view messages
  },
  {
    path: '/chat/:userId',
    name: 'chat-user',
    component: () => import('../pages/ChatWindow.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../pages/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:userId',
    name: 'view-profile',
    component: () => import('../pages/ViewProfile.vue')
  },
  {
    path: '/blocked',
    name: 'blocked',
    component: () => import('../pages/Blocked.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../pages/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../pages/Search.vue')
  },
  {
    path: '/category/:id',
    name: 'category',
    component: () => import('../pages/Category.vue')
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('../pages/AdminUsers.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/categories',
    name: 'admin-categories',
    component: () => import('../pages/AdminCategories.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/packages',
    name: 'admin-packages',
    component: () => import('../pages/AdminPackages.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('../pages/AdminProducts.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/delivery-fees',
    name: 'admin-delivery-fees',
    component: () => import('../pages/AdminDeliveryFees.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/service-fees',
    name: 'admin-service-fees',
    component: () => import('../pages/AdminServiceFees.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/user/:userId/orders',
    name: 'admin-user-orders',
    component: () => import('../pages/AdminUserOrders.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/user/:userId/profile',
    name: 'admin-user-profile',
    component: () => import('../pages/AdminUserProfile.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/guest-profile/:orderId',
    name: 'admin-guest-profile',
    component: () => import('../pages/AdminGuestProfile.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/chat',
    name: 'admin-chat',
    component: () => import('../pages/AdminChat.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/chat/:userId',
    name: 'admin-chat-user',
    component: () => import('../pages/AdminChat.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/blocked-users',
    name: 'admin-blocked-users',
    component: () => import('../pages/BlockedUsers.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/manage-site',
    name: 'admin-manage-site',
    component: () => import('../pages/ManageSite.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/admin-codes',
    name: 'admin-codes',
    component: () => import('../pages/AdminCodes.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/orders-checkout',
    name: 'admin-orders-checkout',
    component: () => import('../pages/AdminOrdersCheckout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/stats/:type',
    name: 'admin-stats-details',
    component: () => import('../pages/AdminStatsDetails.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/product/:id/customers',
    name: 'product-customers',
    component: () => import('../pages/ProductCustomers.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/block-list',
    name: 'block-list',
    component: () => import('../pages/BlockList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat-room',
    name: 'chat-room',
    component: () => import('../pages/ChatRoom.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Router error handler
router.onError((error) => {
  console.error('Router error:', error);
  console.error('Error loading route component:', error.message);
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  try {
    // If route requires auth, ensure user is loaded
    if (to.meta.requiresAuth && authStore.isAuthenticated && !authStore.user) {
      try {
        await authStore.fetchUser();
      } catch (error) {
        console.error('Error fetching user in router guard:', error);
        if (error.response?.status === 401) {
          next({ name: 'login', query: { redirect: to.fullPath }, replace: false });
          return;
        }
      }
    }
    
    // Check authentication requirements
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      if (to.name !== 'login') {
        next({ 
          name: 'login', 
          query: { redirect: to.fullPath },
          replace: false 
        });
      } else {
        next();
      }
      return;
    }
    
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
      if (to.name !== 'dashboard') {
        next({ name: 'dashboard', replace: false });
      } else {
        next();
      }
      return;
    }
    
    if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
      if (to.name !== 'dashboard') {
        next({ name: 'dashboard', replace: false });
      } else {
        next();
      }
      return;
    }
    
    if (authStore.user?.is_blocked && to.name !== 'blocked') {
      if (to.name !== 'blocked') {
        next({ name: 'blocked', replace: false });
      } else {
        next();
      }
      return;
    }
    
    // Track page visit
    if (to.name && to.path) {
      // Get page name from route meta or use route name
      const pageName = to.meta?.pageName || to.name;
      trackPageVisit(to.path, pageName);
    }
    
    // Allow navigation
    next();
  } catch (error) {
    console.error('Router guard error:', error);
    next();
  }
});

export default router;
