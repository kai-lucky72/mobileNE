import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

export const parkingService = {
  getParkings: async (params = {}) => {
    const response = await api.get('/parkings', { params });
    return response.data;
  },

  getParkingByCode: async (code) => {
    const response = await api.get(`/parkings/${code}`);
    return response.data;
  },

  createParking: async (parkingData) => {
    const response = await api.post('/parkings', parkingData);
    return response.data;
  },

  updateParking: async (code, parkingData) => {
    const response = await api.put(`/parkings/${code}`, parkingData);
    return response.data;
  },

  deleteParking: async (code) => {
    const response = await api.delete(`/parkings/${code}`);
    return response.data;
  }
};

export const entryService = {
  getEntries: async (params = {}) => {
    const response = await api.get('/entries', { params });
    return response.data;
  },

  createEntry: async (entryData) => {
    const response = await api.post('/entries', entryData);
    return response.data;
  },

  processExit: async (exitData) => {
    const response = await api.post('/entries/exit', exitData);
    return response.data;
  },

  getEntryByTicket: async (ticketNumber) => {
    const response = await api.get(`/entries/ticket/${ticketNumber}`);
    return response.data;
  },

  getOutgoingReport: async (params) => {
    const response = await api.get('/entries/reports/outgoing', { params });
    return response.data;
  },

  getEnteredReport: async (params) => {
    const response = await api.get('/entries/reports/entered', { params });
    return response.data;
  }
};
