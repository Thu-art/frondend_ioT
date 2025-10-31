// Prefer native EventSource (real SSE) and fall back to polling if unavailable.
// Keeps the same callback shape for consumers.
import { API_BASE_URL } from '../config/apiConfig';

function startPolling({ baseUrl, token, onEvent, onOpen, onError }) {
  let stopped = false;
  let lastSeenId = null;
  let timer = null;

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const poll = async () => {
    if (stopped) return;
    try {
      const res = await fetch(`${baseUrl}/alerts?active=true`, { headers: authHeaders });
      if (res.ok) {
        const body = await res.json();
        const alerts = body?.alerts || [];
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
  const EventSourceImpl = global?.NativeEventSource || global?.EventSource;

  if (!EventSourceImpl) {
    return startPolling({ baseUrl, token, onEvent, onOpen, onError });
  }

  const url = `${baseUrl}/stream/alerts${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  let closed = false;
  let fallbackCleanup = null;
  let source;

  try {
    source = new EventSourceImpl(url);
  } catch (err) {
    onError?.(err);
    return startPolling({ baseUrl, token, onEvent, onOpen, onError });
  }

  const cleanup = () => {
    closed = true;
    source.close();
    if (fallbackCleanup) {
      fallbackCleanup();
      fallbackCleanup = null;
    }
  };

  const deliver = (type, raw) => {
    if (closed || raw == null) return;
    try {
      const parsed = raw.length ? JSON.parse(raw) : null;
      if (parsed !== null) onEvent?.({ type, data: parsed });
    } catch (err) {
      onError?.(err);
    }
  };

  source.addEventListener('open', () => {
    if (!closed) onOpen?.();
  });

  source.addEventListener('snapshot', (evt) => deliver('snapshot', evt?.data));
  source.addEventListener('alert', (evt) => deliver('alert', evt?.data));
  source.addEventListener('error', (evt) => {
    if (closed) return;
    const err = evt instanceof Error ? evt : new Error('SSE connection error');
    onError?.(err);
    source.close();
    if (!fallbackCleanup) {
      fallbackCleanup = startPolling({ baseUrl, token, onEvent, onOpen, onError });
    }
  });

  return cleanup;
}
