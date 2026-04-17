import axiosConfig from "./axiosConfig";
import { User } from "../types";

export const authService = {
  async login(credentials: { email: string; password: string }) {
    const { data } = await axiosConfig.post("/login", credentials);
    if (data.access_token) {
      localStorage.setItem("auth_token", data.access_token);
    }
    return data;
  },

  async googleLogin(googleToken: string) {
    const { data } = await axiosConfig.post("/auth/google/callback", {
      google_token: googleToken,
    });
    if (data.access_token) {
      localStorage.setItem("auth_token", data.access_token);
    }
    return data;
  },

  async register(formData: FormData) {
    const { data } = await axiosConfig.post("/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (data.access_token) {
      localStorage.setItem("auth_token", data.access_token);
    }
    return data;
  },

  async logout() {
    await axiosConfig.post("/logout");
    localStorage.removeItem("auth_token");
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await axiosConfig.get("/user");
    return data; // This should be the User object directly or data.data
  },

  async updateProfile(profileData: Partial<User>) {
    const { data } = await axiosConfig.put("/user/profile", profileData);
    return data;
  },

  async forgotPasswordVerify(payload: { email: string }) {
    const { data } = await axiosConfig.post("/forgot-password/verify", payload);
    return data;
  },

  async resetPassword(payload: { email: string; token: string; password: string; password_confirmation: string }) {
    const { data } = await axiosConfig.post("/forgot-password/reset", payload);
    return data;
  },
};

