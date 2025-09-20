// components/layout/Footer.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';

// Newsletter subscription component
const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setMessage('Thanks for subscribing!');
      setEmail('');
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6 lg:p-8 rounded-2xl border border-blue-200/20 backdrop-blur-sm">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Stay Updated
        </h3>
        <p className="text-gray-300 text-sm">
          Get the latest AI insights and trending content delivered to your inbox.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subscribing...
            </div>
          ) : (
            'Subscribe'
          )}
        </button>
      </form>
      
      {message && (
        <div className="mt-4 text-center">
          <p className="text-green-400 text-sm font-medium">{message}</p>
        </div>
      )}
    </div>
  );
};

// Social media links component
const SocialLinks = () => {
  const socials = [
    {
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    },
    {
      name: 'GitHub',
      href: 'https://github.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    {
      name: 'Discord',
      href: 'https://discord.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0188 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="flex items-center gap-4">
      <span className="text-gray-400 text-sm">Follow us:</span>
      <div className="flex gap-3">
        {socials.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 group"
            aria-label={social.name}
          >
            {social.icon}
            <span className="sr-only">{social.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

// Quick stats component
const QuickStats = () => {
  const stats = [
    { label: 'Active Members', value: '25K+' },
    { label: 'Posts Published', value: '120K+' },
    { label: 'Countries', value: '80+' },
    { label: 'Success Stories', value: '500+' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
            {stat.value}
          </div>
          <div className="text-gray-400 text-sm">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Features', href: '/features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'API Docs', href: '/docs' },
        { name: 'Integrations', href: '/integrations' }
      ]
    },
    {
      title: 'Community',
      links: [
        { name: 'Blog', href: '/blog' },
        { name: 'Forums', href: '/forums' },
        { name: 'Events', href: '/events' },
        { name: 'Contributors', href: '/contributors' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Tutorials', href: '/tutorials' },
        { name: 'Guides', href: '/guides' },
        { name: 'Changelog', href: '/changelog' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
        { name: 'Press Kit', href: '/press' }
      ]
    }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 mt-20 overflow-hidden">
      {/* Background elements */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full filter blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Top section with branding and newsletter */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          {/* Brand section */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white">
                  AI Knowledge Hub
                </span>
              </div>
            </Link>

            <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
              Empowering developers, researchers, and AI enthusiasts to share knowledge, 
              collaborate on projects, and shape the future of artificial intelligence.
            </p>

            <SocialLinks />

            {/* Trust badges */}
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Trusted Platform
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ISO Certified
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                GDPR Compliant
              </div>
            </div>
          </div>

          {/* Newsletter section */}
          <div>
            <NewsletterSignup />
          </div>
        </div>

        {/* Stats section */}
        <QuickStats />

        {/* Links section */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-6 text-lg">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      {link.name}
                      <svg className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-gray-400 text-sm text-center lg:text-left">
              <p>© {currentYear} AI Knowledge Hub. All rights reserved.</p>
              <p className="mt-1">
                Built with ❤️ by developers, for developers.
              </p>
            </div>

            {/* Legal links */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-6">
              {legalLinks.map((link, index) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-xs">
              This platform is powered by cutting-edge AI technology and maintained by a passionate community of developers.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}