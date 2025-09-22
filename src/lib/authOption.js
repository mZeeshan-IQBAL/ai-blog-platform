// lib/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

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
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google" || account.provider === "github") {
        try {
          await connectToDB();
          
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            existingUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              role: "USER",
              provider: account.provider,
              providerId: account.providerAccountId,
            });
          }
          
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
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};