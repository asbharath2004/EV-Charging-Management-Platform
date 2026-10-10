import api from "./api";

export const batteryLifeService = {
  getByUser: async (userId) => {
    const response = await api.get(`/battery-life/user/${userId}`);
    return response.data;
  }
};
