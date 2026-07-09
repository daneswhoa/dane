import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sophia AI | Admin Control Center',
  description: 'Moderator and System Administration Workspace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="flex min-h-screen text-sm bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-ink-50 trans-theme overflow-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
