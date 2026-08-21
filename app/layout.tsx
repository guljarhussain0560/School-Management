import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SessionProvider from '@/components/providers/SessionProvider';
import ToasterProvider from '@/components/providers/ToasterProvider';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});


export const metadata: Metadata = {
  title: 'School Management System',
  description: 'Comprehensive school management solution for administrators, teachers, and transport staff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <ToasterProvider />
        </SessionProvider>
      </body>
    </html>
  );
}
