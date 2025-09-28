# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project summary
- Full-stack blogging platform built on Next.js (App Router) with MongoDB (Mongoose), NextAuth, Tailwind CSS, Pusher (realtime), Cloudinary (uploads), Resend (email), optional Redis caching, and AI endpoints powered via OpenRouter.
- Source lives under src/, with the App Router at src/app.

Common commands (PowerShell / cross-platform)
- Dev server: npm run dev
- Build: npm run build
- Start (after build): npm start
- Lint all: npm run lint
- Format all: npm run format
- Lint a single file: npx eslint src/app/page.js
- Format a single file: npx prettier --write src/app/page.js
- Install git hooks (once, after npm i): npm run prepare

Notes about tests
- No test runner or npm test script is configured in package.json.

Environment configuration
Create a .env.local in the repo root. The code references these variables (names only shown):
- Database: MONGODB_URI
- Auth (NextAuth): NEXTAUTH_SECRET, (commonly also NEXTAUTH_URL in production)
- OAuth: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_ID, GITHUB_SECRET
- Realtime (server): PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER
- Realtime (client): NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER
- Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- Email (Resend): RESEND_API_KEY, EMAIL_FROM (optional; defaults to onboarding@resend.dev)
- Redis (optional): REDIS_URL
- OpenRouter (AI): OPENROUTER_API_KEY

Important behavior and gotchas
- Resend dev redirect: In non-production, outbound emails are redirected to zeshansos600@gmail.com (see src/lib/resend.js). Change/remove if needed for your workflow.
- Optional Redis: Caching helpers are no-ops if REDIS_URL is not set (see src/lib/redis.js).
- Cloudinary config logs: On server start, missing Cloudinary envs are logged clearly (see src/lib/cloudinary.js).
- Mongoose connects lazily and logs status (see src/lib/db.js).

Architecture and structure
- App Router (src/app)
  - API routes: src/app/api/* provide stateless endpoints for auth, AI (ai-suggest, chatbot), and feature modules (comments/likes/etc.).
  - Pages and layouts are organized under segment folders, using server components by default.
- Data layer (MongoDB via Mongoose)
  - Connection: src/lib/db.js manages a singleton connection to process.env.MONGODB_URI.
  - Models: src/models/* define User, Post, Comment, etc. (imported via the @ alias).
- Authentication (NextAuth)
  - Options: src/lib/auth.js configures Credentials, Google, and GitHub providers.
  - Session JWT contains id, role, and normalized providerId.
  - The API route entrypoint is at src/app/api/auth/[...nextauth]/route.js.
- Realtime (Pusher)
  - Server SDK: src/lib/pusherServer.js uses server-side credentials.
  - Client SDK: src/lib/pusherClient.js uses NEXT_PUBLIC_* vars and sets up connection event logging.
- AI endpoints (OpenRouter)
  - src/app/api/ai-suggest/route.js and src/app/api/chatbot/route.js call OpenRouter using OPENROUTER_API_KEY. The default model is deepseek/deepseek-chat-v3.1:free (swap as needed).
- Media uploads (Cloudinary)
  - src/lib/cloudinary.js configures Cloudinary and provides uploadImage(). next.config.js whitelists cloudinary and common avatar domains under images.remotePatterns.
- Email (Resend)
  - src/lib/resend.js initializes the Resend client lazily and logs detailed send attempts; uses EMAIL_FROM or a default.
- Caching (optional Redis)
  - src/lib/redis.js exposes safe helpers (cacheGet/cacheSet/etc.) that no-op if REDIS_URL is not provided.

Tooling and config
- ESLint: Flat config extending next/core-web-vitals (see eslint.config.mjs). The npm script runs eslint . with max-warnings=0. Use npx eslint <path> to target individual files.
- Prettier: npm run format formats the repository; lint-staged runs prettier and eslint on staged files.
- Next.js config: next.config.js
  - images.remotePatterns allows res.cloudinary.com, lh3.googleusercontent.com, avatars.githubusercontent.com.
  - Webpack alias: '@' → <repo>/src (import like "@/lib/db").
  - output: 'standalone' for deployment-friendly builds (e.g., Docker).

Repository guidance for future agents
- Prefer '@/...' imports (via alias set in next.config.js) over relative deep paths.
- Server-only secrets must not be prefixed with NEXT_PUBLIC_. Only expose keys needed on the client with NEXT_PUBLIC_.
- When working on email flows locally, remember that non-production sends are redirected (see Resend note above).

External rules and docs surfaced
- README.md includes feature/stack overview and a high-level directory sketch. This WARP.md consolidates the actionable parts (commands, envs, architecture). No CLAUDE.md, Cursor rules, or Copilot instructions were found.
