// Prefer native EventSource (real SSE) and fall back to polling if unavailable.
// Keeps the same callback shape for consumers.
import { API_BASE_URL } from '../config/apiConfig';
import client from '../api/client';

function startPolling({ baseUrl, token, onEvent, onOpen, onError }) {
  let stopped = false;
  let lastSeenId = null;
  let timer = null;

  const poll = async () => {
    if (stopped) return;
    try {
      // Use axios client so auth header + refresh flow apply automatically
      const res = await client.get('/alerts', { params: { active: true } });
      if (res && res.status === 200) {
        const alerts = res.data?.alerts || [];
        if (!lastSeenId && alerts.length) {
          lastSeenId = alerts[0].id;
          onEvent?.({ type: 'snapshot', data: alerts });
        } else if (alerts.length) {
          const newAlerts = lastSeenId ? alerts.filter(a => a.id > lastSeenId) : alerts;
          if (newAlerts.length) {
            lastSeenId = newAlerts[0].id;
            for (const alert of newAlerts) onEvent?.({ type: 'alert', data: alert });
          }
        }
      } else {
        onError?.(new Error('Polling failed'));
      }
    } catch (err) {
      onError?.(err);
    } finally {
      if (!stopped) timer = setTimeout(poll, 5000);
    }
  };

  onOpen?.();
  poll();

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

export function connectAlertsStream(token, onEvent, onOpen, onError) {
  const baseUrl = (API_BASE_URL || '').replace(/\/$/, '');
  // Force polling only, ignore EventSource/SSE
  return startPolling({ baseUrl, token, onEvent, onOpen, onError });
}
