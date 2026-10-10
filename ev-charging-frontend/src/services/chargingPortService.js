import api from "./api";

const requestWithLegacyFallback = async (request, legacyRequest) => {
  try {
    return (await request()).data;
  } catch (error) {
    if (error.response?.status !== 404) throw error;
    return (await legacyRequest()).data;
  }
};

export const chargingPortService = {
  getAdminPending: async () => {
    const response = await api.get("/admin/ports/pending");
    return response.data;
  },

  updateAdminApproval: async (id, approvalStatus, rejectionReason) => {
    const response = await api.put(`/admin/ports/${id}/approval`, {
      approvalStatus,
      ...(rejectionReason ? { rejectionReason } : {})
    });
    return response.data;
  },

  getAll: () => requestWithLegacyFallback(() => api.get("/ports"), () => api.get("/charging-ports")),

  getById: (id) => requestWithLegacyFallback(() => api.get(`/ports/${id}`), () => api.get(`/charging-ports/${id}`)),

  getByStation: (stationId) => requestWithLegacyFallback(() => api.get(`/ports/station/${stationId}`), () => api.get(`/charging-ports/station/${stationId}`)),

  create: (portData) => requestWithLegacyFallback(() => api.post("/ports", portData), () => api.post("/charging-ports", portData)),

  update: (id, portData) => requestWithLegacyFallback(() => api.put(`/ports/${id}`, portData), () => api.put(`/charging-ports/${id}`, portData)),

  delete: (id) => requestWithLegacyFallback(() => api.delete(`/ports/${id}`), () => api.delete(`/charging-ports/${id}`))
};
