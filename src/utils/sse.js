// SSE helper fallback for React Native: use polling against /alerts endpoint.
// Switch to axios client so auth tokens and refresh logic are handled centrally.
import client from '../api/client';

export function connectAlertsStream(token, onEvent, onOpen, onError) {
  let stopped = false;
  let lastSeenId = null;

  async function poll() {
    if (stopped) return;
    try {
      // fetch active alerts via axios client (handles Authorization + refresh automatically)
      const res = await client.get('/alerts', { params: { active: true } });
      if (res && res.status === 200) {
        const body = res.data || {};
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
