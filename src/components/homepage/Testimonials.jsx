// components/homepage/Testimonials.jsx
'use client';
import { useMemo } from 'react';

const data = [
  {
    name: 'Lorette F.',
    initials: 'LF',
    title: 'Saving Time and Increase Production',
    text: 'Writing various types of content with the AI Writer allows me to expand the breadth and depth of my articles.',
    rating: 4,
  },
  {
    name: 'Christi H.',
    initials: 'CH',
    title: 'New to writing a Blog',
    text: "The only thing I haven't figured out yet is how to set a tone for every article I write – such as through the lens of gardening or as a Law enforcement Officer. But I am learning!!",
    rating: 5,
  },
  {
    name: 'Regis I.',
    initials: 'RI',
    title: 'Revolutionize your content creation',
    text: "What I love about BlogSphere is that it's super easy to use. Choose your output language and tone, complete the prompt, and click 'Generate'. Then pick the one that suits your needs best.",
    rating: 5,
  },
  {
    name: 'Tracey J.',
    initials: 'TJ',
    title: 'A great help to scheduling software',
    text: 'I would like it if there was a menu across the top allowing easier access back to scheduling posts. I also wish it allowed tagging within the social media element.',
    rating: 4,
  },
  {
    name: 'Qasim K.',
    initials: 'QK',
    title: 'Best Content Generating AI Tool',
    text: 'Being a company owner, the best thing I found about BlogSphere is the ease of using it and generating multiple posts. The UI meets my needs and is quite like the current UI.',
    rating: 4,
  },
  {
    name: 'Rachelle C.',
    initials: 'RC',
    title: 'Best Writing Tool & Easy To Use',
    text: 'It is benefiting me in many ways. The titles are always spot on and very easy to read. This helps a great deal.',
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
    const colors = ['bg-blue-100 text-blue-700','bg-purple-100 text-purple-700','bg-pink-100 text-pink-700','bg-emerald-100 text-emerald-700','bg-amber-100 text-amber-700'];
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
          <p className="text-sm font-medium text-muted-foreground">Trusted By <span className="brand-gradient-text font-bold">10 million+</span> People.</p>
          <h2 className="heading-responsive font-extrabold mt-2">
            What our users are saying about <span className="brand-gradient-text">BlogSphere</span>
          </h2>
          <div className="mt-6">
            <p className="text-sm font-semibold text-foreground">Aggregate Review Rating</p>
            <div className="mt-2 flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">4.9/5 Stars</span>
              <Stars value={5} />
              <span>(1764)</span>
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
