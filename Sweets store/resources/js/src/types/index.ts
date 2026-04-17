export type Language = "ar" | "en";
export type Theme = "light" | "dark";
export type Gender = "Male" | "Female";
export type PaymentMethod = "Visa" | "Zain Cash" | "PayPal";
export type OrderStatus = "Pending" | "Approved" | "Rejected";

export interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  gender?: Gender;
  avatar?: string;
  phone?: string;
  role: "Admin" | "User";
  isAdmin?: boolean;
  is_banned: boolean;
  google_id?: string;
  password_set: boolean;
}

export interface Product {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  current_name: string;
  description: {
    en: string;
    ar: string;
  };
  current_description: string;
  price: number;
  original_price?: number;
  currency: "JOD";
  stock: number;
  image_url: string;
  brand: string;
  category: string;
  category_id?: number;
  brand_id?: number;
  average_rating: number;
  comments?: Comment[];
  ratings?: Rating[];
  reviews?: ProductReview[];
  is_package?: boolean;
}

export interface Package {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  current_name: string;
  description: {
    en: string;
    ar: string;
  };
  current_description: string;
  products?: Product[];
  image_url: string;
  price: number;
  original_price?: number;
  average_rating: number;
  currency: "JOD";
  stock: number;
  reviews?: ProductReview[];
  is_package?: boolean;
}

export interface Comment {
  id: number;
  body: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  created_at: string;
}

export interface Rating {
  id: number;
  rating: number;
  user: {
    name: string;
    avatar?: string;
  };
  created_at: string;
}

export interface ProductReview {
  id: number;
  productId: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Order {
  id: number;
  user?: User;
  guest?: {
    name: string;
    email: string;
    phone: string;
    location: string;
    payment: string;
  };
  items: CartItem[];
  total_price: number;
  delivery_fee: number;
  service_fee: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string;
  payment_details?: any;
}

export interface CartItem extends Product {
  quantity: number;
}
