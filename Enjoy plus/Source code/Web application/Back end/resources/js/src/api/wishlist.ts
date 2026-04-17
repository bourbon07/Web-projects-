import axiosConfig from "./axiosConfig";

export const wishlistService = {
  getWishlist: async () => {
    const { data } = await axiosConfig.get("/wishlist");
    return data;
  },

  toggleWishlist: async (productId?: number, packageId?: number) => {
    const { data } = await axiosConfig.post("/wishlist/toggle", {
      product_id: productId,
      package_id: packageId,
    });
    return data;
  },

  removeFromWishlist: async (id: number) => {
    const { data } = await axiosConfig.delete(`/wishlist/${id}`);
    return data;
  },

  clearWishlist: async () => {
    const { data } = await axiosConfig.delete("/wishlist/clear");
    return data;
  },
};
