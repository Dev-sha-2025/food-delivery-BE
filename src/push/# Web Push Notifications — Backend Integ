# Web Push Notifications — Backend Integration Guide

**Audience:** Backend developer for the LocalBites order API (`https://food-delivery-be-wekb.onrender.com`).

**Why:** The admin-portal PWA's existing in-tab polling (`order-polling.service.ts`) stops running when the merchant minimizes the app or locks their phone — the OS suspends the JavaScript context. To deliver Zomato/WhatsApp-style background alerts that fire even when the app is closed, we need **Web Push**: the backend pushes a notification through Google's FCM relay, the OS wakes the service worker, and a system notification appears with sound and vibration.

The admin-portal frontend changes have already shipped. This document describes what the backend must do to make notifications actually fire.

---

## TL;DR — what you need to build

1. Generate a **VAPID keypair** once; share the public key with the frontend, keep the private key on the server.
2. Add a `push_subscriptions` table (or collection) keyed by `endpoint`.
3. Expose `POST /api/push/subscribe` — idempotent upsert by `endpoint`.
4. When a new order is created for a restaurant, look up all subscriptions for that `restaurantId` and call `webpush.sendNotification(...)` for each.
5. On HTTP `410 Gone` or `404` from the push service, **delete** that subscription row.

That's it. No queues, no cron, no third-party push service account.

---

## 1. Generate VAPID keys (one-time)

VAPID (Voluntary Application Server Identification) is how the push service authenticates you. Generate the keypair **once** and store both keys as secrets.

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Output:

```
Public Key:  BMx...long-base64-string...
Private Key: AbC...shorter-base64-string...
```

**Store these as environment variables:**

```bash
VAPID_PUBLIC_KEY=BMx...
VAPID_PRIVATE_KEY=AbC...
VAPID_SUBJECT=mailto:admin@localbites.in   # any contact URL or mailto:
```

**Send the `VAPID_PUBLIC_KEY` to the frontend developer.** They will paste it into [admin-portal/src/app/data/data.const.ts](../admin-portal/src/app/data/data.const.ts):

```ts
export const VAPID_PUBLIC_KEY = 'BMx...';
```

The public key is safe to ship to the browser; the private key must never leave the server.

---

## 2. Database schema

One row per device subscription. A merchant logging in on phone + tablet creates two rows.

### MongoDB

```js
{
  _id: ObjectId,
  endpoint: String,          // unique index — the push service URL
  p256dh: String,            // encryption public key from the browser
  auth: String,              // encryption auth secret from the browser
  restaurantId: String,      // which restaurant to notify for
  userAgent: String,         // optional, helpful for debugging
  createdAt: Date,
  lastSeenAt: Date,
}
```

Create a **unique index on `endpoint`** — the upsert depends on it.

```js
db.push_subscriptions.createIndex({ endpoint: 1 }, { unique: true });
db.push_subscriptions.createIndex({ restaurantId: 1 });
```

### SQL equivalent

```sql
CREATE TABLE push_subscriptions (
  id            BIGSERIAL PRIMARY KEY,
  endpoint      TEXT NOT NULL UNIQUE,
  p256dh        TEXT NOT NULL,
  auth          TEXT NOT NULL,
  restaurant_id TEXT NOT NULL,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_push_subs_restaurant ON push_subscriptions(restaurant_id);
```

---

## 3. Endpoint: `POST /api/push/subscribe`

**Called by:** the admin-portal on every app start (to refresh `lastSeenAt` and self-heal rotated endpoints) AND the first time the user grants notification permission.

**Idempotency requirement:** if a row with the same `endpoint` already exists, update `lastSeenAt` and any changed fields — do NOT create a duplicate. The frontend will call this repeatedly; that must be cheap and safe.

### Request

```http
POST /api/push/subscribe
Content-Type: application/json

{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/dXa...",
    "expirationTime": null,
    "keys": {
      "p256dh": "BNc...",
      "auth": "xY8..."
    }
  },
  "restaurantId": "69120ef5d617f361c1b666f7"
}
```

