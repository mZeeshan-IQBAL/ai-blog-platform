// src/app/layout.js
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { auth } from "@/lib/auth"; // Import your auth function

export const metadata = {
  title: "AI Knowledge Hub",
  description: "AI-powered community knowledge sharing platform.",
};

export default async function RootLayout({ children }) {
  // ✅ Fetch session server-side
  const session = await auth();
  
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {/* ✅ Pass session to Providers */}
        <Providers session={session}>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}