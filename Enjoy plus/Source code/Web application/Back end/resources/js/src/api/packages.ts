import axiosConfig from "./axiosConfig";
import { Package } from "../types";

export const packageService = {
  async getPackages() {
    const { data } = await axiosConfig.get("/packages");
    return data.data; // List of PackageResources
  },

  async getPackage(id: number) {
    const { data } = await axiosConfig.get(`/packages/${id}`);
    return data.data; // PackageResource
  },

  // Admin Methods
  async adminCreatePackage(formData: any) {
    const { data } = await axiosConfig.post("/admin/packages", formData);
    return data.data;
  },

  async adminUpdatePackage(id: number, formData: any) {
    if (formData instanceof FormData) {
      formData.append("_method", "PUT");
      const { data } = await axiosConfig.post(`/admin/packages/${id}`, formData);
      return data.data;
    }
    const { data } = await axiosConfig.put(`/admin/packages/${id}`, formData);
    return data.data;
  },

  async adminDeletePackage(id: number) {
    const { data } = await axiosConfig.delete(`/admin/packages/${id}`);
    return data;
  },
};
