import api from './api';

const fileService = {
  uploadFile: async (formData) => {
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getFiles: async () => {
    const response = await api.get('/files/');
    return response.data;
  },
  downloadFile: async (id) => {
    // For download, we might want to return the whole response to handle blob/streams, 
    // or just trigger a window location change if it's a direct link. 
    // Assuming backend returns binary data or a structured response. 
    // If it's a secured endpoint returning a file stream:
    const response = await api.get(`/files/download/${id}`, {
      responseType: 'blob', // Important for handling binary data
    });
    return response; 
  },
  deleteFile: async (id) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  }
};

export default fileService;
