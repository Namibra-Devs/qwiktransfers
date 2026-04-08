import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api' || '/api',
    timeout: 15000, // 15 seconds timeout. Add timeout for better error handling on mobile
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const baseUrl = rawBaseUrl.replace(/\/api$/, '');

    // Ensure one slash between baseUrl and path
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}${cleanPath}`;
};
