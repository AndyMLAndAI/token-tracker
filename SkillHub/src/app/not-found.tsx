import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-parchment-canvas">
      <Header />
      <main className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-parchment-card border border-parchment-border text-clay mb-6">
          <span className="text-base font-serif">✦</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-ink-primary mb-3">
          Page not found
        </h1>
        <p className="font-sans text-sm text-ink-muted leading-relaxed mb-8">
          The requested section or skill record does not exist in this edition of Skills Hub.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-sans font-medium text-ink-primary bg-parchment-card border border-ink-primary rounded-sm shadow-soft hover:bg-parchment-canvas transition-colors"
        >
          Return to catalog
        </Link>
      </main>
      <Footer />
    </div>
  );
}
