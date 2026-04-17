import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Language = "ar" | "en";
export type Theme = "light" | "dark";

export interface Product {
  id: number;
  nameAr: string;
  nameEn: string;
  brand: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  categoryAr: string;
  inStock: boolean;
  description?: string;
  descriptionAr?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: "pending" | "approved" | "rejected" | "delivered";
}

export interface ProductReview {
  id: number;
  productId: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isAdmin?: boolean;
  age?: string;
  gender?: string;
}

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  toggleWishlist: (p: Product) => void;
  isInWishlist: (id: number) => boolean;
  orders: Order[];
  placeOrder: (guestInfo?: { name: string; email: string; phone: string; address: string; payment: string }) => void;
  cartCount: number;
  wishlistCount: number;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  productReviews: ProductReview[];
  addProductReview: (review: Omit<ProductReview, "id" | "date">) => void;
  deleteProductReview: (id: number) => void;
  deliveryFee: number;
  serviceFee: number;
  setDeliveryFee: (fee: number) => void;
  setServiceFee: (fee: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-2024-001",
    date: "2024-03-15",
    total: 285,
    status: "delivered",
    items: [
      {
        id: 1,
        nameAr: "أكياس تزيين احترافية",
        nameEn: "Professional Piping Bags",
        brand: "Wilton",
        price: 45,
        originalPrice: 65,
        rating: 4.5,
        reviews: 128,
        image: "https://images.unsplash.com/photo-1631827561806-18c59d7fde38?w=400",
        category: "decoration",
        categoryAr: "أدوات التزيين",
        inStock: true,
        quantity: 2,
      },
    ],
  },
  {
    id: "ORD-2024-002",
    date: "2024-04-02",
    total: 420,
    status: "approved",
    items: [
      {
        id: 5,
        nameAr: "خلاط كيك احترافي",
        nameEn: "Professional Stand Mixer",
        brand: "KitchenAid",
        price: 380,
        originalPrice: 520,
        rating: 4.9,
        reviews: 312,
        image: "https://images.unsplash.com/photo-1578845425669-b6562f83b11e?w=400",
        category: "appliances",
        categoryAr: "أجهزة المطبخ",
        inStock: true,
        quantity: 1,
      },
    ],
  },
];

const INITIAL_REVIEWS: ProductReview[] = [
  { id: 1, productId: 1, user: "أحمد محمد", rating: 5, comment: "منتج رائع جداً، جودة عالية وسعر مناسب. أنصح به بشدة!", date: "2024-03-10" },
  { id: 2, productId: 5, user: "سارة عبدالله", rating: 4, comment: "الخلاط ممتاز وقوي، لكن الصوت عالي قليلاً", date: "2024-03-15" },
  { id: 3, productId: 2, user: "نورا خالد", rating: 5, comment: "ألوان جميلة ومقاومة للحرارة كما وصفوا", date: "2024-04-01" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("ar");
  const [theme, setTheme] = useState<Theme>("light");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [productReviews, setProductReviews] = useState<ProductReview[]>(INITIAL_REVIEWS);
  const [deliveryFee, setDeliveryFee] = useState(2.5);
  const [serviceFee, setServiceFee] = useState(0.5);

  // Toggle dark class on html element for CSS variable switching
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme]);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) {
        return prev.map((i) => (i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

  const toggleWishlist = (p: Product) => {
    setWishlist((prev) => {
      const exists = prev.find((i) => i.id === p.id);
      if (exists) return prev.filter((i) => i.id !== p.id);
      return [...prev, p];
    });
  };

  const isInWishlist = (id: number) => wishlist.some((i) => i.id === id);

  const placeOrder = (guestInfo?: { name: string; email: string; phone: string; address: string; payment: string }) => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal + deliveryFee + serviceFee;
    const order: Order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      items: [...cart],
      total,
      status: "pending",
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
  };

  const addProductReview = (review: Omit<ProductReview, "id" | "date">) => {
    const newReview: ProductReview = {
      ...review,
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
    };
    setProductReviews((prev) => [newReview, ...prev]);
  };

  const deleteProductReview = (id: number) => {
    setProductReviews((prev) => prev.filter((r) => r.id !== id));
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
        deleteProductReview,
        deliveryFee,
        serviceFee,
        setDeliveryFee,
        setServiceFee,
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