import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Flux — Task Manager',
    template: '%s | Flux',
  },
  description: 'A modern productivity workspace to manage your tasks.',
  keywords: ['tasks', 'productivity', 'todo', 'task manager'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
