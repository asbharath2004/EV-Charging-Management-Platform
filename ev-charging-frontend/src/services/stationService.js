import api from "./api";

export const stationService = {
    getMyStation: async () => {
      const response = await api.get("/stations/my-station");
      return response.data;
    },
  getAll: async () => {
    const response = await api.get("/stations");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/stations/${id}`);
    return response.data;
  },

  create: async (stationData) => {
    const response = await api.post("/stations", stationData);
    return response.data;
  },

  update: async (id, stationData) => {
    const response = await api.put(`/stations/${id}`, stationData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/stations/${id}`);
    return response.data;
  }
};
