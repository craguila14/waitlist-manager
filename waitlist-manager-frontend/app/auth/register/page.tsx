'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'owner' as 'owner' | 'host',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Crear cuenta</h1>
        <p style={styles.subtitle}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" style={styles.link}>
            Inicia sesión
          </Link>
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre</label>
            <input
              style={styles.input}
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Tu nombre"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              style={styles.input}
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Tipo de cuenta</label>
            <div style={styles.roleGroup}>
              <RoleOption
                selected={form.role === 'owner'}
                label="Dueño"
                description="Creo y administro un restaurante"
                onClick={() => setForm(p => ({ ...p, role: 'owner' }))}
              />
              <RoleOption
                selected={form.role === 'host'}
                label="Staff / Host"
                description="Trabajo en un restaurante existente"
                onClick={() => setForm(p => ({ ...p, role: 'host' }))}
              />
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}

function RoleOption({
  selected,
  label,
  description,
  onClick,
}: {
  selected: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.roleOption,
        borderColor: selected ? '#111827' : '#d1d5db',
        background: selected ? '#f9fafb' : '#ffffff',
      }}
    >
      <div
        style={{
          ...styles.radioOuter,
          borderColor: selected ? '#111827' : '#d1d5db',
        }}
      >
        {selected && <div style={styles.radioInner} />}
      </div>
      <div style={{ textAlign: 'left' as const }}>
        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{label}</p>
        <p style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.125rem' }}>
          {description}
        </p>
      </div>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb',
    padding: '1rem',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '2rem',
    width: '100%',
    maxWidth: '440px',
  },
  title: { fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' },
  subtitle: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' },
  link: { color: '#111827', fontWeight: 500, textDecoration: 'underline' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  label: { fontSize: '0.875rem', fontWeight: 500, color: '#374151' },
  input: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
  },
  roleGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  roleOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left' as const,
  },
  radioOuter: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioInner: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#111827',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem',
    background: '#fef2f2',
    borderRadius: '6px',
  },
  button: {
    padding: '0.625rem',
    background: '#111827',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 500,
    marginTop: '0.5rem',
  },
};