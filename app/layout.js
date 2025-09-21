// app/layout.js
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "AI Knowledge Hub",
  description: "AI-powered community knowledge sharing platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}