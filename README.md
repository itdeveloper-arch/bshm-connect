# BSHM Connect

BSHM Connect is a modern student communication and concern portal for the Bachelor of Science in Hospitality Management.

## ✨ Features
- **Public Landing Page**: Hero section, Announcement feed, Concern submission form (with Anonymous toggle), Events calendar, Officers directory, and responsive navigation.
- **Staff Portal**: Officer and Department Adviser access.
- **Interactive Dashboard**:
  - Live concern count metrics (Total, Pending, Resolved)
  - Inbox table with filtering & detail view modal
  - Status updates (`Received`, `Under Review`, `Resolved`)
  - Announcement management for authorized staff
- **Persistence**: Supabase cloud database with `localStorage` fallback for local development without environment variables.
- **Vercel Ready**: Includes `vercel.json` rewrite configuration for seamless Single Page Application (SPA) routing.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

## ☁️ Supabase Setup
1. Create a Supabase project.
2. Open the Supabase SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.example` to `.env.local`.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the public values from Supabase project settings.
5. Install the new dependency and start the app:
```bash
npm install
npm run dev
```

Cloud reads and concern submissions are enabled after configuration. Staff writes require Supabase Auth and role-based policies before they are enabled. Never expose the Supabase service-role key in this frontend.

The existing browser login is a development placeholder. For production, create staff users with Supabase Auth and replace the placeholder login with server-validated Auth sessions.

## 🌐 Deploying to Vercel
1. Push this repository to GitHub / GitLab / Bitbucket.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. Framework Preset will automatically detect **Vite**.
4. Click **Deploy**!

