import axiosConfig from "./axiosConfig";
import { CartItem } from "../types";

export const cartService = {
  getCart: async () => {
    const { data } = await axiosConfig.get("/cart");
    return data;
  },

  addToCart: async (productId?: number, packageId?: number, quantity: number = 1) => {
    const { data } = await axiosConfig.post("/cart", { 
      product_id: productId, 
      package_id: packageId, 
      quantity 
    });
    return data;
  },

  updateCart: async (id: number, quantity: number) => {
    const { data } = await axiosConfig.put(`/cart/${id}`, { quantity });
    return data;
  },

  removeFromCart: async (id: number) => {
    const { data } = await axiosConfig.delete(`/cart/${id}`);
    return data;
  },

  clearCart: async () => {
    const { data } = await axiosConfig.delete("/cart/clear");
    return data;
  },

  syncCart: async (items: any[]) => {
    const { data } = await axiosConfig.post("/cart/sync", { items });
    return data;
  }
};
