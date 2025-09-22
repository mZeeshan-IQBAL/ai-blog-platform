// src/app/layout.js
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
export const metadata = {
  title: "AI Knowledge Hub",
  description: "AI-powered community knowledge sharing platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>
          <Navbar />  {/* ✅ Appears on every route */}
          {children}
          <Footer />  {/* ✅ Appears on every route */}
        </Providers>
      </body>
    </html>
  );
}
