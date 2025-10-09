// src/lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { logSecurityEvent } from "@/lib/securityLogger";
import { implementBruteForceProtection } from "@/lib/rateLimit";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials, req) {
        await connectToDB();
        const { email, name, password } = credentials || {};
        
        // 🔒 SECURITY: Get client IP for logging
        const clientIP = req?.headers?.['x-forwarded-for'] || 
                        req?.headers?.['x-real-ip'] || 
                        req?.connection?.remoteAddress || 'unknown';
        
        if (!email || !password) {
          await logSecurityEvent({
            event: 'LOGIN_FAILED',
            identifier: clientIP,
            details: {
              reason: 'Missing email or password',
              email: email || 'not_provided',
              userAgent: req?.headers?.['user-agent'],
            },
            severity: 'LOW',
            source: 'auth_credentials',
            userAgent: req?.headers?.['user-agent'],
            ipAddress: clientIP,
          });
          throw new Error("Email and password are required.");
        }

        // 🔒 SECURITY: Password complexity validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (password && !passwordRegex.test(password)) {
          await logSecurityEvent({
            event: 'SIGNUP_SUSPICIOUS',
            identifier: clientIP,
            details: {
              reason: 'Weak password used',
              email,
              passwordLength: password.length,
            },
            severity: 'MEDIUM',
            source: 'auth_credentials',
            userAgent: req?.headers?.['user-agent'],
            ipAddress: clientIP,
          });
          throw new Error("Password must be at least 8 characters with uppercase, lowercase, number, and special character.");
        }

        let user = await User.findOne({ email });

        // Sign up path: create a new credentials user
        if (!user) {
          if (!name) {
            await logSecurityEvent({
              event: 'SIGNUP_SUSPICIOUS',
              identifier: clientIP,
              details: {
                reason: 'Missing name for signup',
                email,
              },
              severity: 'LOW',
              source: 'auth_credentials',
              userAgent: req?.headers?.['user-agent'],
              ipAddress: clientIP,
            });
            throw new Error("Name is required for signup.");
          }
          
          // 🔒 SECURITY: Use stronger password hashing (12 rounds)
          const passwordHash = await bcrypt.hash(password, 12);
          user = await User.create({
            email,
            name,
            role: "USER",
            provider: "credentials",
            providerId: email, // stable ID for credentials
            passwordHash,
            // 🔒 SECURITY: Add security tracking fields
            lastLogin: new Date(),
            loginCount: 1,
            failedAttempts: 0,
            accountLockedUntil: null,
            ipAddresses: [clientIP],
          });
          
          // Log successful signup
          await logSecurityEvent({
            event: 'SIGNUP_SUCCESS',
            identifier: clientIP,
            userId: user._id.toString(),
            details: {
              email,
              name,
              provider: 'credentials',
            },
            severity: 'LOW',
            source: 'auth_credentials',
            userAgent: req?.headers?.['user-agent'],
            ipAddress: clientIP,
          });
        } else {
          // 🔒 SECURITY: Check for account lockout
          if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
            const timeRemaining = Math.ceil((user.accountLockedUntil - new Date()) / 1000 / 60);
            await logSecurityEvent({
              event: 'LOGIN_FAILED',
              identifier: clientIP,
              userId: user._id.toString(),
              details: {
                reason: 'Account locked',
                email,
                timeRemaining: `${timeRemaining} minutes`,
                failedAttempts: user.failedAttempts || 0,
              },
              severity: 'HIGH',
              source: 'auth_credentials',
              userAgent: req?.headers?.['user-agent'],
              ipAddress: clientIP,
            });
            throw new Error(`Account locked. Try again in ${timeRemaining} minutes.`);
          }
          
          // 🔒 SECURITY: Brute force protection
          const failedAttempts = user.failedAttempts || 0;
          const bruteForceResult = await implementBruteForceProtection(clientIP, failedAttempts);
          if (bruteForceResult.protected) {
            throw new Error(`Too many failed attempts. Try again in ${Math.ceil(bruteForceResult.backoffTime / 60)} minutes.`);
          }

          // Existing user: if password is set, verify it. If not set, set it now.
          if (user.passwordHash) {
            const ok = await bcrypt.compare(password, user.passwordHash);
            if (!ok) {
              // 🔒 SECURITY: Increment failed attempts and implement account lockout
              user.failedAttempts = (user.failedAttempts || 0) + 1;
              user.lastFailedLogin = new Date();
              
              // Lock account after 5 failed attempts
              if (user.failedAttempts >= 5) {
                user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
              }
              
              await user.save();
              
              await logSecurityEvent({
                event: 'LOGIN_FAILED',
                identifier: clientIP,
                userId: user._id.toString(),
                details: {
                  reason: 'Invalid password',
                  email,
                  failedAttempts: user.failedAttempts,
                  accountLocked: user.failedAttempts >= 5,
                },
                severity: user.failedAttempts >= 3 ? 'HIGH' : 'MEDIUM',
                source: 'auth_credentials',
                userAgent: req?.headers?.['user-agent'],
                ipAddress: clientIP,
              });
              
              throw new Error("Invalid email or password.");
            }
            
            // 🔒 SECURITY: Reset failed attempts on successful login
            user.failedAttempts = 0;
            user.accountLockedUntil = null;
            user.lastLogin = new Date();
            user.loginCount = (user.loginCount || 0) + 1;
            
            // Track IP addresses
            if (!user.ipAddresses || !user.ipAddresses.includes(clientIP)) {
              user.ipAddresses = user.ipAddresses || [];
              user.ipAddresses.push(clientIP);
              
              // Keep only last 10 IP addresses
              if (user.ipAddresses.length > 10) {
                user.ipAddresses = user.ipAddresses.slice(-10);
              }
              
              // Log suspicious login from new IP
              if (user.loginCount > 1) {
                await logSecurityEvent({
                  event: 'LOGIN_SUCCESS_SUSPICIOUS',
                  identifier: clientIP,
                  userId: user._id.toString(),
                  details: {
                    reason: 'Login from new IP address',
                    email,
                    newIP: clientIP,
                    previousIPs: user.ipAddresses.slice(0, -1),
                  },
                  severity: 'MEDIUM',
                  source: 'auth_credentials',
                  userAgent: req?.headers?.['user-agent'],
                  ipAddress: clientIP,
                });
              }
            }
            
            await user.save();
          } else {
            // Allow setting password for an existing credentials-less account
            const passwordHash = await bcrypt.hash(password, 12);
            user.passwordHash = passwordHash;
            if (!user.provider) user.provider = "credentials";
            if (!user.providerId) user.providerId = email;
            user.lastLogin = new Date();
            user.failedAttempts = 0;
            await user.save();
          }
          
          // Log successful login
          await logSecurityEvent({
            event: 'LOGIN_SUCCESS',
            identifier: clientIP,
            userId: user._id.toString(),
            details: {
              email,
              provider: user.provider,
              loginCount: user.loginCount,
            },
            severity: 'LOW',
            source: 'auth_credentials',
            userAgent: req?.headers?.['user-agent'],
            ipAddress: clientIP,
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