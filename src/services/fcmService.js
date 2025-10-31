import client from '../api/client';

export async function registerFcmToken(token, device_type = 'android') {
  return client.post('/fcm/register', { token, device_type });
}

export async function unregisterFcmToken(token) {
  // axios delete with body -> use 'data' field
  return client.delete('/fcm/unregister', { data: { token } });
}

