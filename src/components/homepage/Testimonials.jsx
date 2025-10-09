// components/homepage/Testimonials.jsx
'use client';
import { useMemo } from 'react';

const data = [
  {
    name: 'Sarah M.',
    initials: 'SM',
    title: 'My blog went from 0 to 50K monthly readers',
    text: 'BlogSphere\'s AI suggestions helped me find my unique voice. The analytics showed me exactly what my audience wanted, and now I\'m making a living from my passion.',
    rating: 5,
  },
  {
    name: 'David L.',
    initials: 'DL',
    title: 'Finally, a platform that gets creators',
    text: "The community features are incredible. I've connected with readers who became lifelong fans. The real-time engagement keeps me motivated to write more.",
    rating: 5,
  },
  {
    name: 'Maya P.',
    initials: 'MP',
    title: 'AI writing assistant is a game-changer',
    text: "I used to stare at blank pages for hours. Now BlogSphere\'s AI gives me the perfect starting point, and I can focus on crafting stories that resonate.",
    rating: 5,
  },
  {
    name: 'James W.',
    initials: 'JW',
    title: 'Turned my hobby into a business',
    text: 'The growth analytics helped me understand which topics performed best. Within 6 months, I was getting brand partnership offers. BlogSphere changed my life.',
    rating: 5,
  },
  {
    name: 'Elena R.',
    initials: 'ER',
    title: 'Beautiful design, powerful features',
    text: 'The editor is so intuitive and the published posts look professional. My readers always compliment how clean and readable my blog looks.',
    rating: 4,
  },
  {
    name: 'Alex C.',
    initials: 'AC',
    title: 'Best decision for my content strategy',
    text: 'Switched from WordPress and never looked back. The AI content suggestions and built-in SEO optimization doubled my organic traffic in 3 months.',
    rating: 5,
  },
];

const Stars = ({ value = 5, size = 14 }) => (
  <div className="flex items-center gap-1" aria-label={`${value}/5 Stars`}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i < value ? 'currentColor' : 'none'} className={i < value ? 'text-yellow-400' : 'text-yellow-300'} stroke="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

function Card({ t }) {
  const avatarColor = useMemo(() => {
    const colors = ['bg-primary/10 text-primary','bg-purple-100 text-purple-700','bg-pink-100 text-pink-700','bg-emerald-100 text-emerald-700','bg-amber-100 text-amber-700'];
    return colors[(t.initials.charCodeAt(0) + t.initials.charCodeAt(1)) % colors.length];
  }, [t.initials]);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColor}`}>{t.initials}</div>
          <div className="font-semibold text-foreground">{t.name}</div>
        </div>
        <div className="text-primary">★</div>
      </div>
      <div>
        <div className="font-semibold text-sm text-foreground mb-1">{t.title}</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t.rating}/5 Stars</span>
        <Stars value={t.rating} size={12} />
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-muted-foreground">Trusted By <span className="brand-gradient-text font-bold">50,000+</span> Content Creators.</p>
          <h2 className="heading-responsive font-extrabold mt-2">
            Real stories from real bloggers on <span className="brand-gradient-text">BlogSphere</span>
          </h2>
          <div className="mt-6">
            <p className="text-sm font-semibold text-foreground">Average User Rating</p>
            <div className="mt-2 flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">4.9/5 Stars</span>
              <Stars value={5} />
              <span>(2,847 reviews)</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
