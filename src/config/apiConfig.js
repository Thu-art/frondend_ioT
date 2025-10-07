// Central place for backend base URL. Read from Expo config 'extra' when available
import Constants from 'expo-constants';

const fallback = 'http://172.21.117.82:4000';
const apiBaseFromConfig = (Constants?.expoConfig?.extra?.API_BASE_URL) || (Constants?.manifest?.extra?.API_BASE_URL);
export const API_BASE_URL = apiBaseFromConfig || fallback;

export default API_BASE_URL;
