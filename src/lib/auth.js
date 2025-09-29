// src/lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        await connectToDB();
        const { email, name, password } = credentials || {};
        if (!email || !password) {
          throw new Error("Email and password are required.");
        }

        let user = await User.findOne({ email });

        // Sign up path: create a new credentials user
        if (!user) {
          if (!name) throw new Error("Name is required for signup.");
          const passwordHash = await bcrypt.hash(password, 10);
          user = await User.create({
            email,
            name,
            role: "USER",
            provider: "credentials",
            providerId: email, // stable ID for credentials
            passwordHash,
          });
        } else {
          // Existing user: if password is set, verify it. If not set, set it now.
          if (user.passwordHash) {
            const ok = await bcrypt.compare(password, user.passwordHash);
            if (!ok) throw new Error("Invalid email or password.");
          } else {
            // Allow setting password for an existing credentials-less account
            const passwordHash = await bcrypt.hash(password, 10);
            user.passwordHash = passwordHash;
            if (!user.provider) user.provider = "credentials";
            if (!user.providerId) user.providerId = email;
            await user.save();
          }
        }

        return {
          id: user._id.toString(),
          providerId: user.providerId,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        console.log('🔐 signIn callback triggered');
        console.log('👤 User:', user);
        console.log('📱 Account:', account);
        console.log('👤 Profile:', profile);
        
        // Skip for credentials provider as it's handled in authorize
        if (account?.provider === 'credentials') {
          console.log('✅ Credentials sign-in, skipping user creation');
          return true;
        }

        if (account?.provider && profile) {
          await connectToDB();
          
          const providerId = `${account.provider}-${profile.id}`;
          console.log('🔍 Looking for user with providerId:', providerId);
          
          let existingUser = await User.findOne({ 
            $or: [
              { providerId },
              { email: profile.email || user.email }
            ]
          });

          if (!existingUser) {
            console.log('👥 Creating new user for OAuth sign-in');
            const newUser = await User.create({
              name: profile.name || user.name,
              email: profile.email || user.email,
              image: profile.picture || profile.avatar_url || user.image,
              provider: account.provider,
              providerId,
              role: 'USER',
            });
            
            console.log('✅ New user created:', newUser._id);
            
            // Update user object for JWT callback
            user.id = newUser._id.toString();
            user.providerId = providerId;
            user.role = 'USER';
          } else {
            console.log('👤 Existing user found:', existingUser._id);
            
            // Update existing user info
            existingUser.name = profile.name || user.name || existingUser.name;
            existingUser.image = profile.picture || profile.avatar_url || user.image || existingUser.image;
            if (!existingUser.providerId) {
              existingUser.providerId = providerId;
            }
            await existingUser.save();
            
            // Update user object for JWT callback
            user.id = existingUser._id.toString();
            user.providerId = existingUser.providerId;
            user.role = existingUser.role;
          }
        }

        return true;
      } catch (error) {
        console.error('❌ signIn callback error:', error);
        return false;
      }
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "USER";
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;

        // normalize providerId
        if (user.providerId) {
          token.providerId = user.providerId;
        } else if (account?.provider && profile?.id) {
          token.providerId = `${account.provider}-${profile.id}`;
        } else {
          token.providerId = user.id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      // 💡 Keep session in sync with DB (ensures latest avatar shows everywhere)
      try {
        if (token?.id) {
          await connectToDB();
          const dbUser = await User.findById(token.id).select("name email image role providerId");
          if (dbUser) {
            token.name = dbUser.name || token.name;
            token.email = dbUser.email || token.email;
            token.image = dbUser.image || token.image;
            token.role = dbUser.role || token.role;
            token.providerId = dbUser.providerId || token.providerId;
          }
        }
      } catch (e) {
        console.warn("session callback DB sync failed:", e?.message || e);
      }

      session.user = {
        id: token.id || null,
        providerId: token.providerId || null,
        role: token.role || "USER",
        name: token.name || session.user?.name || null,
        email: token.email || session.user?.email || null,
        image: token.image || session.user?.image || null,
      };

      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authOptions);