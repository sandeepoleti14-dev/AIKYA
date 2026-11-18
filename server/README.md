# Aikya Community API

The community API uses MongoDB for accounts, submissions, posts, reviews, reports, moderation logs, and server-side sessions. The browser never connects directly to MongoDB.

## Local configuration

1. Copy `server/.env.example` to `server/.env`.
2. Set `MONGODB_URI` to a local MongoDB instance or your MongoDB Atlas connection string.
3. Replace `SESSION_SECRET` with a random value of at least 32 characters. Keep `server/.env` private; never commit it or put database credentials in frontend variables.
4. Start the API and Vite frontend in separate terminals:

   ```text
   npm run server:dev
   npm run dev
   ```

The Vite development server proxies `/api` and `/uploads` to the API on port 3001. `npm run build` builds the frontend and typechecks/builds the API.

## Accounts and moderation

- Accounts use bcrypt password hashes and HTTP-only, same-site server sessions persisted in MongoDB.
- New accounts have the `member` role. Register the account that should moderate Aikya, then promote that account using the private database URI:

  ```text
  npm run server:promote-admin -- admin@example.com
  ```

- This command changes only an existing user's server-side role. There is no public admin signup or role-edit API.
- Every user submission starts as `PENDING_REVIEW`. The public feed only queries approved submissions that have a visible community post.
- Website reviews are unique per account and remain hidden until approval. Editing a review returns it to `PENDING_REVIEW`.
- Moderation decisions and reasons are recorded in `ModerationLog`; reports are queued for admins.

## Security boundaries

- API mutations require the configured application origin; sessions use HTTP-only, same-site cookies.
- Password, submission, review, report, and image routes have rate limits.
- URL fields accept only public HTTP/HTTPS destinations. The server does not fetch submitted URLs or follow redirects. Admins open links manually in a new tab; pages are never embedded.
- Descriptions and reviews are stored as text and rendered by React as text, not injected HTML.
- Uploaded photos/posters are limited to JPEG, PNG, or WebP, checked by file signature, assigned random names, and capped at 5 MB.
- Email is excluded from all public profile and post responses. Public profile fields have explicit visibility controls.

## Deployment notes

Set `MONGODB_URI`, `SESSION_SECRET`, `APP_ORIGIN`, and `NODE_ENV` in the server's secret environment. Deploy the API behind HTTPS on the same site or configure a strict trusted origin. The current image upload directory is local disk; production deployments need a persistent volume or an approved object-storage adapter before enabling uploads. Do not expose a MongoDB URI or session secret to Vite/client-side `VITE_*` settings.

Before production, add an email verification and password recovery provider, shared rate-limit storage for multiple API instances, and persistent upload storage. The current scaffold does not send account emails.
