# Aikya

Aikya is an India-first platform for discovering technology events, contests, learning paths, and India-based opportunities. Its community features let students share opportunities, contribute reviews, and discover listings approved by Aikya moderators.

> Discover together. Share opportunities. Grow together.

## Features

- **Opportunity discovery:** Public Pretalx events are filtered for India-related listings in the Asia/Kolkata time zone. Upcoming Codeforces online contests are listed separately. Other event, hackathon, and learning providers are linked through their official catalogs.
- **India-focused jobs:** GitLab and HackerRank jobs are retrieved from their public Greenhouse boards, filtered for India, and linked to the official application pages.
- **Learning roadmaps:** Browse structured learning paths and track progress.
- **Aikya Community:** Browse opportunities shared by members, filter by category and details, and share new listings for review.
- **Profiles and contributions:** Manage a community profile and view public contributor information while keeping private account details private.
- **Moderation:** New opportunities and website reviews require moderator approval before they appear publicly. Admin actions are recorded for review.
- **Community reviews:** The homepage displays approved reviews only; it does not use sample testimonials.

## Technology

- React, TypeScript, Vite, and Tailwind CSS
- Express API with MongoDB/Mongoose
- HTTP-only server sessions and bcrypt password hashing

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- MongoDB (local instance or MongoDB Atlas) for accounts and community features

## Run locally

1. Clone the repository and install dependencies:

   ```sh
   git clone https://github.com/sandeepoleti14-dev/AIKYA.git
   cd AIKYA
   npm install
   ```

2. Configure the API environment. In PowerShell:

   ```powershell
   Copy-Item server\.env.example server\.env
   ```

   Or in macOS/Linux:

   ```sh
   cp server/.env.example server/.env
   ```

3. Edit `server/.env` and set:

   - `MONGODB_URI` to your MongoDB connection string.
   - `SESSION_SECRET` to a random secret of at least 32 characters.
   - `APP_ORIGIN` to the exact origin used by the frontend. The default is `http://127.0.0.1:5173`.

   Keep `server/.env` private. Never put MongoDB credentials or session secrets in frontend variables or commit them.

4. Start the API and frontend in separate terminals from the project directory:

   ```sh
   npm run server:dev
   ```

   ```sh
   npm run dev
   ```

   Open the Vite URL printed in the frontend terminal (normally `http://127.0.0.1:5173`). The Vite server proxies `/api` and `/uploads` requests to the API on port `3001`.

The public discovery pages can be explored without a MongoDB connection, but account, submission, review, and moderation features require the API and MongoDB to be configured and running.

## Admin setup

Register the account that should manage community submissions. Then, with the API environment configured, promote that existing account:

```sh
npm run server:promote-admin -- admin@example.com
```

Admin promotion is a server-side operation; there is no public admin signup or role-edit endpoint.

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite frontend |
| `npm run server:dev` | Start the API in watch mode |
| `npm run typecheck` | Typecheck frontend and API |
| `npm run lint` | Run ESLint |
| `npm run test:server` | Run API validation tests |
| `npm run build` | Build the frontend and API |
| `npm run preview` | Preview the production frontend build |

## Community safety and privacy

- Community submissions begin in `PENDING_REVIEW`; only approved listings are shown in the public community feed.
- Review edits return to moderation, and public review ratings use approved reviews only.
- Submitted URLs must use HTTP or HTTPS. The server does not fetch or embed submitted websites.
- Descriptions and reviews are rendered as text, not executable HTML.
- Public responses omit email addresses and respect profile visibility settings.
- Password, submission, review, report, and image endpoints have rate limits.

For the API setup, moderation workflow, security details, and deployment notes, see [server/README.md](server/README.md).

## Production notes

Before deploying, configure HTTPS and production secrets. The current scaffold stores uploaded images on local disk and uses in-process rate limiting; production deployments need persistent image storage and shared rate-limit storage. Email verification and password recovery are not configured.
