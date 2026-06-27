import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FetchInterceptor } from './components/FetchInterceptor';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Property management dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className={inter.variable}>
        <FetchInterceptor />
        {children}
      </body>
    </html>
  );
}

