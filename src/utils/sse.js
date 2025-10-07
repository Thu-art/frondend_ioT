// SSE helper fallback for React Native: use polling against /alerts endpoint.
// This avoids Node-only polyfills and works reliably on Expo/RN.
import { API_BASE_URL } from '../config/apiConfig';

export function connectAlertsStream(token, onEvent, onOpen, onError) {
  const urlBase = API_BASE_URL;
  let stopped = false;
  let lastSeenId = null;

  async function poll() {
    if (stopped) return;
    try {
      // fetch active alerts; the backend supports ?active=true
      const qs = '?active=true';
      const res = await fetch(`${urlBase}/alerts${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const body = await res.json();
        const alerts = body.alerts || [];
        if (!lastSeenId && alerts.length) {
          // initial snapshot
          lastSeenId = alerts[0].id;
          onEvent({ type: 'snapshot', data: alerts });
        } else if (alerts.length) {
          // find new alerts with id greater than lastSeenId (assuming auto-increment ids)
          const newAlerts = lastSeenId ? alerts.filter(a => a.id > lastSeenId) : alerts;
          if (newAlerts.length) {
            lastSeenId = newAlerts[0].id;
            // emit in chronological order newest-first
            for (const a of newAlerts) onEvent({ type: 'alert', data: a });
          }
        }
      } else {
        onError && onError(new Error('Polling failed'));
      }
    } catch (err) {
      onError && onError(err);
    }
    // poll again after interval
    setTimeout(poll, 5000);
  }

  // start
  setTimeout(() => {
    onOpen && onOpen();
    poll();
  }, 0);

  return () => { stopped = true; };
}
