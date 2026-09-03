# Phase 4 — Auth setup notes

The code supports **email+password**, **magic link**, **Google OAuth**, and **phone OTP**. Each needs a matching Supabase project setting.

## Supabase dashboard

`Project settings → Authentication → URL Configuration`

- **Site URL** → your production origin (also add `http://localhost:3000` under **Additional redirect URLs** for dev)
- **Redirect URLs** → add `${SITE_URL}/auth/callback`

## Email + password / magic link
Enabled by default. In `Authentication → Providers → Email`, keep "Confirm email" ON — the signup flow expects a confirmation click that hits `/auth/callback`.

## Google OAuth

1. Google Cloud Console → OAuth consent screen, then Credentials → "Create OAuth client ID" (Web application).
2. Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Copy Client ID & Secret into `Authentication → Providers → Google` in Supabase.
4. Enable the provider.

## Phone OTP

Phone OTP requires an SMS provider. Supabase supports Twilio and MessageBird out of the box; MSG91 is a good India-side option and is available via Twilio's compatibility API.

`Authentication → Providers → Phone` → enter your provider's SID + auth token + sender. Costs are pass-through per SMS.

**Testing without an SMS bill**: enable the built-in test OTP in Supabase (`Authentication → Providers → Phone → Test OTP`) and add a test phone/OTP pair. That skips real SMS while the flow itself remains identical.

## Making the first admin

After you sign up with the email you plan to use for admin:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Then hit `/admin` — middleware will now let you in (Phase 15 builds the admin UI itself).

## Route protection map (see `middleware.ts`)

| Prefix              | Requires        |
|---------------------|-----------------|
| `/profile/*`, `/orders/*`, `/checkout/*`, `/wishlist/*` | Signed in |
| `/admin/*`          | Signed in AND `role IN ('admin','staff')` |
| everything else     | Public |

`/api/public/*` and static assets are excluded from the middleware.

## Files added this phase

```
middleware.ts
lib/auth.ts
app/auth/callback/route.ts
app/api/auth/signout/route.ts
app/login/page.tsx
app/signup/page.tsx
app/forgot-password/page.tsx
app/reset-password/page.tsx
app/profile/page.tsx
app/profile/ProfileForm.tsx
app/profile/SignOutButton.tsx
app/profile/addresses/page.tsx
app/profile/addresses/AddressList.tsx
app/profile/addresses/actions.ts
components/auth/AuthCard.tsx
components/auth/LoginForms.tsx
components/NavSearch.tsx           (extracted from Navbar so it can stay client)
components/Navbar.tsx              (rewritten as async server component; shows initial when signed in)
```
