import api from "./api";

export const bookingService = {
  getAll: async () => {
    const response = await api.get("/bookings");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  getByUser: async (userId) => {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data;
  },

  getForHost: async () => {
    const response = await api.get("/bookings/host");
    return response.data;
  },

  getForFleet: async () => {
    const response = await api.get("/bookings/fleet");
    return response.data;
  },

  create: async (bookingData) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },

  update: async (id, bookingData) => {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  confirm: async (id) => {
    const response = await api.put(`/bookings/${id}/confirm`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  }
};