### Response

```http
200 OK
{ "ok": true }
```

### Node.js / Express implementation

```js
app.post('/api/push/subscribe', async (req, res) => {
  const { subscription, restaurantId } = req.body;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }
  if (!restaurantId) {
    return res.status(400).json({ error: 'restaurantId required' });
  }

  await PushSubscription.updateOne(
    { endpoint: subscription.endpoint },
    {
      $set: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        restaurantId,
        userAgent: req.headers['user-agent'],
        lastSeenAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  res.json({ ok: true });
});
```

**CORS:** the admin-portal is hosted on a different origin, so make sure `Access-Control-Allow-Origin` permits it (whatever your existing `/api/orders` CORS config uses — the same applies here).

---

## 4. Send a push when a new order is created

Hook this into whatever code path inserts a new order. Right after the order is persisted, fan out a push to every subscription for that restaurant.

### Install the library

```bash
npm install web-push
```

### Configure once at startup

```js
const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,     // e.g. 'mailto:admin@localbites.in'
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
```

### Send on new order

```js
async function notifyNewOrder(order) {
  const subs = await PushSubscription.find({ restaurantId: order.restaurantId });

  const orderIdShort = String(order.id).substring(0, 8);
  const itemCount = order.orderItems.reduce((sum, i) => sum + i.quantity, 0);
  const amount = `₹${order.billAmount.toFixed(2)}`;
  const customer = order.customerName ? ` from ${order.customerName}` : '';

  const payload = JSON.stringify({
    title: `🔔 New Order #${orderIdShort}`,
    body: `${itemCount} item${itemCount > 1 ? 's' : ''} - ${amount}${customer}`,
    tag: `order-${order.id}`,
    url: `/orders/${order.id}`,
    orderId: order.id,
  });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
          { TTL: 60 } // seconds: don't deliver if the device has been offline > 1 minute
        );
      } catch (err) {
        // 410 Gone / 404 Not Found = subscription is dead, prune it.
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ endpoint: sub.endpoint });
        } else {
          console.error('Push send failed:', sub.endpoint, err.statusCode, err.body);
        }
      }
    })
  );
}
```

**Call `notifyNewOrder(order)` immediately after the new-order insert succeeds.** Don't await it inside the request handler that creates the order — fire-and-forget so the customer-facing checkout isn't slowed by push fan-out.

### Payload contract — must match exactly

The frontend service worker [admin-portal/src/sw.js](../admin-portal/src/sw.js) reads these fields. If you change the shape, notifications will silently render with defaults.

| Field      | Type     | Required | Used for                                        |
| ---------- | -------- | -------- | ----------------------------------------------- |
| `title`    | string   | yes      | Notification title                              |
| `body`     | string   | yes      | Notification body text                          |
| `tag`      | string   | yes      | Dedupe key — use `order-<orderId>` to avoid two notifications for the same order if the push retries |
| `url`      | string   | yes      | Path to navigate to when the user taps the notification (e.g. `/orders/<orderId>`) |
| `orderId`  | string   | yes      | Surfaced to the SW for debugging / future deep-links |
| `icon`     | string   | no       | Defaults to `/icons/icon-192x192.png`           |
| `badge`    | string   | no       | Defaults to `/icons/icon-72x72.png`             |

**`TTL: 60`** tells the push service to drop the notification if the device is offline for more than 60 seconds. New orders are time-sensitive — a 10-minute-old "new order" alert is worse than no alert. Adjust if your kitchens routinely run with offline phones.

---

## 5. Pruning dead subscriptions

The `410 Gone` / `404 Not Found` branch in §4 above is the **only** cleanup path. The admin-portal has no logout flow, so it never explicitly tells you to forget a subscription. The push service tells you instead, the moment the user uninstalls the PWA, clears site data, or revokes notification permission.

**Do not** add a TTL-based cleanup that deletes subscriptions older than N days based on `lastSeenAt`. The frontend re-registers on every app start; if `lastSeenAt` is stale, that means the merchant hasn't opened the app — not that the subscription is dead. The push service is the source of truth for liveness.

---

## 6. Optional: `POST /api/push/unsubscribe`

Not needed for v1. The admin-portal currently has no "disable alerts" UI. If you add a settings toggle later, expose:

```http
POST /api/push/unsubscribe
{ "endpoint": "https://fcm.googleapis.com/fcm/send/dXa..." }
```

→ `DELETE FROM push_subscriptions WHERE endpoint = $1`.

Don't build this until the frontend asks for it.

---

## 7. Testing

### Local smoke test

```js
// scripts/test-push.js
const webpush = require('web-push');
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Paste a real subscription row from the DB:
const sub = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/...',
  keys: { p256dh: '...', auth: '...' },
};

