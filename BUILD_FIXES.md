# Build Fixes Documentation

## Issue: Port 3000 Build Error

### Problem Description
During Vercel deployment, the build process was failing with the following error:
```
ForYou fetch error: B [Error]: Dynamic server usage: no-store fetch http://localhost:3000/api/feed /
```

### Root Cause
The `ForYou` component in `src/components/homepage/ForYou.jsx` was making HTTP requests to `localhost:3000` during the build process. This doesn't work in the Vercel build environment because:

1. `localhost` doesn't exist in the build container
2. The server isn't running during static generation
3. HTTP requests during build time should be avoided for performance reasons

### Solution Implemented
**Before (Problematic Code):**
```jsx
const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/feed`, { cache: 'no-store' });
const posts = await res.json();
```

**After (Fixed Code):**
```jsx
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";

// Direct database fetch instead of HTTP request
await connectToDB();
const posts = await Post.find({ 
  published: true, 
  $or: [
    { scheduledAt: null }, 
    { scheduledAt: { $lte: new Date() } }
  ] 
})
.sort({ createdAt: -1 })
.limit(6)
.lean();
```

### Benefits of the Fix
1. **Build Reliability**: Eliminates dependency on HTTP server during build
2. **Performance**: Direct database queries are faster than HTTP requests
3. **Environment Independence**: Works in any build environment
4. **Code Simplification**: Removes HTTP request overhead

### Environment Variables
For production deployments, ensure these environment variables are set in Vercel:

```bash
# Production URLs (replace with your actual domain)
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# All other environment variables from .env.example
```

### Verification
✅ Build completes without errors
✅ Static generation works properly
✅ Component renders correctly
✅ Database connections work during build time

### Additional Notes
- The same pattern should be applied to any other components making HTTP requests during build time
- Consider using Server Components for data fetching when possible
- Always test builds locally before deploying to production

## Future Considerations
- Implement proper error boundaries for database connection issues
- Consider implementing data caching for frequently accessed content
- Monitor build performance and optimize database queries if needed