// lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
//import EmailProvider from "next-auth/providers/email";

import { connectToDB } from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text", optional: true },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDB();
        const { email, name } = credentials;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
          if (!name) throw new Error("Name is required for signup.");
          user = await User.create({ email, name, role: "USER" });
        }

        return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),

    /*EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
    })*/
  ],

  callbacks: {
    // ✅ Handle OAuth user creation/lookup
    async signIn({ user, account, profile }) {
      // Only handle OAuth providers
      if (account.provider === "google" || account.provider === "github") {
        try {
          await connectToDB();
          
          // Check if user exists in our database
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user for OAuth providers
            existingUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              role: "USER",
              provider: account.provider,
              providerId: account.providerAccountId,
            });
          }
          
          // Update user object with database info
          user.id = existingUser._id.toString();
          user.role = existingUser.role;
          
        } catch (error) {
          console.error("❌ Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      
      // ✅ Debug: Log session info
      console.log("📋 Session user info:", {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      });
      
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};