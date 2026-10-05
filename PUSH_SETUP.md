# StoneFinder push notifications — setup

## 1. Install server package

```bash
npm install web-push
npm install -D @types/web-push
```

## 2. Generate VAPID keys

```bash
npx web-push generate-vapid-keys
```

Keep the private key private.

## 3. Add `.env.local`

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY
VAPID_PRIVATE_KEY=YOUR_PRIVATE_KEY
VAPID_SUBJECT=mailto:YOUR_EMAIL
```

Do not expose `VAPID_PRIVATE_KEY` as a `NEXT_PUBLIC_...` variable.

## 4. Supabase

Run `supabase/push_notifications.sql` once in Supabase SQL Editor.

## 5. Local test

Restart Next.js after changing `.env.local`:

```bash
npm run dev
```

Open Profile -> Notifications -> Enable notifications -> Send test.

## 6. Vercel

Add the same three environment variables in Vercel project settings and redeploy.
