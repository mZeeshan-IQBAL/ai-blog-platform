// src/lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";

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
        const { email, name } = credentials;

        let user = await User.findOne({ email });
        if (!user) {
          if (!name) throw new Error("Name is required for signup.");
          user = await User.create({
            email,
            name,
            role: "USER",
            provider: "credentials",
            providerId: email, // stable ID for credentials
          });
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
      // 💡 Always build full session.user object from token
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