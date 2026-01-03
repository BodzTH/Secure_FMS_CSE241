import api from './api';

const authService = {
    // Step 1: Request login OTP (email + password)
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // Step 2: Verify OTP and get token
    verifyOTP: async (email, otp) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    // Resend login OTP
    resendOTP: async (email) => {
        const response = await api.post('/auth/resend-otp', { email });
        return response.data;
    },



    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

export default authService;
