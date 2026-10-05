# StoneFinder — automatic push for matches (stage 3)

1. Apply this patch.
2. In Supabase SQL Editor run:
   `supabase/push_match_notifications.sql`
3. Add a server-only environment variable locally and in Vercel:
   `SUPABASE_SERVICE_ROLE_KEY=...`
   Copy the Service Role key from your Supabase project API settings.
   Never prefix it with `NEXT_PUBLIC_` and never commit it to Git.
4. Restart local dev server after changing `.env.local`.
5. Deploy to Vercel after adding the same environment variable there.

Behavior:
- when a NEW listing is created, StoneFinder runs the existing
  `find_listing_matches` matcher;
- owners of matching existing listings who enabled push get one notification;
- the creator of the new listing is not notified about their own action;
- one user gets only one push per new source listing even if several of their
  listings match;
- stale browser push subscriptions (404/410) are removed automatically;
- push failures never block listing creation.
