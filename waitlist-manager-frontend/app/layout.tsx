import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { AuthProvider } from '@/context/auth-context';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Waitlist Manager',
  description: 'Sistema de gestión de filas para restaurantes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={geist.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}