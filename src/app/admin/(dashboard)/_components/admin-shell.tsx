'use client';

import { BookOpen, History, LogOut, Radio } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { PartnerLogos } from '@/components/common/layout/partner-logos';
import { Button } from '@/components/ui/button';
import { APP_INFO } from '@/constants/app.constant';
import { AUTH_COPY } from '@/constants/auth.constant';
import { ROUTES } from '@/constants/routes.constant';
import { useAdminLogout } from '@/hooks/queries/use-admin-auth';
import { notifyInfo } from '@/lib/toast';
import type { AdminSessionProfile } from '@/types/auth';
import { cn } from '@/utils';

interface AdminShellProps {
  profile: AdminSessionProfile;
  children: ReactNode;
  className?: string;
}

const NAV_ITEMS = [
  { href: ROUTES.ADMIN_CONSOLE, label: 'Ruang Kontrol', icon: Radio },
  { href: ROUTES.ADMIN_QUESTIONS, label: 'Bank Soal', icon: BookOpen },
  { href: ROUTES.ADMIN_HISTORY, label: 'Riwayat', icon: History },
] as const;

export function AdminShell({ profile, children, className }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useAdminLogout();

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    notifyInfo(AUTH_COPY.LOGOUT_SUCCESS, { toastId: 'admin-logout' });
    router.replace(ROUTES.ADMIN_LOGIN);
    router.refresh();
  }

  return (
    <div className={cn('admin-shell', className)}>
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <PartnerLogos size="sm" className="flex-nowrap" />
            <span
              aria-hidden="true"
              className="admin-brand-divider hidden xl:block"
            />
            <Link
              href={ROUTES.ADMIN_CONSOLE}
              className="admin-brand-title hidden xl:inline"
            >
              {APP_INFO.TITLE}
            </Link>
          </div>

          <nav className="admin-nav" aria-label="Navigasi Admin">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === ROUTES.ADMIN_CONSOLE
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  title={item.label}
                  className={cn(
                    'admin-nav-link',
                    isActive && 'admin-nav-link--active',
                  )}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden max-w-[180px] truncate text-sm font-medium text-[var(--color-navy-muted)] lg:inline xl:max-w-[200px]">
              {profile.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              loading={logoutMutation.isPending}
              onClick={() => void handleLogout()}
              aria-label={AUTH_COPY.LOGOUT_BUTTON}
              className="admin-logout-btn"
            >
              <LogOut size={16} aria-hidden="true" />
              <span className="hidden sm:inline">
                {AUTH_COPY.LOGOUT_BUTTON}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <main className="admin-main">{children}</main>
    </div>
  );
}
