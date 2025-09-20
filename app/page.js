import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/homepage/Hero";
import Features from "@/components/homepage/Features";
import Stats from "@/components/homepage/Stats";
import Testimonials from "@/components/homepage/Testimonials";
import Trending from "@/components/homepage/Trending";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "AI Knowledge Hub | Share & Discover AI Insights",
  description: "Community-driven platform powered by AI to share knowledge.",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Features />
        <Stats />
        <Testimonials />
        <Trending />
      </main>
      <Footer />
    </>
  );
}