import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/apiConfig';

// Configure base URL: use central config so changing IP is a single edit
const BASE_URL = API_BASE_URL;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// attach token if present
axiosClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore
  }
  return config;
});

// Refresh token flow
let isRefreshing = false;
let refreshQueue = [];

async function processQueue(error, token = null) {
  refreshQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  refreshQueue = [];
}

axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (!originalRequest) return Promise.reject(err);

    // if 401 and not retrying yet
    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (isRefreshing) {
          // queue the request until refresh finished
          return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          });
        }

        isRefreshing = true;
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axiosClient.post('/auth/refresh', { refreshToken });
        const newToken = response.data.token;
        await AsyncStorage.setItem('token', newToken);
        axiosClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        await processQueue(null, newToken);
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        await processQueue(refreshErr, null);
        // clear tokens
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        isRefreshing = false;
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
