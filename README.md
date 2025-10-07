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
- **Payments:** Stripe & PayPal integration

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

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** (local or MongoDB Atlas)
- **Git**

### 1. Clone Repository

```bash
git clone <repository-url>
cd ai-blog-platform
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ai-blog-platform
# or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-blog-platform

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret

# Email Provider (Resend)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Pusher (for real-time features)
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster

# Stripe Payment Integration
STRIPE_PUBLIC_KEY=pk_test_your-stripe-public-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# PayPal Payment Integration
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # Use 'live' for production
```

### 4. Database Setup

If using local MongoDB:
```bash
# Start MongoDB service
sudo service mongod start  # Linux
brew services start mongodb-community  # macOS
```

For MongoDB Atlas, create a cluster and get your connection string.

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 💳 Payment Integration Setup

### Stripe Configuration

1. **Create Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Get API Keys**: 
   - Go to Developers > API Keys
   - Copy your **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)
3. **Webhook Setup**:
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/billing/webhooks/stripe`
   - Select events: `checkout.session.completed`, `invoice.payment_succeeded`
   - Copy the **Signing secret** (`whsec_...`)

### PayPal Configuration

1. **Create PayPal Developer Account**: Sign up at [developer.paypal.com](https://developer.paypal.com)
2. **Create Application**:
   - Go to My Apps & Credentials
   - Click "Create App"
   - Choose "Default Application" and "Sandbox" (for testing)
3. **Get API Credentials**:
   - Copy your **Client ID** and **Client Secret**
   - Set `PAYPAL_MODE=sandbox` for testing, `PAYPAL_MODE=live` for production
4. **Plan Pricing**: 
   - PayPal plans are configured in `src/lib/paypal.js`
   - Adjust USD pricing to match your business model
   - Note: PayPal may not support PKR directly

### Testing Payment Integration

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`

**PayPal Sandbox:**
- Use PayPal sandbox accounts for testing
- Create test buyer and seller accounts in PayPal Developer Dashboard

---

## 🔧 Additional Service Setup

### Cloudinary (Image Uploads)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your **Cloud Name**, **API Key**, and **API Secret** from the Dashboard
3. Configure upload presets for optimized image handling

### Pusher (Real-time Features)
1. Create account at [pusher.com](https://pusher.com)
2. Create a new Channels app
3. Get your **App ID**, **Key**, **Secret**, and **Cluster**

### Resend (Email Service)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the Dashboard
3. Configure your sending domain

---
