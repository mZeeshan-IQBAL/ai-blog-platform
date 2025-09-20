# 🚀 AI Knowledge Hub Blog Platform

A **full-stack AI-powered blogging platform** built with **Next.js 13 (App Router)**, **MongoDB**, **NextAuth.js**, and **TailwindCSS**.  
Includes rich text editing, real-time comments & likes with **Pusher**, file uploads with **Cloudinary**, AI-powered summaries & tags, and analytics dashboard with **Chart.js**.

---

## ✨ Features

- 🔐 **Authentication**
  - Email/Password (Credentials Provider)
  - Google OAuth
  - GitHub OAuth
  - Email Magic Links (Resend)

- 📝 **Blog System**
  - Create/Post articles with **TipTap rich editor**
  - Markdown rendering
  - Cover image (via Cloudinary)
  - Categories/tags (AI suggested)

- 💬 **Realtime Engagement**
  - Likes 👍
  - Comments 💬
  - Live updates via **Pusher**

- 📊 **Analytics Dashboard**
  - Views per post
  - Most viewed / liked
  - Total posts, users, comments
  - Chart visualization (React-ChartJS-2)

- 🔍 **Search**
  - Full-text search powered by **MongoDB Atlas Search**

- ⚡ **Optimized**
  - Server-side rendering
  - Lean Mongoose queries
  - Stateless API routes

---

## 🛠️ Tech Stack

- **Frontend/SSR:** Next.js `app/` with Server Components
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js
- **Database:** MongoDB (Mongoose ORM)
- **Realtime:** Pusher
- **Uploads:** Cloudinary
- **Search:** MongoDB Atlas Search
- **Cache:** Redis (optional)
- **AI:** Mock AI functions (summarize, tag, rewrite)

---

## 📂 Folder Structure
ai-blog-platform/
│
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.js
│   │   ├── blogs/route.js
│   │   ├── comments/route.js
│   │   ├── likes/route.js
│   │   ├── posts/route.js
│   │   ├── search/route.js
│   │   └── analytics/route.js
│   ├── (auth)/
│   │   ├── signin/page.js
│   │   └── signup/page.js
│   ├── (blog)/
│   │   ├── page.js
│   │   ├── create/page.js
│   │   └── [id]/page.js
│   ├── (dashboard)/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── analytics/page.js
│   ├── (search)/page.js
│   ├── layout.js
│   ├── globals.css
│   ├── providers.js
│   └── page.js
│
├── components/
│   ├── layout/Navbar.jsx
│   ├── layout/Footer.jsx
│   ├── homepage/Hero.jsx
│   ├── homepage/Features.jsx
│   ├── homepage/Stats.jsx
│   ├── homepage/Testimonials.jsx
│   ├── blog/BlogCard.jsx
│   ├── blog/PostHeader.jsx
│   ├── blog/PostContent.jsx
│   ├── blog/PostForm.jsx
│   ├── blog/TagList.jsx
│   ├── editor/TipTapEditor.jsx
│   ├── comments/CommentSection.jsx
│   ├── likes/LikeButton.jsx
│   └── ui/MarkdownRenderer.jsx
│
├── lib/
│   ├── analytics.js
│   ├── api.js
│   ├── auth.js
│   ├── cloudinary.js
│   ├── db.js
│   ├── openai.js
│   ├── pusher.js
│   ├── redis.js
│   └── search.js
│
├── models/
│   ├── User.js
│   ├── Post.js
│   ├── Comment.js
│   └── BlogPost.js
│
├── public/placeholder.jpg
├── config/site.config.js
├── config/seo.config.js
├── .env.local (NOT committed)
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md