webpush.sendNotification(sub, JSON.stringify({
  title: '🔔 Test Order #abc12345',
  body: '2 items - ₹420 from Test',
  tag: 'order-test',
  url: '/orders/test',
  orderId: 'test',
})).then(() => console.log('sent')).catch((e) => console.error(e.statusCode, e.body));
```

The merchant's phone should show a system notification with the order details — even if the PWA is fully closed and the screen is locked. This is the success criterion.

### End-to-end test with the real flow

1. Frontend dev installs the PWA on Android, grants notification permission. Confirm `POST /api/push/subscribe` lands a row in the DB.
2. Place a real order through the customer flow.
3. Phone should ring with a system notification within ~1-2 seconds. Tap → app opens to `/orders/<orderId>`.
4. Try with the phone locked → same behavior.
5. Try with the PWA swiped away from recents → same behavior.

---

## 8. Things to watch out for

- **HTTPS only.** Web Push requires HTTPS on the admin-portal origin (already the case on Render).
- **VAPID key rotation = mass unsubscribe.** Every existing subscription will be invalidated. Treat VAPID keys as long-lived secrets; don't regenerate casually.
- **iOS Safari.** Web Push works on iOS 16.4+ **only when the PWA is installed to the home screen**, and only with explicit user permission. If merchants use iPhones, expect a higher friction onboarding. Android behavior is unaffected.
- **Sound is OS-controlled.** Android plays the system's default notification sound; we cannot ship a custom `.mp3` for background notifications via web push. The merchant can change it in Android's per-app notification settings.
- **Quiet hours / Do Not Disturb.** On Android, DnD will suppress these. If merchants need a "bypass DnD" alarm-style alert for new orders, that requires a native wrapper (Capacitor/TWA) and is out of scope.
- **Don't log the full subscription object** at INFO level — the `auth` key is sensitive (it's the symmetric encryption key for the push channel).

---

## Frontend contract — for reference

Already implemented. Documented here so you can confirm the shapes match.

- **Frontend file that POSTs subscriptions:** [admin-portal/src/app/services/push-notification.service.ts](../admin-portal/src/app/services/push-notification.service.ts) — calls `${BACKEND_URL}/api/push/subscribe` with `{ subscription, restaurantId }`.
- **Service worker that receives push events:** [admin-portal/src/sw.js](../admin-portal/src/sw.js) — reads `title`, `body`, `tag`, `url`, `orderId`, suppresses the system notification when a window is already focused (so the in-app toast doesn't double up).
- **VAPID public key location (frontend):** [admin-portal/src/app/data/data.const.ts](../admin-portal/src/app/data/data.const.ts) — `VAPID_PUBLIC_KEY` is currently an empty string and **must be populated** with the public key from §1 before frontend can subscribe.

---

## Definition of done

- [ ] VAPID keys generated, public key sent to frontend, both stored as env vars
- [ ] `push_subscriptions` table/collection created with unique index on `endpoint`
- [ ] `POST /api/push/subscribe` deployed, returns 200, idempotent upsert verified with two back-to-back identical POSTs
- [ ] `notifyNewOrder()` wired into the order-creation flow
- [ ] 410/404 pruning verified — uninstall the PWA on a test device, place an order, confirm the dead subscription row is deleted
- [ ] End-to-end test passes: order placed → notification arrives on a locked Android phone with the PWA fully closed
