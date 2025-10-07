import client from '../api/client';

export async function listDevices() {
  const res = await client.get('/devices');
  return res.data.devices;
}

export async function addDevice({ code, name, location }) {
  const res = await client.post('/devices', { code, name, location });
  return res.data.device;
}

export async function markSafe(deviceId) {
  const res = await client.patch(`/devices/${deviceId}/mark-safe`);
  return res.data.device;
}
