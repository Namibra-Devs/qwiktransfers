import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = (Constants.expoConfig?.extra?.apiUrl) || 'http://161.97.80.67/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Add timeout for better error handling on mobile
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = API_URL.replace(/\/api$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};

export default api;
