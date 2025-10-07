import client from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function signup({ name, email, password }) {
  const res = await client.post('/auth/signup', { name, email, password });
  await AsyncStorage.setItem('token', res.data.token);
  if (res.data.refreshToken) await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
  await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data;
}

export async function login({ email, password }) {
  const res = await client.post('/auth/login', { email, password });
  await AsyncStorage.setItem('token', res.data.token);
  if (res.data.refreshToken) await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
  await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data;
}

export async function logout() {
  const refresh = await AsyncStorage.getItem('refreshToken');
  if (refresh) {
    try {
      await client.post('/auth/logout-refresh', { refreshToken: refresh });
    } catch (e) {
      // ignore
    }
  }
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
  await AsyncStorage.removeItem('refreshToken');
}

export async function getCurrentUser() {
  const u = await AsyncStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

export async function getRefreshToken() {
  return await AsyncStorage.getItem('refreshToken');
}
