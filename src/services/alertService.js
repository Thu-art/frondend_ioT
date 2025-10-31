import client from '../api/client';

export async function createAlert({ code, device_id, type, level = 0, message = '', syncKey = null }) {
  const res = await client.post('/alerts', { code, device_id, type, level, message, syncKey });
  return res.data.alert;
}

export async function listAlerts({ active = true } = {}) {
  const res = await client.get(`/alerts?active=${active}`);
  return res.data.alerts;
}

export async function ackAlert(id) {
  const res = await client.patch(`/alerts/${id}/ack`);
  return res.data.alert;
}
