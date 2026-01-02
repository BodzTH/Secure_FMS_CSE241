import api from './api';

const adminService = {
  createUser: async (userData) => {
    const response = await api.post('/admin/create-user', userData);
    return response.data;
  },
  updateUser: async (id, userData) => {
    const response = await api.patch(`/admin/update-user/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/delete-user/${id}`);
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  }
};

export default adminService;
