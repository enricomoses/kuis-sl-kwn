'use client';

import { BookOpen, History, LogOut, Radio } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppBrandHeader } from '@/components/common/layout/app-brand-header';
import { Button } from '@/components/ui/button';
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
          <AppBrandHeader compact />

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
                  className={cn(
                    'admin-nav-link',
                    isActive && 'admin-nav-link--active',
                  )}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-[var(--color-navy-muted)] sm:inline">
              {profile.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              loading={logoutMutation.isPending}
              onClick={() => void handleLogout()}
            >
              <LogOut size={16} aria-hidden="true" />
              <span>{AUTH_COPY.LOGOUT_BUTTON}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="admin-main">{children}</main>
    </div>
  );
}
