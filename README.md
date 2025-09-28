# 🚀 BlogSphere - Storytelling Platform

A **full-stack AI-enhanced storytelling platform** built with **Next.js 13 (App Router)**, **MongoDB**, **NextAuth.js**, and **TailwindCSS**.  
Includes rich text editing, real-time engagement with **Pusher**, file uploads with **Cloudinary**, AI writing assistance, and comprehensive analytics dashboard.

---

## ✨ Features

- 🔐 **Authentication**
  - Email/Password (Credentials Provider)
  - Google OAuth
  - GitHub OAuth
  - Email Magic Links (Resend)

- 📝 **Story Publishing**
  - Create/Post stories with **TipTap rich editor**
  - Beautiful typography and formatting
  - Cover images (via Cloudinary)
  - Smart categorization and tagging

- 💬 **Realtime Engagement**
  - Likes 👍
  - Comments 💬
  - Live updates via **Pusher**

- 📊 **Analytics Dashboard**
  - Views per post
  - Most viewed / liked
  - Total posts, users, comments
  - Chart visualization (React-ChartJS-2)

- 🔍 **Story Discovery**
  - Smart content search powered by **MongoDB Atlas Search**
  - Genre and author filtering

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