import api from "./api";

const requestWithLegacyFallback = async (request, legacyRequest) => {
  try {
    return (await request()).data;
  } catch (error) {
    if (error.response?.status !== 404) throw error;
    return (await legacyRequest()).data;
  }
};

export const chargingSessionService = {
  getAll: () => requestWithLegacyFallback(() => api.get("/sessions"), () => api.get("/charging-sessions")),

  getById: (id) => requestWithLegacyFallback(() => api.get(`/sessions/${id}`), () => api.get(`/charging-sessions/${id}`)),

  getByUser: (userId) => requestWithLegacyFallback(() => api.get(`/sessions/user/${userId}`), () => api.get(`/charging-sessions/user/${userId}`)),
  getForHost: async () => {
    const response = await api.get("/sessions/host");
    return response.data;
  },
  getForFleet: async () => {
    const response = await api.get("/sessions/fleet");
    return response.data;
  },

  startSession: (bookingId) => requestWithLegacyFallback(() => api.post("/sessions/start", { bookingId }), () => api.post("/charging-sessions", { bookingId })),

  requestEnd: (id) => requestWithLegacyFallback(() => api.post(`/sessions/${id}/request-end`), () => api.post(`/charging-sessions/${id}/request-end`)),

  endSessionAsHost: (id, energyConsumedKwh) => requestWithLegacyFallback(
    () => api.put(`/sessions/${id}/end`, { energyConsumedKwh: Number(energyConsumedKwh) }),
    () => api.put(`/charging-sessions/${id}/end`, { energyConsumedKwh: Number(energyConsumedKwh) })
  )
};
