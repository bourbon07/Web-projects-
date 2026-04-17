import axiosConfig from "./axiosConfig";
import { Order, PaymentMethod } from "../types";

export const orderService = {
  async placeOrder(orderData: {
    products: { id: number; quantity: number }[];
    payment_method: PaymentMethod;
    payment_details: any;
  }) {
    const { data } = await axiosConfig.post("/orders", orderData);
    return data;
  },

  async placeGuestOrder(orderData: {
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    guest_location: string;
    products: { id: number; quantity: number }[];
    payment_method: PaymentMethod;
    payment_details: any;
  }) {
    const { data } = await axiosConfig.post("/orders/guest", orderData);
    return data;
  },

  async getMyOrders() {
    const { data } = await axiosConfig.get("/orders");
    return data.data; // List of OrderResources
  },

  // Admin Methods
  async adminGetOrders() {
    const { data } = await axiosConfig.get("/admin/orders");
    return data.data; // List of OrderResources
  },

  async adminGetOrder(id: number) {
    const { data } = await axiosConfig.get(`/admin/orders/${id}`);
    return data.data;
  },

  async adminUpdateOrderStatus(id: number, status: string) {
    const { data } = await axiosConfig.put(`/admin/orders/${id}/status`, { status });
    return data.data; // Updated OrderResource
  },

  async adminDeleteOrder(id: number) {
    const { data } = await axiosConfig.delete(`/admin/orders/${id}`);
    return data;
  },
};
