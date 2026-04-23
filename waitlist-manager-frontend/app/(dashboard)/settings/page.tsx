'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { restaurantsApi, Restaurant } from '@/lib/api';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const restaurantId = user?.restaurantId ?? '';

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    estimatedWaitMinutes: '',
    isOpen: true,
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [staffEmail, setStaffEmail] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSuccess, setStaffSuccess] = useState('');
  const [staffError, setStaffError] = useState('');

  // Formulario de creación de restaurante
  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    estimatedWaitMinutes: '15',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadRestaurant = useCallback(async () => {
    if (!restaurantId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await restaurantsApi.getById(restaurantId);
      setRestaurant(data);
      setForm({
        name: data.name,
        phone: data.phone ?? '',
        estimatedWaitMinutes: String(data.estimatedWaitMinutes ?? 0),
        isOpen: data.isOpen,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el restaurante');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadRestaurant();
  }, [loadRestaurant]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      await restaurantsApi.create({
        name: createForm.name,
        phone: createForm.phone,
        estimatedWaitMinutes: parseInt(createForm.estimatedWaitMinutes) || 15,
      });
      await login(user!.email, '');
      window.location.reload();
    } catch (err) {
      window.location.reload();
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);
    setSaveLoading(true);

    try {
      const updated = await restaurantsApi.update(restaurantId, {
        name: form.name,
        phone: form.phone,
        estimatedWaitMinutes: parseInt(form.estimatedWaitMinutes) || 0,
        isOpen: form.isOpen,
      });
      setRestaurant(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    setStaffError('');
    setStaffSuccess('');
    setStaffLoading(true);

    try {
      const result = await restaurantsApi.addStaff(restaurantId, staffEmail);
      setStaffSuccess(result.message);
      setStaffEmail('');
    } catch (err) {
      setStaffError(err instanceof Error ? err.message : 'Error al agregar staff');
    } finally {
      setStaffLoading(false);
    }
  }

  if (user?.role !== 'owner') {
    return (
      <div style={styles.page}>
        <p style={{ color: '#6b7280' }}>No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={styles.page}>
        <p style={{ color: '#6b7280' }}>Cargando...</p>
      </div>
    );
  }

  // ── El OWNER no tiene restaurante todavía — mostramos el formulario de creación
  if (!restaurantId || !restaurant) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h2 style={styles.title}>Crear tu restaurante</h2>
          <p style={styles.subtitle}>
            Configura los datos básicos para empezar a gestionar tu fila de espera
          </p>
        </div>

        <div style={styles.section}>
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.label}>Nombre del restaurante</label>
                <input
                  style={styles.input}
                  value={createForm.name}
                  onChange={e =>
                    setCreateForm(p => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Ej: La Pérgola del Sur"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Teléfono (opcional)</label>
                <input
                  style={styles.input}
                  value={createForm.phone}
                  onChange={e =>
                    setCreateForm(p => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+56912345678"
                />
              </div>
            </div>

            <div style={{ maxWidth: '280px' }}>
              <div style={styles.field}>
                <label style={styles.label}>Tiempo de espera estimado (minutos)</label>
                <input
                  style={styles.input}
                  type="number"
                  min={0}
                  value={createForm.estimatedWaitMinutes}
                  onChange={e =>
                    setCreateForm(p => ({
                      ...p,
                      estimatedWaitMinutes: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {createError && <p style={styles.errorText}>{createError}</p>}

            <div>
              <button
                type="submit"
                disabled={createLoading}
                style={{
                  ...styles.saveBtn,
                  opacity: createLoading ? 0.7 : 1,
                  cursor: createLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {createLoading ? 'Creando restaurante...' : 'Crear restaurante'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── El OWNER ya tiene restaurante — mostramos la configuración completa
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Configuración</h2>
        <p style={styles.subtitle}>{restaurant.name}</p>
      </div>

      <div style={styles.sections}>

        {/* Datos del restaurante */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Datos del restaurante</h3>
          <form onSubmit={handleSave} style={styles.form}>
            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.label}>Nombre</label>
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Teléfono</label>
                <input
                  style={styles.input}
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+56912345678"
                />
              </div>
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.label}>Tiempo de espera estimado (minutos)</label>
                <input
                  style={styles.input}
                  type="number"
                  min={0}
                  value={form.estimatedWaitMinutes}
                  onChange={e =>
                    setForm(p => ({ ...p, estimatedWaitMinutes: e.target.value }))
                  }
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Estado del restaurante</label>
                <div style={styles.toggleRow}>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, isOpen: !p.isOpen }))}
                    style={{
                      ...styles.toggleBtn,
                      background: form.isOpen ? '#16a34a' : '#6b7280',
                    }}
                  >
                    <span
                      style={{
                        ...styles.toggleKnob,
                        transform: form.isOpen
                          ? 'translateX(-20px)'
                          : 'translateX(2px)',
                      }}
                    />
                  </button>
                  <span style={styles.toggleLabel}>
                    {form.isOpen
                      ? 'Abierto — acepta clientes'
                      : 'Cerrado — no acepta clientes'}
                  </span>
                </div>
              </div>
            </div>

            {saveError && <p style={styles.errorText}>{saveError}</p>}
            {saveSuccess && (
              <p style={styles.successText}>Cambios guardados correctamente</p>
            )}

            <div style={styles.formFooter}>
              <div style={styles.slugInfo}>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                  URL del QR:
                </span>
                <code style={styles.slugCode}>/join/{restaurant.slug}</code>
              </div>
              <button
                type="submit"
                disabled={saveLoading}
                style={{
                  ...styles.saveBtn,
                  opacity: saveLoading ? 0.7 : 1,
                }}
              >
                {saveLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </section>

        {/* Staff */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Agregar staff</h3>
          <p style={styles.sectionDesc}>
            Ingresa el email de un usuario ya registrado como HOST para
            vincularlo a tu restaurante.
          </p>
          <form onSubmit={handleAddStaff} style={styles.staffForm}>
            <input
              style={{ ...styles.input, flex: 1 }}
              type="email"
              placeholder="email@ejemplo.com"
              value={staffEmail}
              onChange={e => setStaffEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={staffLoading}
              style={{
                ...styles.saveBtn,
                opacity: staffLoading ? 0.7 : 1,
                whiteSpace: 'nowrap' as const,
              }}
            >
              {staffLoading ? 'Agregando...' : 'Agregar'}
            </button>
          </form>
          {staffSuccess && (
            <p style={{ ...styles.successText, marginTop: '0.75rem' }}>
              {staffSuccess}
            </p>
          )}
          {staffError && (
            <p style={{ ...styles.errorText, marginTop: '0.75rem' }}>
              {staffError}
            </p>
          )}
        </section>

        {/* QR */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Código QR</h3>
          <p style={styles.sectionDesc}>
            Comparte este link para que los clientes puedan unirse a la fila.
          </p>
          <div style={styles.qrBox}>
            <code style={styles.qrUrl}>
              {typeof window !== 'undefined' ? window.location.origin : ''}/join/
              {restaurant.slug}
            </code>
            <button
              style={styles.copyBtn}
              onClick={() =>
                navigator.clipboard.writeText(
                  `${window.location.origin}/join/${restaurant.slug}`,
                )
              }
            >
              Copiar link
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '2rem' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.5rem', fontWeight: 600 },
  subtitle: { color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' },
  sections: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  section: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1.5rem',
    maxWidth: '780px',
  },
  sectionTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' },
  sectionDesc: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
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
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.375rem',
  },
  toggleBtn: {
    width: '44px',
    height: '24px',
    borderRadius: '9999px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s',
    flexShrink: 0,
  },
  toggleKnob: {
    position: 'absolute',
    top: '2px',
    width: '20px',
    height: '20px',
    background: '#ffffff',
    borderRadius: '50%',
    transition: 'transform 0.2s',
  },
  toggleLabel: { fontSize: '0.875rem', color: '#374151' },
  formFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
  },
  slugInfo: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  slugCode: {
    background: '#f3f4f6',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    color: '#374151',
  },
  saveBtn: {
    padding: '0.625rem 1.25rem',
    background: '#111827',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem',
    background: '#fef2f2',
    borderRadius: '6px',
  },
  successText: {
    color: '#16a34a',
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem',
    background: '#f0fdf4',
    borderRadius: '6px',
  },
  staffForm: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
  qrBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    gap: '1rem',
  },
  qrUrl: {
    fontSize: '0.875rem',
    color: '#374151',
    wordBreak: 'break-all' as const,
  },
  copyBtn: {
    padding: '0.375rem 0.75rem',
    background: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  },
};