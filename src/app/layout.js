// src/app/layout.js
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { auth } from "@/lib/auth";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "BlogSphere",
  description: "Where great stories come to life. Write, read, and connect with storytellers worldwide.",
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "").startsWith("http")
      ? (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL)
      : (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "BlogSphere",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${inter.variable} bg-background text-foreground min-h-screen`}>
        <Providers session={session}>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
