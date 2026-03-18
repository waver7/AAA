import './globals.css';
import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import { assertProductionEnv } from '@/lib/validation/env';

export const metadata = {
  title: 'AutoApply AI',
  description: 'AI-powered job application assistant for software engineers'
};

const nav: Array<{ href: Route; label: string }> = [
  { href: '/onboarding', label: 'Onboarding' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/applications', label: 'Applications' },
  { href: '/settings', label: 'Settings' }
];

export default function RootLayout({ children }: { children: ReactNode }) {
  assertProductionEnv();
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-teal-400">
              AutoApply AI
            </Link>
            <nav className="flex gap-4 text-sm text-slate-300">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
