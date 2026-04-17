import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

import { Product, CartItem, Order, User, Language, ProductReview } from "../../types";
import { authService } from "../../api/auth";
import { cartService } from "../../api/cart";
import { wishlistService } from "../../api/wishlist";
import { toast } from "sonner";
import axiosConfig from "../../api/axiosConfig";


export type Theme = "light" | "dark";

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (p: Product, quantity?: number) => Promise<boolean>;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  toggleWishlist: (p: Product) => void;
  isInWishlist: (id: number) => boolean;
  orders: Order[];
  placeOrder: (guestInfo: { name: string; email: string; phone: string; address: string; payment: string }, fees: { delivery_fee: number; service_fee: number }) => Promise<any>;
  cartCount: number;
  wishlistCount: number;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  productReviews: ProductReview[];
  addProductReview: (id: number, rating: number, comment: string) => Promise<any>;
  addPackageReview: (id: number, rating: number, comment: string) => Promise<any>;
  deleteProductReview: (id: number) => Promise<void>;
  deliveryFee: number;
  serviceFee: number;
  setDeliveryFee: (fee: number) => void;
  setServiceFee: (fee: number) => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  fetchOrders: () => Promise<void>;
  siteName: string;
  setSiteName: (name: string) => void;
  siteLogo: string | null;
  setSiteLogo: (logo: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_ORDERS: any[] = [];

const INITIAL_REVIEWS: ProductReview[] = [
  { id: 1, productId: 1, user: "أحمد محمد", rating: 5, comment: "منتج رائع جداً، جودة عالية وسعر مناسب. أنصح به بشدة!", date: "2024-03-10" },
  { id: 2, productId: 5, user: "سارة عبدالله", rating: 4, comment: "الخلاط ممتاز وقوي، لكن الصوت عالي قليلاً", date: "2024-03-15" },
  { id: 3, productId: 2, user: "نورا خالد", rating: 5, comment: "ألوان جميلة ومقاومة للحرارة كما وصفوا", date: "2024-04-01" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>((localStorage.getItem("lang") as Language) || "ar");
  const [theme, setTheme] = useState<Theme>((localStorage.getItem("theme") as Theme) || "light");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("auth_token"));
  const [currentUser, setCurrentUser] = useState<User | null>(JSON.parse(localStorage.getItem("current_user") || "null"));
  const [cartOpen, setCartOpen] = useState(false);
  const [productReviews, setProductReviews] = useState<ProductReview[]>(INITIAL_REVIEWS);
  const [deliveryFee, setDeliveryFee] = useState(0.0);
  const [serviceFee, setServiceFee] = useState(0.5);
  const [siteName, setSiteName] = useState("Enjoy Plus");
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  const [initialCartLoaded, setInitialCartLoaded] = useState(false);


  // Fetch Branding Settings
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data } = await axiosConfig.get("/settings");
        if (data.site_name) setSiteName(data.site_name);
        if (data.site_logo) setSiteLogo(data.site_logo);
      } catch (err) {
        console.error("Failed to fetch branding", err);
      }
    };
    fetchBranding();
  }, []);

  // Persistence Effects
  useEffect(() => { localStorage.setItem("lang", lang); }, [lang]);
  useEffect(() => { localStorage.setItem("theme", theme); }, [theme]);
  useEffect(() => {
    // Only persist guest cart to localStorage
    if (!isLoggedIn) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isLoggedIn]);

  // Wishlist is now DB-backed for logged-in users — no localStorage persistence needed
  useEffect(() => { 
    if (currentUser) {
      localStorage.setItem("current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("current_user");
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("current_user");
      
      // STRICT ISOLATION: Clear BOTH cart and wishlist on logout
      localStorage.removeItem("cart");
      setCart([]);
      setWishlist([]);
    }
  }, [isLoggedIn]);


  // Fetch user data, cart, and wishlist on mount if logged in
  useEffect(() => {
    const fetchUserAndCart = async () => {
      const token = localStorage.getItem("auth_token");
      if (token && isLoggedIn) {
        try {
          const user = await authService.getCurrentUser();
          const userData = (user as any).data || user;
          setCurrentUser(userData);
          localStorage.setItem("current_user", JSON.stringify(userData));

          // SYNC GUEST CART IF ANY
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          if (localCart.length > 0) {
              await cartService.syncCart(localCart.map((i: any) => ({
                product_id: i.is_package ? undefined : i.id,
                package_id: i.is_package ? i.id : undefined,
                quantity: i.quantity
              })));
              localStorage.removeItem("cart");
          }

          // FETCH THE LOGGED-IN USER'S CART from server
          const dbCart = await cartService.getCart();
          const items = dbCart.data.map((i: any) => ({
            ...(i.product || i.package),
            quantity: i.quantity,
            db_id: i.id,
            is_package: !!i.package_id,
            id: i.product_id || i.package_id
          }));
          setCart(items);

          // FETCH THE LOGGED-IN USER'S WISHLIST from server (DB-backed isolation)
          try {
            const dbWishlist = await wishlistService.getWishlist();
            const wishItems = (dbWishlist.data || []).map((i: any) => {
              const item = i.product || i.package || {};
              return { ...item, is_package: !!i.package_id, db_wishlist_id: i.id };
            });
            setWishlist(wishItems);
          } catch {
            setWishlist([]);
          }

          setInitialCartLoaded(true);
        } catch (error) {
          console.error("Failed to fetch user/cart:", error);
          if ((error as any).response?.status === 401) {
            setIsLoggedIn(false);
          }
        }
      } else {
          // GUEST: Load from localStorage
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          setCart(localCart);
          setWishlist([]); // Guests don't have a persisted wishlist
          setInitialCartLoaded(true);
      }
    };
    fetchUserAndCart();
  }, [isLoggedIn]);


  // Fetch orders when logged in
  const fetchOrders = async () => {
    const token = localStorage.getItem("auth_token");
    if (token && isLoggedIn) {
      try {
        const { data } = await axiosConfig.get("/orders");
        // Handle both plain array and { data: ... }
        setOrders(data.data || data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    } else {
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isLoggedIn]);

  // Toggle dark class on html element for CSS variable switching
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme]);

  const addToCart = async (p: Product, quantity: number = 1): Promise<boolean> => {
    const isPackage = !!(p as any).is_package;
    const name = lang === 'ar' ? (p.name?.ar || '') : (p.name?.en || '');

    // 1- Client-side pre-check (if 'stock' is available in 'p')
    if (typeof p.stock !== 'undefined' && p.stock < quantity) {
      const msg = lang === 'ar' ? `المخزون غير كافي لـ ${name}` : `Insufficient stock for ${name}`;
      toast.error(msg);
      return false;
    }

    if (isLoggedIn) {
        try {
            const res = await cartService.addToCart(isPackage ? undefined : p.id, isPackage ? p.id : undefined, quantity);
            const newItem = {
                ...(res.data.product || res.data.package),
                quantity: res.data.quantity,
                db_id: res.data.id,
                is_package: isPackage
            };
            
            setCart((prev) => {
                const existing = prev.find((i) => (i as any).db_id === newItem.db_id);
                if (existing) {
                    return prev.map((i) => ((i as any).db_id === newItem.db_id ? { ...i, quantity: newItem.quantity } : i));
                }
                return [...prev, newItem];
            });
            return true;
        } catch (error: any) {
            console.error("DB add failed", error);
            if (error.response?.status === 422 && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(lang === 'ar' ? 'فشل إضافة العنصر للسلة' : 'Failed to add item to cart');
            }
            return false;
        }
    } else {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === p.id && (i as any).is_package === (p as any).is_package);
            if (existing) {
                return prev.map((i) => (i.id === p.id && (i as any).is_package === (p as any).is_package ? { ...i, quantity: i.quantity + quantity } : i));
            }
            return [...prev, { ...p, quantity }];
        });
        return true;
    }
  };

  const removeFromCart = async (id: number) => {
    if (isLoggedIn) {
        const item = cart.find(i => i.id === id); // id on frontend is usually ID of product
        if (item && (item as any).db_id) {
            await cartService.removeFromCart((item as any).db_id);
        }
    }
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = async (id: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    const item = cart.find(i => i.id === id);
    if (item && typeof (item as any).stock !== 'undefined' && qty > (item as any).stock) {
      const name = lang === 'ar' ? (item.name?.ar || '') : (item.name?.en || '');
      toast.error(lang === 'ar' ? `المخزون غير كافي لـ ${name}` : `Insufficient stock for ${name}`);
      return;
    }
    
    if (isLoggedIn) {
        if (item && (item as any).db_id) {
            try {
                await cartService.updateCart((item as any).db_id, qty);
            } catch (error: any) {
                console.error("Cart update failed", error);
                if (error.response?.status === 422 && error.response?.data?.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error(lang === 'ar' ? 'فشل تحديث الكمية' : 'Failed to update quantity');
                }
                return;
            }
        }
    }
    
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };


  const toggleWishlist = async (p: Product) => {
    if (isLoggedIn) {
      try {
        const isPackage = !!(p as any).is_package;
        const res = await wishlistService.toggleWishlist(
          isPackage ? undefined : p.id,
          isPackage ? p.id : undefined
        );
        if (res.status === 'added') {
          setWishlist((prev) => [...prev, { ...p, db_wishlist_id: res.data?.id }]);
        } else {
          // removed
          setWishlist((prev) => prev.filter((i) => i.id !== p.id));
        }
      } catch (error) {
        console.error('Wishlist toggle failed:', error);
      }
    } else {
      // Guest: local-only toggle (no persistence)
      setWishlist((prev) => {
        const exists = prev.find((i) => i.id === p.id);
        if (exists) return prev.filter((i) => i.id !== p.id);
        return [...prev, p];
      });
    }
  };

  const isInWishlist = (id: number) => wishlist.some((i) => i.id === id);

  const placeOrder = async (guestInfo: { name: string; email: string; phone: string; address: string; payment: string }, fees: { delivery_fee: number; service_fee: number }) => {
    if (cart.length === 0) return;
    try {
      const response = await axiosConfig.post("/orders/checkout", {
        items: cart.map(i => ({
          [(i as any).is_package ? 'package_id' : 'product_id']: (i as any).id,
          quantity: i.quantity
        })),
        payment_method: guestInfo?.payment,
        delivery_fee: fees.delivery_fee,
        service_fee: fees.service_fee,
        ...guestInfo
      });
      // Laravel Resource wraps the response in a 'data' property
      const newOrder = response.data.data || response.data;
      setOrders(prev => [newOrder, ...prev]);
      setCart([]);
      return newOrder;
    } catch (error) {
      console.error("Checkout failed:", error);
      throw error;
    }
  };

  const addProductReview = async (productId: number, rating: number, comment: string) => {
    try {
      const { data } = await axiosConfig.post(`/products/${productId}/reviews`, { rating, comment });
      const newReview = data.review;
      setProductReviews((prev) => [newReview, ...prev]);
      return newReview;
    } catch (error) {
      console.error("Adding product review failed:", error);
      throw error;
    }
  };

  const addPackageReview = async (packageId: number, rating: number, comment: string) => {
    try {
      const { data } = await axiosConfig.post(`/packages/${packageId}/reviews`, { rating, comment });
      const newReview = data.review;
      setProductReviews((prev) => [newReview, ...prev]);
      return newReview;
    } catch (error) {
      console.error("Adding package review failed:", error);
      throw error;
    }
  };

  const deleteProductReview = async (id: number) => {
    try {
      await axiosConfig.delete(`/admin/reviews/${id}`); // Assuming admin route for deletion
      setProductReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Deleting review failed:", error);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      const response = await authService.updateProfile(data);
      const updatedUser = (response as any).user?.data || (response as any).user || response;
      setCurrentUser(updatedUser);
      localStorage.setItem("current_user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        theme,
        setTheme,
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isInWishlist,
        orders,
        placeOrder,
        cartCount,
        wishlistCount,
        isLoggedIn,
        setIsLoggedIn,
        currentUser,
        setCurrentUser,
        cartOpen,
        setCartOpen,
        productReviews,
        addProductReview,
        addPackageReview, // Added to provider value
        deleteProductReview,
        deliveryFee,
        serviceFee,
        setDeliveryFee,
        setServiceFee,
        updateUserProfile,
        fetchOrders,
        siteName,
        setSiteName,
        siteLogo,
        setSiteLogo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

// ===== Enjoy Plus Theme Hook =====
export function useEPTheme() {
  const { theme } = useApp();
  const dark = theme === "dark";
  return {
    dark,
    bg: dark ? "#0f1117" : "#FAFAFA",
    surface: dark ? "#1a1f2e" : "#FFFFFF",
    surface2: dark ? "#1e2537" : "#FFF8FA",
    surface3: dark ? "#242a3d" : "#FFF0F3",
    text: dark ? "#f0f0f5" : "#1a1a1a",
    text2: dark ? "#c0c0d0" : "#555555",
    muted: dark ? "#9ca3af" : "#888888",
    light: dark ? "#6b7280" : "#BBBBBB",
    border: dark ? "#2a3047" : "#FFDDE4",
    inputBg: dark ? "#1e2537" : "#FFF8FA",
    cardHover: dark ? "#242a3d" : "#FFF0F3",
    red: "#E5233B",
    pink: "#FF6B8A",
    pinkLight: dark ? "#2a1f28" : "#FFDDE4",
    headerBg: dark ? "#141824" : "#FFFFFF",
    overlayBg: dark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.4)",
  };
}