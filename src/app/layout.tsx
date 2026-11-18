import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { getServerEnvironment } from '@/config/environment.server';
import { APP_INFO } from '@/constants/app.constant';
import {
  PreferencesProvider,
  ReactQueryProvider,
  ToastProvider,
} from '@/providers';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: APP_INFO.TITLE,
    template: `%s | ${APP_INFO.TITLE}`,
  },
  description: APP_INFO.DESCRIPTION,
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  getServerEnvironment();

  return (
    <html lang="id" className={dmSans.variable}>
      <body>
        <ReactQueryProvider>
          <PreferencesProvider>
            <ToastProvider>{children}</ToastProvider>
          </PreferencesProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
