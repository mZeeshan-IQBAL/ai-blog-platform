// src/app/page.js
import Hero from "@/components/homepage/Hero";
import Features from "@/components/homepage/Features";
import Stats from "@/components/homepage/Stats";
import Testimonials from "@/components/homepage/Testimonials";
import Trending from "@/components/homepage/Trending";

export const metadata = {
  title: "BlogSphere | Write, Read & Share Amazing Stories",
  description: "Join thousands of writers and readers sharing stories, insights, and ideas. Discover compelling content and connect with a vibrant community of storytellers.",
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
