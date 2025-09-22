// src/app/page.js
import Hero from "@/components/homepage/Hero";
import Features from "@/components/homepage/Features";
import Stats from "@/components/homepage/Stats";
import Testimonials from "@/components/homepage/Testimonials";
import Trending from "@/components/homepage/Trending";

export const metadata = {
  title: "AI Knowledge Hub | Share & Discover AI Insights",
  description: "Community-driven platform powered by AI to share knowledge.",
};

export default function HomePage() {
  return (
    <main className="pt-16">
      <Hero />
      <Features />
      <Stats />
      <Testimonials />
      <Trending />
    </main>
  );
}
