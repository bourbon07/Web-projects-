import axiosConfig from "./axiosConfig";
import { Product } from "../types";

interface ApiResponse<T> {
  data: T;
}

export const productService = {
  getProducts: async (params?: { category?: string; brand?: string; search?: string; sort?: string }) => {
    const { data } = await axiosConfig.get<ApiResponse<Product[]>>("/products", { params });
    return data;
  },

  getStats: async () => {
    const { data } = await axiosConfig.get("/stats");
    return data;
  },

  searchStore: async (query: string) => {
    const { data } = await axiosConfig.get("/search", { params: { q: query } });
    return data;
  },
  
  getProduct: async (id: number) => {
    const { data } = await axiosConfig.get<ApiResponse<Product>>(`/products/${id}`);
    return data;
  },
  
  toggleWishlist: async (productId: number) => {
    const { data } = await axiosConfig.post(`/products/${productId}/wishlist`);
    return data;
  },
  
  getWishlist: async () => {
    const { data } = await axiosConfig.get<ApiResponse<Product[]>>("/wishlist");
    return data;
  },
  
  getShehabChat: async (message: string) => {
    const { data } = await axiosConfig.post("/chat", { message });
    return data;
  },
  
  // Admin Methods
  adminCreateProduct: async (formData: any) => {
    const config = formData instanceof FormData 
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    const { data } = await axiosConfig.post("/admin/products", formData, config);
    return data.data;
  },
  
  adminUpdateProduct: async (id: number, formData: any) => {
    if (formData instanceof FormData) {
      formData.append("_method", "PUT");
      const { data } = await axiosConfig.post(`/admin/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    }
    const { data } = await axiosConfig.put(`/admin/products/${id}`, formData);
    return data.data;
  },
  
  adminDeleteProduct: async (id: number) => {
    const { data } = await axiosConfig.delete(`/admin/products/${id}`);
    return data;
  },
  
  adminImportExcel: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await axiosConfig.post("/admin/inventory/import-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
  
  getCategories: async () => {
    const { data } = await axiosConfig.get("/categories");
    return data.data;
  },
  getBrands: async () => {
    const { data } = await axiosConfig.get("/brands");
    return data.data;
  },
};

export const categoryService = {
  getCategories: async () => {
    const { data } = await axiosConfig.get("/categories");
    return data.data;
  },
  adminCreateCategory: async (formData: any) => {
    const { data } = await axiosConfig.post("/admin/categories", formData);
    return data.data;
  },
  adminUpdateCategory: async (id: number, formData: any) => {
    const { data } = await axiosConfig.put(`/admin/categories/${id}`, formData);
    return data.data;
  },
  adminDeleteCategory: async (id: number) => {
    const { data } = await axiosConfig.delete(`/admin/categories/${id}`);
    return data;
  },
};

export const brandService = {
  getBrands: async () => {
    const { data } = await axiosConfig.get("/brands");
    return data.data;
  },
  adminCreateBrand: async (formData: any) => {
    const config = formData instanceof FormData 
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    const { data } = await axiosConfig.post("/admin/brands", formData, config);
    return data.data;
  },
  adminUpdateBrand: async (id: number, formData: any) => {
    if (formData instanceof FormData) {
      formData.append("_method", "PUT");
      const { data } = await axiosConfig.post(`/admin/brands/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    }
    const { data } = await axiosConfig.put(`/admin/brands/${id}`, formData);
    return data.data;
  },
  adminDeleteBrand: async (id: number) => {
    const { data } = await axiosConfig.delete(`/admin/brands/${id}`);
    return data;
  },
};
