/**
 * Web Push smoke test
 * ─────────────────────────────────────────────────────────────
 * Usage:
 *   1. Start the server:  npm run start:dev
 *   2. Subscribe a device: open the admin PWA in Chrome on Android,
 *      grant notification permission — this POSTs to /api/push/subscribe
 *   3. Grab the raw subscription row from MongoDB (endpoint / p256dh / auth)
 *      and paste it below.
 *   4. Run:  node scripts/test-push.js
 *
 * The phone should show a system notification even if the PWA is closed.
 * ─────────────────────────────────────────────────────────────
 */

require('dotenv').config(); // loads .env from project root
const webpush = require('web-push');

// ── 1. VAPID setup ──────────────────────────────────────────
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

// ── 2. Paste a real subscription from the DB ────────────────
//       (endpoint, p256dh, auth come from the push_subscriptions collection)
const subscription = {
  endpoint: 'PASTE_ENDPOINT_HERE',
  keys: {
    p256dh: 'PASTE_P256DH_HERE',
    auth:   'PASTE_AUTH_HERE',
  },
};

// ── 3. Notification payload ──────────────────────────────────
const payload = JSON.stringify({
  title:   '🔔 Test Order #abc12345',
  body:    '2 items - ₹420.00 from Test Customer',
  tag:     'order-test',
  url:     '/orders/test',
  orderId: 'test',
});

// ── 4. Send ──────────────────────────────────────────────────
webpush
  .sendNotification(subscription, payload, { TTL: 60 })
  .then(() => console.log('✅ Push sent — check the device for a notification.'))
  .catch((err) => {
    console.error('❌ Push failed:', err.statusCode, err.body || err.message);
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.error('   → Subscription is dead / expired. Re-subscribe in the PWA.');
    }
  });