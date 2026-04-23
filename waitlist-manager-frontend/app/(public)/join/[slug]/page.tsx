'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { restaurantsApi, waitlistApi, Restaurant, WaitlistEntry } from '@/lib/api';
import { connectSocket, joinRestaurantRoom, getSocket, disconnectSocket } from '@/lib/socket';

type PageState = 'loading' | 'closed' | 'form' | 'waiting' | 'called' | 'error';

export default function JoinPage() {
  const { slug } = useParams<{ slug: string }>();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [entry, setEntry] = useState<WaitlistEntry | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Formulario
  const [form, setForm] = useState({
    guestName: '',
    partySize: '2',
    phone: '',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Carga los datos del restaurante al montar
  useEffect(() => {
    async function load() {
      try {
        const data = await restaurantsApi.getBySlug(slug);
        setRestaurant(data);
        setPageState(data.isOpen ? 'form' : 'closed');
      } catch {
        setErrorMsg('Restaurante no encontrado');
        setPageState('error');
      }
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (!entry || !restaurant) return;

    const socket = connectSocket();
    joinRestaurantRoom(restaurant.id);

    socket.on('waitlistUpdated', (waitlist: WaitlistEntry[]) => {
      const myEntry = waitlist.find(e => e.id === entry.id);
      if (myEntry) {
        setEntry(myEntry);
        if (myEntry.status === 'called') setPageState('called');
        else setPageState('waiting');
      }
    });

    return () => {
      socket.off('waitlistUpdated');
      disconnectSocket();
    };
  }, [entry, restaurant]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const created = await waitlistApi.join({
        restaurantId: restaurant!.id,
        guestName: form.guestName,
        partySize: parseInt(form.partySize),
        phone: form.phone,
        notes: form.notes || undefined,
      });
      setEntry(created);
      setPageState('waiting');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al unirse a la fila');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleCancel() {
    if (!entry) return;
    if (!confirm('¿Cancelar tu lugar en la fila?')) return;
    try {
      await waitlistApi.cancel(entry.id);
      setEntry(null);
      setPageState('form');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cancelar');
    }
  }

  // ── Estados de la página ──────────────────────────────────────────────────

  if (pageState === 'loading') {
    return <Screen><p style={s.muted}>Cargando...</p></Screen>;
  }

  if (pageState === 'error') {
    return (
      <Screen>
        <p style={s.emoji}>🔍</p>
        <h1 style={s.title}>Restaurante no encontrado</h1>
        <p style={s.muted}>{errorMsg}</p>
      </Screen>
    );
  }

  if (pageState === 'closed') {
    return (
      <Screen>
        <p style={s.emoji}>🔒</p>
        <h1 style={s.title}>{restaurant?.name}</h1>
        <p style={s.muted}>El restaurante está cerrado por el momento.</p>
        <p style={s.muted}>Vuelve más tarde para unirte a la fila.</p>
      </Screen>
    );
  }

  if (pageState === 'called') {
    return (
      <Screen accent>
        <p style={s.emoji}>🎉</p>
        <h1 style={s.title}>¡Tu mesa está lista!</h1>
        <p style={{ ...s.muted, marginTop: '0.5rem' }}>
          Hola {entry?.guestName}, dirígete a la entrada del restaurante.
          Tienes unos minutos antes de que pasemos al siguiente grupo.
        </p>
        <div style={s.infoBadge}>
          {restaurant?.name}
        </div>
      </Screen>
    );
  }

  if (pageState === 'waiting' && entry) {
    const joinedAtMs = new Date(entry.joinedAt).getTime();
const nowMs = new Date().getTime();
const waitMinutes = Math.max(0, Math.floor((nowMs - joinedAtMs) / 60000));

    return (
      <Screen>
        <p style={s.emoji}>⏳</p>
        <h1 style={s.title}>{restaurant?.name}</h1>

        <div style={s.positionCard}>
          <p style={s.positionLabel}>Tu posición en la fila</p>
          <p style={s.positionNumber}>{entry.position}</p>
        </div>

        <div style={s.infoGrid}>
          <InfoRow label="Nombre" value={entry.guestName} />
          <InfoRow label="Grupo" value={`${entry.partySize} personas`} />
          <InfoRow label="Tiempo de espera" value={`~${waitMinutes} min`} />
          {restaurant?.estimatedWaitMinutes && (
            <InfoRow
              label="Espera estimada"
              value={`~${restaurant.estimatedWaitMinutes} min`}
            />
          )}
        </div>

        <p style={s.hint}>
          Te avisaremos por SMS cuando tu mesa esté lista.
          Mantén tu celular cerca.
        </p>

        <button onClick={handleCancel} style={s.cancelBtn}>
          Cancelar mi lugar
        </button>
      </Screen>
    );
  }

  // ── Formulario para unirse ────────────────────────────────────────────────

  return (
    <Screen>
      <h1 style={s.title}>{restaurant?.name}</h1>
      {restaurant?.estimatedWaitMinutes ? (
        <p style={s.muted}>
          Espera estimada: ~{restaurant.estimatedWaitMinutes} minutos
        </p>
      ) : null}

      <form onSubmit={handleSubmit} style={s.form}>
        <div style={s.field}>
          <label style={s.label}>Tu nombre</label>
          <input
            style={s.input}
            value={form.guestName}
            onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))}
            placeholder="¿Cómo te llamamos?"
            required
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>¿Cuántos son?</label>
          <div style={s.partySelector}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setForm(p => ({ ...p, partySize: String(n) }))}
                style={{
                  ...s.partyBtn,
                  background:
                    form.partySize === String(n) ? '#111827' : '#f3f4f6',
                  color: form.partySize === String(n) ? '#ffffff' : '#374151',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Teléfono (para el SMS)</label>
          <input
            style={s.input}
            type="tel"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="+56912345678"
            required
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Nota para el staff (opcional)</label>
          <input
            style={s.input}
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Ej: silla para bebé, alérgico al maní..."
          />
        </div>

        {formError && <p style={s.error}>{formError}</p>}

        <button
          type="submit"
          disabled={formLoading}
          style={{
            ...s.submitBtn,
            opacity: formLoading ? 0.7 : 1,
            cursor: formLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {formLoading ? 'Uniéndome a la fila...' : 'Unirme a la fila'}
        </button>
      </form>
    </Screen>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function Screen({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: accent ? '#f0fdf4' : '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#ffffff',
          border: `1px solid ${accent ? '#86efac' : '#e5e7eb'}`,
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
        borderBottom: '1px solid #f3f4f6',
        fontSize: '0.875rem',
      }}
    >
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  emoji: { fontSize: '2.5rem', marginBottom: '0.75rem' },
  title: { fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.5rem' },
  muted: { color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 },
  infoBadge: {
    marginTop: '1.25rem',
    display: 'inline-block',
    padding: '0.375rem 0.875rem',
    background: '#dcfce7',
    color: '#166534',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  positionCard: {
    margin: '1.25rem 0',
    padding: '1.25rem',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  positionLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginBottom: '0.25rem',
  },
  positionNumber: {
    fontSize: '3rem',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1,
  },
  infoGrid: {
    width: '100%',
    margin: '0.75rem 0',
    textAlign: 'left',
  },
  hint: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginTop: '1rem',
    lineHeight: 1.6,
  },
  cancelBtn: {
    marginTop: '1.25rem',
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.8rem',
    color: '#6b7280',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1.25rem',
    textAlign: 'left',
  },
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
  partySelector: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  partyBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem',
    background: '#fef2f2',
    borderRadius: '6px',
  },
  submitBtn: {
    padding: '0.75rem',
    background: '#111827',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: 600,
    marginTop: '0.25rem',
  },
};