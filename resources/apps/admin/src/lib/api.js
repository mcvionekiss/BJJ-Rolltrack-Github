import { browser } from '$app/environment';
import { PUBLIC_API_URL } from '$env/static/public';
import axios from 'axios';

export const getErrorMessage = (error) => {
    let message = error.message;
    if (error && error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
    }
    return message;
};

export const getBearerToken = () => {
    if (!browser) return undefined;
    return localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : undefined;
};

export const useApi = (headers = {}) => {
    const apiInstance = axios.create({
        baseURL: PUBLIC_API_URL + '/api',
        headers
    });

    apiInstance.interceptors.request.use((config) => {
        const token = getBearerToken();
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    return apiInstance;
};

export default useApi();
