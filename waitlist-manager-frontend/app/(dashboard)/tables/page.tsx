'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { restaurantsApi, Table } from '@/lib/api';

type TableStatus = 'available' | 'occupied' | 'reserved';

export default function TablesPage() {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId ?? '';

  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal para agregar mesa — solo visible para OWNER
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTable, setNewTable] = useState({ number: '', capacity: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const loadTables = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setIsLoading(true);
      const restaurant = await restaurantsApi.getById(restaurantId);
      setTables(restaurant.tables ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las mesas');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  async function handleStatusChange(tableId: string, status: TableStatus) {
    setActionLoading(tableId);
    try {
      const updated = await restaurantsApi.updateTable(tableId, { status });
      setTables(prev =>
        prev.map(t => (t.id === tableId ? { ...t, status: updated.status } : t)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar la mesa');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteTable(tableId: string) {
    if (!confirm('¿Eliminar esta mesa?')) return;
    setActionLoading(tableId);
    try {
      await restaurantsApi.deleteTable(tableId);
      setTables(prev => prev.filter(t => t.id !== tableId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar la mesa');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddTable(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      const created = await restaurantsApi.createTable(restaurantId, {
        number: newTable.number,
        capacity: parseInt(newTable.capacity),
      });
      setTables(prev => [...prev, created]);
      setNewTable({ number: '', capacity: '' });
      setShowAddModal(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Error al crear la mesa');
    } finally {
      setAddLoading(false);
    }
  }

  if (!restaurantId) {
    return (
      <div style={styles.page}>
        <p style={{ color: '#6b7280' }}>
          Tu cuenta no está vinculada a ningún restaurante.
        </p>
      </div>
    );
  }

  // Contadores por estado para el resumen
  const available = tables.filter(t => t.status === 'available').length;
  const occupied = tables.filter(t => t.status === 'occupied').length;
  const reserved = tables.filter(t => t.status === 'reserved').length;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Mesas</h2>
          <p style={styles.subtitle}>
            {tables.length} mesas en total
          </p>
        </div>
        {user?.role === 'owner' && (
          <button
            onClick={() => setShowAddModal(true)}
            style={styles.addButton}
          >
            + Agregar mesa
          </button>
        )}
      </div>

      {/* Resumen de estados */}
      {tables.length > 0 && (
        <div style={styles.summary}>
          <StatCard label="Disponibles" value={available} color="#16a34a" />
          <StatCard label="Ocupadas" value={occupied} color="#dc2626" />
          <StatCard label="Reservadas" value={reserved} color="#d97706" />
        </div>
      )}

      {/* Estados de carga y error */}
      {isLoading && (
        <p style={{ color: '#6b7280', padding: '1rem 0' }}>Cargando mesas...</p>
      )}

      {error && (
        <div style={styles.errorBox}>
          {error}
          <button onClick={loadTables} style={styles.retryBtn}>Reintentar</button>
        </div>
      )}

      {/* Lista vacía */}
      {!isLoading && !error && tables.length === 0 && (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '2rem' }}>🪑</p>
          <p style={{ fontWeight: 500, marginTop: '0.5rem' }}>
            No hay mesas registradas
          </p>
          {user?.role === 'owner' && (
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Agrega mesas para que el staff pueda gestionar su estado
            </p>
          )}
        </div>
      )}

      {/* Grid de mesas */}
      {!isLoading && tables.length > 0 && (
        <div style={styles.grid}>
          {tables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              isActioning={actionLoading === table.id}
              canDelete={user?.role === 'owner'}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTable}
            />
          ))}
        </div>
      )}

      {/* Modal agregar mesa */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Agregar mesa</h3>

            <form onSubmit={handleAddTable} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Número / nombre de mesa</label>
                <input
                  style={styles.input}
                  placeholder="Ej: Mesa 1, Terraza A"
                  value={newTable.number}
                  onChange={e =>
                    setNewTable(prev => ({ ...prev, number: e.target.value }))
                  }
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Capacidad (personas)</label>
                <input
                  style={styles.input}
                  type="number"
                  min={1}
                  max={20}
                  placeholder="Ej: 4"
                  value={newTable.capacity}
                  onChange={e =>
                    setNewTable(prev => ({ ...prev, capacity: e.target.value }))
                  }
                  required
                />
              </div>

              {addError && <p style={styles.errorText}>{addError}</p>}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddError('');
                    setNewTable({ number: '', capacity: '' });
                  }}
                  style={styles.cancelBtn}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  style={{
                    ...styles.submitBtn,
                    opacity: addLoading ? 0.7 : 1,
                  }}
                >
                  {addLoading ? 'Guardando...' : 'Guardar mesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componentes ──────────────────────────────────────────────────────────────

function TableCard({
  table,
  isActioning,
  canDelete,
  onStatusChange,
  onDelete,
}: {
  table: Table;
  isActioning: boolean;
  canDelete: boolean;
  onStatusChange: (id: string, status: TableStatus) => void;
  onDelete: (id: string) => void;
}) {
  const statusConfig = {
    available: { label: 'Disponible', bg: '#dcfce7', color: '#166534', border: '#86efac' },
    occupied:  { label: 'Ocupada',    bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
    reserved:  { label: 'Reservada',  bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  };

  const { label, bg, color, border } = statusConfig[table.status];

  return (
    <div
      style={{
        ...styles.tableCard,
        borderColor: border,
        background: bg,
        opacity: isActioning ? 0.7 : 1,
      }}
    >
      <div style={styles.tableCardHeader}>
        <h3 style={{ ...styles.tableNumber, color }}>{table.number}</h3>
        <span style={{ ...styles.statusBadge, background: color, color: '#fff' }}>
          {label}
        </span>
      </div>

      <p style={{ ...styles.capacity, color }}>
        {table.capacity} {table.capacity === 1 ? 'persona' : 'personas'}
      </p>

      {/* Botones de cambio de estado */}
      <div style={styles.tableActions}>
        {table.status !== 'available' && (
          <button
            onClick={() => onStatusChange(table.id, 'available')}
            disabled={isActioning}
            style={{ ...styles.statusBtn, color: '#16a34a', borderColor: '#16a34a' }}
          >
            Disponible
          </button>
        )}
        {table.status !== 'occupied' && (
          <button
            onClick={() => onStatusChange(table.id, 'occupied')}
            disabled={isActioning}
            style={{ ...styles.statusBtn, color: '#dc2626', borderColor: '#dc2626' }}
          >
            Ocupada
          </button>
        )}
        {table.status !== 'reserved' && (
          <button
            onClick={() => onStatusChange(table.id, 'reserved')}
            disabled={isActioning}
            style={{ ...styles.statusBtn, color: '#d97706', borderColor: '#d97706' }}
          >
            Reservada
          </button>
        )}
      </div>

      {canDelete && (
        <button
          onClick={() => onDelete(table.id)}
          disabled={isActioning}
          style={styles.deleteBtn}
        >
          Eliminar
        </button>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div style={styles.statCard}>
      <p style={{ fontSize: '1.75rem', fontWeight: 700, color }}>{value}</p>
      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
        {label}
      </p>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '2rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  title: { fontSize: '1.5rem', fontWeight: 600 },
  subtitle: { color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' },
  addButton: {
    padding: '0.625rem 1rem',
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  summary: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1rem 1.5rem',
    minWidth: '120px',
    textAlign: 'center',
  },
 grid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '1rem',
},
  tableCard: {
    border: '1px solid',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    transition: 'opacity 0.15s',
  },
  tableCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableNumber: { fontSize: '1rem', fontWeight: 600 },
  statusBadge: {
    padding: '0.2rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.7rem',
    fontWeight: 500,
  },
  capacity: { fontSize: '0.8rem' },
  tableActions: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  statusBtn: {
    padding: '0.375rem',
    background: 'transparent',
    border: '1px solid',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
  },
  deleteBtn: {
    padding: '0.375rem',
    background: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#9ca3af',
    cursor: 'pointer',
    marginTop: '0.25rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
  },
  errorBox: {
    padding: '0.75rem 1rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  retryBtn: {
    padding: '0.25rem 0.75rem',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    background: 'transparent',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '1rem',
  },
  modal: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '400px',
  },
  modalTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '1.25rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  label: { fontSize: '0.875rem', fontWeight: 500, color: '#374151' },
  input: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem',
    background: '#fef2f2',
    borderRadius: '6px',
  },
  modalActions: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  cancelBtn: {
    flex: 1,
    padding: '0.625rem',
    background: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  submitBtn: {
    flex: 1,
    padding: '0.625rem',
    background: '#111827',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
};