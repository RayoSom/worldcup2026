'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { modules } from '@/config/modules';

export function Header() {
  const t = useTranslations('header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchLocale = (to: 'es' | 'en') => {
    router.replace(pathname, { locale: to });
  };

  const isActive = (segment: string) => pathname.includes(`/${segment}`);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'py-2' : 'py-4',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-[1440px] items-center gap-4 rounded-full border px-5 transition-all duration-300',
          scrolled
            ? 'glass mx-4 h-12 border-border'
            : 'mx-6 h-14 border-transparent',
        )}
      >
        {/* Logo — Colombia gradient text */}
        <Link
          href="/torneo"
          className="font-bold text-sm tracking-wide shrink-0"
          style={{
            background: 'var(--gradient-colombia-logo)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          WC2026 ⚽
        </Link>

        {/* Module tabs — conditional on enabled flags */}
        <nav className="hidden md:flex items-center gap-1">
          {modules.torneo.enabled && (
            <NavLink
              href="/torneo"
              active={isActive('torneo')}
              variant="colombia"
              label={t('nav_torneo')}
            />
          )}
          {modules.partido.enabled && (
            <NavLink
              href="/partido"
              active={isActive('partido')}
              variant="colombia"
              label={t('nav_partido')}
            />
          )}
          {modules.predictor.enabled && (
            <NavLink
              href="/predictor"
              active={isActive('predictor')}
              variant="ia"
              label={t('nav_predictor')}
            />
          )}
        </nav>

        {/* Language switcher — preserved from original */}
        <div className="ml-auto flex items-center gap-1 rounded-full border border-border bg-bg-1/40 p-0.5 shrink-0">
          <button
            onClick={() => switchLocale('es')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full transition-colors',
              locale === 'es' ? 'bg-gold/90 text-bg-0' : 'text-fg-2 hover:text-fg-0',
            )}
            aria-label="Español"
          >
            {t('lang_es')}
          </button>
          <button
            onClick={() => switchLocale('en')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full transition-colors',
              locale === 'en' ? 'bg-gold/90 text-bg-0' : 'text-fg-2 hover:text-fg-0',
            )}
            aria-label="English"
          >
            {t('lang_en')}
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  variant,
  label,
}: {
  href: string;
  active: boolean;
  variant: 'colombia' | 'ia';
  label: string;
}) {
  const activeStyle =
    variant === 'ia'
      ? {
          background: 'var(--gradient-ia)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }
      : {
          background: 'var(--gradient-colombia-logo)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        };

  return (
    <Link
      href={href}
      className={cn(
        'px-3 py-1.5 rounded text-xs font-semibold transition-colors',
        active ? '' : 'text-fg-2 hover:text-fg-0',
      )}
      style={active ? activeStyle : {}}
    >
      {label}
    </Link>
  );
}
