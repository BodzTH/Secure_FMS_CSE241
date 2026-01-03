import api from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (email, otp, newPassword) => {
        const response = await api.post('/auth/reset-password', { email, otp, newPassword });
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

export default authService;
