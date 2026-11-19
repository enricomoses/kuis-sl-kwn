import type { ReactNode } from 'react';
import '@/styles/features/admin.css';
import '@/styles/features/play.css';

interface AdminLeaderboardLayoutProps {
  children: ReactNode;
}

export default function AdminLeaderboardLayout({
  children,
}: AdminLeaderboardLayoutProps) {
  return children;
}
