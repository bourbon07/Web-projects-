import axiosConfig from "./axiosConfig";

export const adminService = {
  async getUsers() {
    const { data } = await axiosConfig.get("/admin/users");
    return data.data;
  },

  async toggleUserBan(userId: number) {
    const { data } = await axiosConfig.post(`/admin/users/${userId}/toggle-ban`);
    return data;
  },

  async getReviews() {
    const { data } = await axiosConfig.get("/admin/reviews");
    return data.data;
  },

  async deleteReview(id: number) {
    const { data } = await axiosConfig.delete(`/admin/reviews/${id}`);
    return data;
  },
};
