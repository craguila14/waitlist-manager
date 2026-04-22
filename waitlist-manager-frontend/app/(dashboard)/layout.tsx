'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div style={styles.loading}>
        <p style={{ color: '#6b7280' }}>Cargando...</p>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard/waitlist', label: 'Fila de espera' },
    { href: '/dashboard/tables', label: 'Mesas' },
    ...(user.role === 'owner'
      ? [{ href: '/dashboard/settings', label: 'Configuración' }]
      : []),
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h1 style={styles.logo}>Waitlist</h1>
          <p style={styles.restaurantName}>
            {user.role === 'owner' ? 'Mi restaurante' : 'Dashboard'}
          </p>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...styles.navItem,
                ...(pathname === item.href ? styles.navItemActive : {}),
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <p style={styles.userName}>{user.name}</p>
          <p style={styles.userRole}>
            {user.role === 'owner' ? 'Dueño' : 'Staff'}
          </p>
          <button onClick={logout} style={styles.logoutButton}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f9fafb',
  },
  sidebar: {
    width: '240px',
    background: '#111827',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'sticky' as const,
    top: 0,
    height: '100vh',
  },
  sidebarHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #1f2937',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#ffffff',
  },
  restaurantName: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginTop: '0.25rem',
  },
  nav: {
    flex: 1,
    padding: '1rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  navItem: {
    display: 'block',
    padding: '0.625rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#d1d5db',
    transition: 'background 0.15s',
  },
  navItemActive: {
    background: '#1f2937',
    color: '#ffffff',
  },
  sidebarFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #1f2937',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#ffffff',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginTop: '0.125rem',
    marginBottom: '0.75rem',
  },
  logoutButton: {
    width: '100%',
    padding: '0.5rem',
    background: 'transparent',
    border: '1px solid #374151',
    borderRadius: '6px',
    color: '#9ca3af',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
};