'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useWaitlistSocket } from '@/hooks/useWaitlistSocket';
import { waitlistApi, WaitlistEntry } from '@/lib/api';

export default function WaitlistPage() {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId ?? '';

  const { waitlist, isConnected, isLoading, error, refresh } =
    useWaitlistSocket(restaurantId);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleAction(
    entryId: string,
    action: 'call' | 'seat' | 'finish' | 'cancel',
  ) {
    setActionLoading(entryId);
    try {
      await waitlistApi[action](entryId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al realizar la acción');
    } finally {
      setActionLoading(null);
    }
  }

  if (!restaurantId) {
    return (
      <div style={styles.empty}>
        <p>Tu cuenta no está vinculada a ningún restaurante.</p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Contacta al dueño del restaurante para que te agregue al equipo.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Fila de espera</h2>
          <p style={styles.subtitle}>
            {waitlist.length === 0
              ? 'No hay nadie esperando'
              : `${waitlist.length} ${waitlist.length === 1 ? 'grupo esperando' : 'grupos esperando'}`}
          </p>
        </div>

        {/* Indicador de conexión WebSocket */}
        <div style={styles.connectionBadge}>
          <span
            style={{
              ...styles.connectionDot,
              background: isConnected ? '#16a34a' : '#dc2626',
            }}
          />
          <span style={styles.connectionText}>
            {isConnected ? 'En vivo' : 'Reconectando...'}
          </span>
        </div>
      </div>

      {/* Estados */}
      {isLoading && (
        <div style={styles.stateMessage}>Cargando fila...</div>
      )}

      {error && (
        <div style={{ ...styles.stateMessage, color: '#dc2626' }}>
          {error}
          <button onClick={refresh} style={styles.retryButton}>
            Reintentar
          </button>
        </div>
      )}

      {/* Lista vacía */}
      {!isLoading && !error && waitlist.length === 0 && (
        <div style={styles.emptyList}>
          <p style={{ fontSize: '2rem' }}>🎉</p>
          <p style={{ fontWeight: 500, marginTop: '0.5rem' }}>
            La fila está vacía
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Los clientes pueden unirse escaneando el QR del restaurante
          </p>
        </div>
      )}

      {/* Tabla de la fila */}
      {waitlist.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Personas</th>
                <th style={styles.th}>Espera</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {waitlist.map(entry => (
                <WaitlistRow
                  key={entry.id}
                  entry={entry}
                  isActioning={actionLoading === entry.id}
                  onAction={handleAction}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Fila individual ──────────────────────────────────────────────────────────

function WaitlistRow({
  entry,
  isActioning,
  onAction,
}: {
  entry: WaitlistEntry;
  isActioning: boolean;
  onAction: (id: string, action: 'call' | 'seat' | 'finish' | 'cancel') => void;
}) {
  const waitMinutes = Math.floor(
    (Date.now() - new Date(entry.joinedAt).getTime()) / 60000,
  );

  return (
    <tr style={styles.tr}>
      <td style={styles.td}>
        <span style={styles.position}>{entry.position}</span>
      </td>
      <td style={styles.td}>
        <p style={{ fontWeight: 500 }}>{entry.guestName}</p>
        {entry.notes && (
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{entry.notes}</p>
        )}
      </td>
      <td style={styles.td}>{entry.partySize} personas</td>
      <td style={styles.td}>{waitMinutes} min</td>
      <td style={styles.td}>
        <StatusBadge status={entry.status} />
      </td>
      <td style={styles.td}>
        <div style={styles.actions}>
          {entry.status === 'waiting' && (
            <>
              <ActionButton
                label="Llamar"
                color="#2563eb"
                disabled={isActioning}
                onClick={() => onAction(entry.id, 'call')}
              />
              <ActionButton
                label="Cancelar"
                color="#dc2626"
                disabled={isActioning}
                onClick={() => onAction(entry.id, 'cancel')}
              />
            </>
          )}
          {entry.status === 'called' && (
            <>
              <ActionButton
                label="Sentar"
                color="#16a34a"
                disabled={isActioning}
                onClick={() => onAction(entry.id, 'seat')}
              />
              <ActionButton
                label="Cancelar"
                color="#dc2626"
                disabled={isActioning}
                onClick={() => onAction(entry.id, 'cancel')}
              />
            </>
          )}
          {entry.status === 'seated' && (
            <ActionButton
              label="Finalizar"
              color="#6b7280"
              disabled={isActioning}
              onClick={() => onAction(entry.id, 'finish')}
            />
          )}
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: WaitlistEntry['status'] }) {
  const config = {
    waiting:   { label: 'Esperando', bg: '#fef9c3', color: '#854d0e' },
    called:    { label: 'Llamado',   bg: '#dbeafe', color: '#1e40af' },
    seated:    { label: 'Sentado',   bg: '#dcfce7', color: '#166534' },
    finished:  { label: 'Finalizado',bg: '#f3f4f6', color: '#374151' },
    cancelled: { label: 'Cancelado', bg: '#fee2e2', color: '#991b1b' },
  };

  const { label, bg, color } = config[status];

  return (
    <span style={{ ...styles.badge, background: bg, color }}>
      {label}
    </span>
  );
}

function ActionButton({
  label,
  color,
  disabled,
  onClick,
}: {
  label: string;
  color: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.actionBtn,
        color,
        borderColor: color,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '2rem',
    maxWidth: '900px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  },
  connectionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '9999px',
    fontSize: '0.8rem',
  },
  connectionDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  connectionText: {
    color: '#374151',
  },
  stateMessage: {
    padding: '1rem',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  retryButton: {
    padding: '0.25rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  emptyList: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
  },
  empty: {
    padding: '2rem',
  },
  tableWrapper: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left' as const,
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#6b7280',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '0.875rem 1rem',
    fontSize: '0.9rem',
    verticalAlign: 'middle' as const,
  },
  position: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: '#f3f4f6',
    borderRadius: '50%',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.375rem 0.75rem',
    background: 'transparent',
    border: '1px solid',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
};