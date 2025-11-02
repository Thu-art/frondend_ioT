// Central place for backend base URL. Read from Expo config 'extra' when available
import Constants from 'expo-constants';

// Read from Expo config 'extra' when available; sanitize to avoid stray spaces
const fallback = 'http://192.168.1.83:4000';
const apiBaseFromConfig = (Constants?.expoConfig?.extra?.API_BASE_URL) || (Constants?.manifest?.extra?.API_BASE_URL);
const raw = apiBaseFromConfig || fallback;
export const API_BASE_URL = typeof raw === 'string' ? raw.trim().replace(/\s+/g, '') : raw;

export default API_BASE_URL;
