import type { ReactNode } from 'react';
import '@/styles/features/play.css';

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return <div className="site-shell">{children}</div>;
}
