// components/pricing/FAQ.jsx
'use client';
import Reveal from '@/components/ui/Reveal';

const faqs = [
  {
    q: 'Is there any auto-renewal or hidden fee?',
    a: 'No. All paid plans are a one-time payment for 30 days of premium features. You can renew manually if you want to continue.'
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. You can upgrade/downgrade anytime. Upgrades apply immediately; downgrades take effect the next billing cycle.'
  },
  {
    q: 'Do you offer refunds?',
    a: 'If something goes wrong on our side or you experience a critical issue, contact support within 7 days and we will help.'
  },
  {
    q: 'Is my data secure?',
    a: 'We use industry best practices for security. Enterprise plans include custom security reviews and SLAs.'
  }
];

export default function FAQ() {
  return (
    <section className="mt-16">
      <Reveal className="text-center mb-8">
        <h3 className="text-2xl font-bold">Frequently asked questions</h3>
        <p className="text-muted-foreground">Everything you need to know about pricing</p>
      </Reveal>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((f, i) => (
          <details key={i} className="group border border-border rounded-xl p-4 bg-card hover:shadow-sm transition-shadow">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
              <span className="font-medium">{f.q}</span>
              <span className="text-muted-foreground group-open:rotate-180 transition-transform">⌄</span>
            </summary>
            <div className="mt-2 text-sm text-muted-foreground">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
