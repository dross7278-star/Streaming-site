# StellarStream

A React + Firebase streaming platform inspired by premium OTT interfaces. It includes a cinematic landing page, category rails, a Firebase-backed auth surface, watchlist persistence, subscription plan selection, configurable Stripe/PayPal payment entry points, and live newest-animation data from TMDB.

## Stack

- React 19 + Vite
- Firebase Auth + Firestore
- CSS animations and scroll reveals
- Vercel-ready static deployment

## Local setup

1. Run `npm install`
2. Copy `.env.example` to `.env`
3. Add your Firebase web app credentials
4. Add one or both payment URLs:
   - `VITE_STRIPE_PAYMENT_LINK`
   - `VITE_PAYPAL_CHECKOUT_URL`
5. Add your TMDB API key:
   - `VITE_TMDB_API_KEY`
6. Run `npm run dev`

## Firebase data model

Create a Firestore database and allow authenticated users to read and write their own watchlist document.

- Collection: `watchlists`
- Document ID: Firebase user UID
- Shape: `{ items: string[] }`

## Deploy to Vercel

1. Import the GitHub repo into Vercel
2. Add the same environment variables from `.env`
3. Deploy

## Notes

- If Firebase env vars are missing, auth falls back to a local demo mode so the UI still works.
- If payment URLs are missing, the UI shows the payment options but disables launch until the checkout links are configured.
- If `VITE_TMDB_API_KEY` is missing or invalid, the app falls back to the local built-in catalog.
- This project is intentionally Netflix-inspired rather than reusing Netflix branding or proprietary assets.
