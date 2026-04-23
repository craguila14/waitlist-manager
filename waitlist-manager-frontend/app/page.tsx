import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={s.page}>

      {/* ── Navbar ── */}
      <nav style={s.nav}>
        <span style={s.logo}>Waitlist Manager</span>
        <div style={s.navLinks}>
          <Link href="/auth/login" style={s.btnGhost}>Iniciar sesión</Link>
          <Link href="/auth/register" style={s.btnDark}>Registrarse</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={s.hero}>
        <span style={s.badge}>Proyecto de portafolio · Next.js + NestJS</span>
        <h1 style={s.heroTitle}>
          Gestiona la fila de tu<br />restaurante en tiempo real
        </h1>
        <p style={s.heroSubtitle}>
          Los clientes se unen escaneando un QR desde su celular.
          El staff gestiona todo desde un dashboard que se actualiza
          instantáneamente sin recargar la página.
        </p>
        <div style={s.heroBtns}>
          <Link href="/auth/register" style={s.btnDark}>
            Empezar gratis
          </Link>
          <a
            href="https://github.com/tu-usuario/waitlist-manager"
            target="_blank"
            rel="noopener noreferrer"
            style={s.btnGhost}
          >
            Ver código
          </a>
        </div>
      </section>

      {/* ── Pasos ── */}
      <section style={s.stepsSection}>
        <p style={s.sectionLabel}>Cómo funciona</p>
        <h2 style={s.sectionTitle}>Tres pasos, sin fricciones</h2>
        <div style={s.stepsGrid}>
          {steps.map((step, i) => (
            <div key={i} style={s.stepCard}>
              <div style={s.stepNum}>{i + 1}</div>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mockup dashboard ── */}
      <section style={s.mockupSection}>
        <div style={s.mockupText}>
          <p style={s.sectionLabel}>Dashboard del host</p>
          <h2 style={s.sectionTitle}>La fila en tiempo real</h2>
          <p style={s.mockupDesc}>
            El staff ve la fila ordenada por tiempo de espera. Con un clic
            llama a la siguiente party — el cliente recibe un SMS
            automáticamente y la fila se reordena al instante para todos
            los dispositivos conectados.
          </p>
          <ul style={s.mockupFeats}>
            {[
              'Actualización en vivo vía WebSockets',
              'SMS automático al llamar una mesa',
              'Reordenamiento atómico de posiciones',
              'Roles: OWNER y HOST con permisos distintos',
            ].map((f, i) => (
              <li key={i} style={s.mockupFeat}>
                <span style={s.check}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <div style={s.mockupFrame}>
          <div style={s.mockupBar}>
            <div style={s.mockupDots}>
              <span style={{ ...s.dot, background: '#ef4444' }} />
              <span style={{ ...s.dot, background: '#f59e0b' }} />
              <span style={{ ...s.dot, background: '#22c55e' }} />
            </div>
            <span style={s.mockupUrl}>dashboard · fila de espera</span>
          </div>
          <div style={s.mockupBody}>
            <div style={s.mockupHeader}>
              <span style={s.mockupPageTitle}>Fila de espera</span>
              <span style={s.liveBadge}>● En vivo</span>
            </div>
            {mockupRows.map((row, i) => (
              <div key={i} style={s.mockupRow}>
                <span style={s.mockupPos}>{row.pos}</span>
                <div style={s.mockupInfo}>
                  <span style={s.mockupName}>{row.name}</span>
                  <span style={s.mockupMeta}>{row.meta}</span>
                </div>
                <span
                  style={{
                    ...s.chip,
                    background: row.chipBg,
                    color: row.chipColor,
                  }}
                >
                  {row.status}
                </span>
                <button style={s.mockupBtn}>{row.action}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mockup cliente ── */}
      <section style={s.clientSection}>
        <div style={s.clientMockup}>
          <div style={s.phoneFrame}>
            <div style={s.phoneScreen}>
              <p style={s.phoneRestaurant}>La Pérgola del Sur</p>
              <p style={s.phoneWait}>Espera estimada: ~20 min</p>
              <div style={s.phoneCard}>
                <p style={s.phonePosLabel}>Tu posición</p>
                <p style={s.phonePosNum}>3</p>
              </div>
              <div style={s.phoneRows}>
                <div style={s.phoneRow}>
                  <span style={s.phoneLabel}>Nombre</span>
                  <span style={s.phoneVal}>Martín</span>
                </div>
                <div style={s.phoneRow}>
                  <span style={s.phoneLabel}>Grupo</span>
                  <span style={s.phoneVal}>4 personas</span>
                </div>
                <div style={s.phoneRow}>
                  <span style={s.phoneLabel}>Esperando</span>
                  <span style={s.phoneVal}>3 min</span>
                </div>
              </div>
              <p style={s.phoneHint}>Te avisaremos por SMS cuando tu mesa esté lista</p>
            </div>
          </div>
        </div>
        <div style={s.clientText}>
          <p style={s.sectionLabel}>Página del cliente</p>
          <h2 style={s.sectionTitle}>Sin descargar nada</h2>
          <p style={s.mockupDesc}>
            El cliente escanea el QR con su cámara, completa un formulario
            simple y queda en la fila. Ve su posición en tiempo real y recibe
            un SMS cuando su mesa está lista — sin crear cuenta ni descargar
            ninguna app.
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={s.featuresSection}>
        <p style={s.sectionLabel}>Características técnicas</p>
        <h2 style={s.sectionTitle}>Lo que hace interesante este proyecto</h2>
        <div style={s.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} style={s.featCard}>
              <span style={s.featIcon}>{f.icon}</span>
              <h3 style={s.featTitle}>{f.title}</h3>
              <p style={s.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stack ── */}
      <section style={s.stackSection}>
        <p style={s.sectionLabel}>Stack tecnológico</p>
        <div style={s.stackGrid}>
          {stackItems.map((item, i) => (
            <div key={i} style={s.stackCard}>
              <span style={s.stackName}>{item.name}</span>
              <span style={s.stackRole}>{item.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.cta}>
        <h2 style={s.ctaTitle}>¿Quieres probarlo?</h2>
        <p style={s.ctaSubtitle}>
          Crea una cuenta, configura tu restaurante y comparte el QR.
          Todo listo en menos de 5 minutos.
        </p>
        <div style={s.heroBtns}>
          <Link href="/auth/register" style={{ ...s.btnDark, fontSize: '0.95rem', padding: '0.75rem 1.75rem' }}>
            Crear cuenta gratis
          </Link>
          <Link href="/auth/login" style={{ ...s.btnGhost, fontSize: '0.95rem', padding: '0.75rem 1.75rem' }}>
            Iniciar sesión
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <p style={s.footerText}>
          Construido por{' '}
          <a href="https://github.com/craguila14" style={s.footerLink}>
            Constanza Águila
          </a>{' '}
          · Proyecto de portafolio ·{' '}
          <a
            href="https://github.com/craguila14/waitlist-manager"
            style={s.footerLink}
          >
            GitHub
          </a>
        </p>
      </footer>

    </div>
  );
}

// ── Datos ────────────────────────────────────────────────────────────────────

const steps = [
  {
    title: 'Cliente escanea el QR',
    desc: 'Entra a la página pública desde su celular, completa su nombre, tamaño de grupo y teléfono.',
  },
  {
    title: 'Queda en la fila',
    desc: 'Ve su posición en tiempo real. Puede cancelar su lugar si cambia de opinión.',
  },
  {
    title: 'Staff gestiona el dashboard',
    desc: 'La fila se actualiza en vivo. Un clic para llamar a la mesa — el SMS sale automático.',
  },
];

const mockupRows = [
  { pos: 1, name: 'García', meta: '3 personas · 12 min', status: 'Esperando', chipBg: '#fef9c3', chipColor: '#854d0e', action: 'Llamar' },
  { pos: 2, name: 'López', meta: '2 personas · 8 min', status: 'Llamado', chipBg: '#dbeafe', chipColor: '#1e40af', action: 'Sentar' },
  { pos: 3, name: 'Martín', meta: '4 personas · 3 min', status: 'Esperando', chipBg: '#fef9c3', chipColor: '#854d0e', action: 'Llamar' },
];

const features = [
  {
    icon: '⚡',
    title: 'WebSockets con Socket.io',
    desc: 'Rooms por restaurante. Todos los dispositivos conectados reciben updates al instante sin polling.',
  },
  {
    icon: '🔐',
    title: 'JWT + RBAC',
    desc: 'Autenticación stateless con roles OWNER y HOST. Guards y decoradores de NestJS para proteger rutas.',
  },
  {
    icon: '📊',
    title: 'Reordenamiento atómico',
    desc: 'Una sola query UPDATE en PostgreSQL reorganiza la fila. Sin race conditions ni estados inconsistentes.',
  },
  {
    icon: '📱',
    title: 'SMS con Twilio',
    desc: 'Modo mock en desarrollo — los SMS se loguean en consola sin necesitar cuenta de Twilio.',
  },
  {
    icon: '🐳',
    title: 'Docker Compose',
    desc: 'Un solo comando levanta backend, frontend y PostgreSQL. Sin configuración manual.',
  },
  {
    icon: '🗄️',
    title: 'TypeORM + PostgreSQL',
    desc: 'Entidades con enums reales, relaciones explícitas y sincronización automática en desarrollo.',
  },
];

const stackItems = [
  { name: 'Next.js 15', role: 'Frontend · App Router' },
  { name: 'NestJS', role: 'Backend · API REST' },
  { name: 'PostgreSQL', role: 'Base de datos' },
  { name: 'TypeORM', role: 'ORM' },
  { name: 'Socket.io', role: 'Tiempo real' },
  { name: 'JWT', role: 'Autenticación' },
  { name: 'Twilio', role: 'SMS' },
  { name: 'Docker', role: 'Contenedores' },
];

// ── Estilos ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui, sans-serif' },

  // Navbar
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderBottom: '1px solid #e5e7eb',
    background: '#ffffff',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logo: { fontSize: '1rem', fontWeight: 700, color: '#111827' },
  navLinks: { display: 'flex', gap: '0.5rem' },
  btnGhost: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: 'transparent',
    fontSize: '0.875rem',
    color: '#374151',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  },
  btnDark: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '8px',
    background: '#111827',
    fontSize: '0.875rem',
    color: '#ffffff',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  },

  // Hero
  hero: {
    textAlign: 'center',
    padding: '5rem 2rem 4rem',
    background: '#ffffff',
    maxWidth: '720px',
    margin: '0 auto',
  },
  badge: {
    display: 'inline-block',
    padding: '0.3rem 0.875rem',
    background: '#f0fdf4',
    color: '#166534',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: 500,
    marginBottom: '1.25rem',
    border: '1px solid #bbf7d0',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1.15,
    marginBottom: '1.25rem',
    letterSpacing: '-0.02em',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: '#6b7280',
    lineHeight: 1.7,
    marginBottom: '2rem',
    maxWidth: '520px',
    margin: '0 auto 2rem',
  },
  heroBtns: { display: 'flex', gap: '0.75rem', justifyContent: 'center' },

  // Sección genérica
  sectionLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '0.5rem',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '1.5rem',
    letterSpacing: '-0.01em',
  },

  // Steps
  stepsSection: {
    padding: '5rem 4rem',
    background: '#f9fafb',
    textAlign: 'center',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  stepCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '1.75rem',
    textAlign: 'left',
  },
  stepNum: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#111827',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  stepTitle: { fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' },
  stepDesc: { fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 },

  // Mockup dashboard
  mockupSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.4fr',
    gap: '4rem',
    padding: '5rem 4rem',
    alignItems: 'center',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  mockupText: {},
  mockupDesc: { fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '1.25rem' },
  mockupFeats: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  mockupFeat: { fontSize: '0.875rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  check: { color: '#16a34a', fontWeight: 700, flexShrink: 0 },
  mockupFrame: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  mockupBar: {
    background: '#111827',
    padding: '0.625rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  mockupDots: { display: 'flex', gap: '5px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%' },
  mockupUrl: { fontSize: '0.75rem', color: '#9ca3af' },
  mockupBody: { padding: '1rem', background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  mockupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  mockupPageTitle: { fontSize: '0.9rem', fontWeight: 600, color: '#111827' },
  liveBadge: { fontSize: '0.72rem', color: '#16a34a', fontWeight: 500 },
  mockupRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0.625rem 0.875rem',
  },
  mockupPos: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#374151',
    flexShrink: 0,
    textAlign: 'center',
    lineHeight: '24px',
  },
  mockupInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' },
  mockupName: { fontSize: '0.825rem', fontWeight: 500, color: '#111827' },
  mockupMeta: { fontSize: '0.72rem', color: '#9ca3af' },
  chip: { padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 500, whiteSpace: 'nowrap' },
  mockupBtn: {
    padding: '3px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '5px',
    background: '#ffffff',
    fontSize: '0.72rem',
    color: '#374151',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  // Mockup cliente
  clientSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4rem',
    padding: '5rem 4rem',
    background: '#f9fafb',
    alignItems: 'center',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  clientMockup: { display: 'flex', justifyContent: 'center' },
  clientText: {},
  phoneFrame: {
    width: '240px',
    border: '8px solid #111827',
    borderRadius: '32px',
    overflow: 'hidden',
    background: '#ffffff',
  },
  phoneScreen: { padding: '1.25rem 1rem', textAlign: 'center' },
  phoneRestaurant: { fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' },
  phoneWait: { fontSize: '0.72rem', color: '#6b7280', marginBottom: '1rem' },
  phoneCard: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '0.875rem',
  },
  phonePosLabel: { fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.25rem' },
  phonePosNum: { fontSize: '2.5rem', fontWeight: 800, color: '#111827', lineHeight: 1 },
  phoneRows: { textAlign: 'left', marginBottom: '0.875rem' },
  phoneRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.375rem 0',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '0.75rem',
  },
  phoneLabel: { color: '#9ca3af' },
  phoneVal: { fontWeight: 500, color: '#111827' },
  phoneHint: { fontSize: '0.68rem', color: '#9ca3af', lineHeight: 1.5 },

  // Features
  featuresSection: {
    padding: '5rem 4rem',
    background: '#ffffff',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  featCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '1.5rem',
    background: '#ffffff',
  },
  featIcon: { fontSize: '1.5rem', display: 'block', marginBottom: '0.75rem' },
  featTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' },
  featDesc: { fontSize: '0.825rem', color: '#6b7280', lineHeight: 1.6 },

  // Stack
  stackSection: {
    padding: '3rem 4rem',
    background: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
    borderBottom: '1px solid #e5e7eb',
  },
  stackGrid: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginTop: '1rem',
  },
  stackCard: {
    padding: '0.5rem 1rem',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  stackName: { fontSize: '0.825rem', fontWeight: 600, color: '#111827' },
  stackRole: { fontSize: '0.72rem', color: '#9ca3af' },

  // CTA
  cta: {
    textAlign: 'center',
    padding: '5rem 2rem',
    background: '#111827',
  },
  ctaTitle: { fontSize: '2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' },
  ctaSubtitle: { fontSize: '1rem', color: '#9ca3af', marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem' },

  // Footer
  footer: {
    textAlign: 'center',
    padding: '1.5rem',
    background: '#111827',
    borderTop: '1px solid #1f2937',
  },
  footerText: { fontSize: '0.8rem', color: '#6b7280' },
  footerLink: { color: '#9ca3af', textDecoration: 'underline' },
};