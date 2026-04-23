# Waitlist Manager 🍽️

Sistema de gestión de filas de espera en tiempo real para restaurantes. Los clientes se unen escaneando un QR, y el staff gestiona las mesas desde un dashboard que se actualiza instantáneamente sin recargar la página.

> Proyecto de portafolio construido con Next.js + NestJS para demostrar arquitectura fullstack con WebSockets, JWT auth y notificaciones SMS.

---

## ¿Qué problema resuelve?

Los restaurantes con fila de espera suelen manejarla con papel y lápiz. Este sistema digitaliza ese flujo:

- El cliente escanea un QR en la entrada → completa un formulario simple → queda en la fila
- El host ve la fila en tiempo real → llama a la mesa con un clic
- El cliente recibe un SMS cuando su mesa está lista
- Si el cliente cancela, la fila se reordena automáticamente

---

## Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend | Next.js 15 (App Router) | SSR para la página pública, Client Components para el dashboard en tiempo real |
| Backend | NestJS | Arquitectura modular, WebSocket Gateway nativo, decoradores para guards y roles |
| Base de datos | PostgreSQL + TypeORM | Relaciones claras, enums reales, sincronización automática en desarrollo |
| Tiempo real | Socket.io (NestJS Gateway) | Rooms por restaurante, actualización sin polling |
| Autenticación | JWT + Guards de NestJS | Roles OWNER y HOST con acceso diferenciado |
| Notificaciones | Twilio SMS | SMS al cliente cuando su mesa está lista. Modo mock en desarrollo |
| Contenedores | Docker Compose | Un solo comando levanta todo el proyecto |

---

## Correr con Docker (recomendado)

### Requisitos
- Docker y Docker Compose instalados

### Un solo comando

```bash
git clone https://github.com/tu-usuario/waitlist-manager
cd waitlist-manager
docker-compose up
```

El frontend estará en `http://localhost:3001`  
El backend estará en `http://localhost:3000`  
PostgreSQL en `localhost:5432`

> Las tablas se crean automáticamente al arrancar gracias a `synchronize: true` de TypeORM.

---

## Correr manualmente (desarrollo)

### Requisitos
- Node.js 20+
- PostgreSQL corriendo localmente

```bash
# 1. Backend
cd waitlist-manager-backend
npm install
cp .env.example .env   # edita con tus credenciales
npm run start:dev

# 2. Frontend (en otra terminal)
cd waitlist-manager-frontend
npm install
npm run dev
```

---

## Variables de entorno

### Backend (`waitlist-manager-backend/.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/waitlist_db
JWT_SECRET=un_secreto_largo_y_aleatorio
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# Twilio — opcional. Sin estas variables los SMS se loguean en consola.
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend (`waitlist-manager-frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

---

## Estructura del proyecto

```
waitlist-manager/
├── docker-compose.yml
├── README.md
├── ARCHITECTURE.md
├── waitlist-manager-backend/
│   ├── Dockerfile
│   └── src/
│       ├── auth/
│       ├── restaurants/
│       ├── waitlist/
│       ├── notifications/
│       └── database/
└── waitlist-manager-frontend/
    ├── Dockerfile
    └── src/
        ├── app/
        │   ├── page.tsx              # landing
        │   ├── auth/
        │   ├── (dashboard)/
        │   └── (public)/join/[slug]/
        ├── context/
        ├── hooks/
        └── lib/
```

---

## Flujo técnico

```
Cliente escanea QR
  → GET /restaurants/slug/:slug     (datos del restaurante)
  → POST /waitlist                  (se une a la fila)
  → WS joinRoom restaurant:id       (escucha su posición en tiempo real)

Host en dashboard
  → WS joinRoom restaurant:id       (recibe updates en tiempo real)
  → PATCH /waitlist/:id/call        (llama a una party)
    → NotificationsService          (envía SMS por Twilio)
    → WS emit waitlistUpdated       (actualiza todos los clientes conectados)
```

---

## Decisiones técnicas

**¿Por qué Socket.io y no WebSocket nativo?**  
Rooms nativos, reconexión automática y fallback a long-polling. NestJS lo integra con `@WebSocketGateway`.

**¿Por qué JWT stateless?**  
El backend no necesita consultar estado para validar un token. Escala horizontalmente sin Redis.

**¿Por qué reordenamiento atómico?**  
Una sola query `UPDATE ... SET position = position - 1` evita race conditions cuando múltiples hosts actúan simultáneamente.

---

## Mejoras futuras

- Refresh tokens con rotación
- Dashboard de métricas con IA (análisis de la noche, hora pico, tiempo promedio)
- Tests unitarios y e2e
- Endpoint `/auth/me` para refrescar el usuario sin hacer logout

---

## Autor

Construido por [Tu Nombre](https://tu-portfolio.com) como proyecto de portafolio.  
[LinkedIn](https://linkedin.com/in/tu-perfil) · [GitHub](https://github.com/tu-usuario)