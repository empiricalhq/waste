import Link from 'next/link';
import { marketingTheme } from '@/config/marketing';

export interface NavLink {
  href: string;
  label: string;
}

export interface NavigationProps {
  navLinks?: readonly NavLink[];
  showAuth?: boolean;
}

export function Navigation({ navLinks, showAuth = true }: NavigationProps) {
  const theme = marketingTheme;
  return (
    <nav
      className={`border-b ${theme.nav.bar.borderColor} ${theme.nav.bar.bgColor} ${theme.nav.bar.backdropBlur} fixed top-0 left-0 right-0 z-50`}
      style={{ height: theme.layout.navHeight }}
    >
      <div
        className={`mx-auto ${theme.spacing.pageSide} h-full flex items-center justify-between`}
        style={{ maxWidth: theme.layout.navMaxWidth }}
      >
        <Link
          href="/"
          className={`flex items-center gap-2 ${theme.nav.logo.textColor} ${theme.nav.logo.hoverColor} ${theme.transitions.default}`}
        >
          <svg
            width={theme.nav.logo.iconSize}
            height={theme.nav.logo.iconSize}
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-900"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
            <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
            <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
            <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
          </svg>
          <span className={`${theme.nav.logo.fontWeight} ${theme.nav.logo.fontSize}`}>Lima Limpia</span>
        </Link>

        {navLinks && navLinks.length > 0 && (
          <div className={`hidden md:flex items-center ${theme.spacing.navGap}`}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${theme.nav.links.fontSize} ${theme.nav.links.textColor} ${theme.nav.links.hoverColor} ${theme.transitions.default}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {showAuth && (
          <div className={`flex items-center ${theme.nav.auth.buttonGap}`}>
            <Link
              href="/signin"
              className={`${theme.nav.auth.fontSize} ${theme.nav.auth.signupBgColor} ${theme.nav.auth.signupTextColor} ${theme.nav.auth.signupPadding} ${theme.nav.auth.signupBorderRadius} ${theme.nav.auth.signupHoverBgColor} ${theme.transitions.default}`}
            >
              Intranet
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
