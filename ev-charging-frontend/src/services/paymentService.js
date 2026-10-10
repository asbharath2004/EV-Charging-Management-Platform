import api from "./api";

export const paymentService = {

  // =====================================================
  // GET MY PAYMENTS
  // Normal EV Driver
  // =====================================================

  getMyPayments: async () => {
    const response = await api.get("/payments/my");
    return response.data;
  },

  getHostRevenue: async () => {
    const response = await api.get("/payments/host");
    return response.data;
  },

  getFleetPayments: async () => {
    const response = await api.get("/payments/fleet");
    return response.data;
  },

  // =====================================================
  // GET ALL PAYMENTS
  // Admin / Fleet Operator
  // =====================================================

  getAll: async () => {
    const response = await api.get("/payments");
    return response.data;
  },

  // =====================================================
  // GET PAYMENT BY ID
  // =====================================================

  getById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // =====================================================
  // GET PAYMENTS BY USER
  // Admin / Fleet Operator only
  // =====================================================

  getByUser: async (userId) => {
    const response = await api.get(`/payments/user/${userId}`);
    return response.data;
  },

  // =====================================================
  // CREATE PAYMENT
  // =====================================================

  create: async (paymentData) => {
    const response = await api.post("/payments", paymentData);
    return response.data;
  }
};