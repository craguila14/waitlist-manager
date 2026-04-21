# Arquitectura — Waitlist Manager

## Visión general

El sistema está dividido en dos aplicaciones independientes que se comunican via HTTP (REST) y WebSockets:

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTE (Browser)                   │
│                                                          │
│   ┌──────────────────┐       ┌──────────────────────┐   │
│   │  Página pública  │       │  Dashboard del host  │   │
│   │  /join/[slug]    │       │  /dashboard/*        │   │
│   │  (sin login)     │       │  (JWT requerido)     │   │
│   └────────┬─────────┘       └──────────┬───────────┘   │
│            │ HTTP + WS                  │ HTTP + WS      │
└────────────┼────────────────────────────┼───────────────┘
             │                            │
┌────────────▼────────────────────────────▼───────────────┐
│                    NestJS API (:3000)                    │
│                                                          │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │   Auth    │ │Restaurants│ │ Waitlist │ │  Tables  │  │
│  │  Module   │ │  Module  │ │  Module  │ │  Module  │  │
│  └───────────┘ └──────────┘ └────┬─────┘ └───────────┘  │
│                                  │                       │
│  ┌───────────────────────────────▼───────────────────┐   │
│  │            WaitlistGateway (Socket.io)            │   │
│  │         Rooms por restaurante: restaurant:{id}    │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              NotificationsModule (Twilio)           │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────┘
                               │
              ┌────────────────▼─────────────────┐
              │         PostgreSQL (:5432)        │
              │                                   │
              │  restaurants  tables  waitlist    │
              │  users        entries             │
              └───────────────────────────────────┘
```

---

## Decisiones de arquitectura

### 1. Monorepo simple (dos carpetas, un repo)

**Decisión:** backend y frontend viven en el mismo repositorio git, en carpetas separadas.

**Por qué no un monorepo con Turborepo o Nx:**
Para un proyecto de portafolio, la complejidad de una herramienta de monorepo no agrega valor visible. Un repo simple con dos carpetas es más fácil de clonar, entender y correr para quien lo evalúe.

**Por qué no repos separados:**
Mantener dos repos sincronizados para un proyecto personal agrega fricción sin beneficio. Un solo `git clone` y el proyecto completo está disponible.

---

### 2. NestJS como backend

**Decisión:** NestJS sobre Express puro o Fastify.

**Por qué:**
- La arquitectura modular de NestJS (Module → Controller → Service) mapea directamente a los dominios del negocio: `RestaurantsModule`, `WaitlistModule`, `AuthModule`.
- El `@WebSocketGateway` de NestJS integra Socket.io de forma nativa, sin configuración extra.
- Los `Guards` y `Decorators` hacen el sistema de roles (OWNER / HOST) limpio y reutilizable.
- TypeScript de primera clase — los DTOs con `class-validator` dan validación automática en todos los endpoints.

**Trade-off asumido:** NestJS tiene más boilerplate que Express. Para un proyecto pequeño esto se siente, pero para portafolio es una ventaja: demuestra que puedes trabajar con arquitecturas estructuradas como las que usan equipos reales.

---

### 3. Next.js App Router para el frontend

**Decisión:** App Router de Next.js 15 sobre Pages Router o una SPA pura.

**Por qué App Router:**
- La página pública del cliente (`/join/[slug]`) puede ser un **Server Component** — hace el fetch de datos del restaurante en el servidor, mejor SEO y tiempo de carga inicial.
- El dashboard del host usa **Client Components** porque necesita WebSockets y estado reactivo en tiempo real.
- Esta mezcla SSR + Client Components es exactamente el caso de uso que App Router resuelve bien.

**Por qué no una SPA pura (Vite + React):**
La página pública que escanea el cliente desde su celular se beneficia del SSR. Una SPA mostraría pantalla en blanco mientras carga el JS.

---

### 4. WebSockets con Socket.io (no WebSocket nativo)

**Decisión:** Socket.io sobre la API nativa de WebSocket.

**Por qué:**
- **Rooms:** Socket.io tiene el concepto de rooms nativo. Cada restaurante tiene su room (`restaurant:{id}`), y solo los clientes conectados a ese restaurante reciben los updates. Con WebSocket nativo habría que implementar esto manualmente.
- **Reconexión automática:** Si el host pierde conexión momentáneamente, Socket.io reconecta y re-subscribe al room sin intervención del usuario.
- **Fallback:** En redes corporativas que bloquean WebSockets, Socket.io cae a long-polling automáticamente.
- **NestJS Gateway:** `@WebSocketGateway` de NestJS está diseñado para Socket.io — la integración es de primera clase.

---

### 5. JWT stateless (sin sesiones)

**Decisión:** Autenticación con JWT almacenado en `httpOnly cookie`, sin sesiones en base de datos.

**Por qué:**
- El backend es **stateless** — no necesita consultar ningún store para validar un token. El `JwtGuard` decodifica y verifica la firma localmente.
- Más simple de implementar que sesiones con Redis para un proyecto de portafolio.

**Por qué `httpOnly cookie` y no `localStorage`:**
Un token en `localStorage` es accesible desde JavaScript, lo que lo hace vulnerable a ataques XSS. Una `httpOnly cookie` no es accesible desde JS — solo el browser la envía automáticamente con cada request.

**Trade-off asumido:** Sin refresh tokens en esta versión. El token expira en 7 días. Para un portafolio esto es aceptable; en producción real se implementaría un refresh token con rotación.

---

### 6. PostgreSQL + TypeORM

**Decisión:** PostgreSQL como base de datos, TypeORM como ORM.

**Por qué PostgreSQL sobre SQLite:**
SQLite es más simple pero no soporta conexiones concurrentes correctamente. Un restaurante con múltiples hosts conectados simultáneamente al dashboard necesita una DB que maneje concurrencia real.

**Por qué TypeORM:**
- Integración nativa con NestJS (`TypeOrmModule.forFeature()`).
- Las entidades como clases con decoradores son fáciles de leer y mapean 1:1 con los módulos de NestJS.
- El sistema de migraciones permite evolucionar el esquema de forma controlada.

---

### 7. Twilio para SMS

**Decisión:** Twilio sobre alternativas como AWS SNS o soluciones gratuitas.

**Por qué:**
- La API de Twilio es la más documentada y simple para comenzar.
- Tier gratuito suficiente para desarrollo y demos de portafolio.
- En el `NotificationsService` la implementación está abstraída — cambiar Twilio por otro proveedor es cambiar solo ese servicio.

**Modo desarrollo:** Cuando `TWILIO_ACCOUNT_SID` no está configurado, el servicio loguea el SMS en consola en lugar de enviarlo. Esto permite desarrollar y testear sin cuenta de Twilio.

---

## Flujos de datos principales

### Flujo 1 — Cliente se une a la fila

```
1. Cliente escanea QR
   → navega a /join/[slug]

2. Next.js Server Component
   → GET /restaurants/slug/:slug
   → recibe: { id, name, isOpen, estimatedWait }
   → renderiza el formulario con datos del restaurante

3. Cliente completa el formulario y envía
   → POST /waitlist
      body: { restaurantId, guestName, partySize, phone }
   → WaitlistService calcula position (MAX actual + 1)
   → guarda WaitlistEntry en DB
   → WaitlistGateway.emitWaitlistUpdate(restaurantId)
      → todos los sockets en room restaurant:{id} reciben el update

4. Cliente recibe respuesta
   → { entryId, position, estimatedWait }
   → frontend conecta socket y hace joinRoom(restaurant:{id})
   → escucha evento 'waitlistUpdated' para ver su posición en tiempo real
```

### Flujo 2 — Host llama a una mesa

```
1. Host hace clic en "Llamar" en el dashboard
   → PATCH /waitlist/:id/call
   → JwtGuard valida el token
   → RolesGuard verifica que el rol sea HOST u OWNER

2. WaitlistService
   → actualiza entry.status = 'called'
   → llama a NotificationsService.sendSms(phone, message)
      → Twilio envía SMS al cliente

3. WaitlistGateway
   → emitWaitlistUpdate(restaurantId)
   → todos los sockets en room restaurant:{id} reciben la fila actualizada
   → el cliente ve su card cambiar a "¡Tu mesa está lista!"

4. Host marca al cliente como sentado
   → PATCH /waitlist/:id/seat
   → entry.status = 'seated'
   → WaitlistService recalcula positions de los restantes
   → WaitlistGateway emite update nuevamente
```

---

## Estructura de módulos NestJS

```
AuthModule
  └── Provee: JwtStrategy, JwtGuard, RolesGuard
  └── Expone: POST /auth/login, POST /auth/register

RestaurantsModule
  └── Depende de: AuthModule
  └── Expone: GET /restaurants/:slug, CRUD /restaurants

TablesModule
  └── Depende de: RestaurantsModule
  └── Expone: CRUD /restaurants/:id/tables

WaitlistModule
  └── Depende de: RestaurantsModule, NotificationsModule
  └── Expone: POST /waitlist, PATCH /waitlist/:id/call, PATCH /waitlist/:id/seat
  └── Contiene: WaitlistGateway (WebSocket)

NotificationsModule
  └── No depende de otros módulos
  └── Expone: NotificationsService (usado internamente)
```

---

## Lo que este proyecto NO incluye (y por qué)

| Feature | Razón de exclusión |
|---|---|
| Refresh tokens | Complejidad no justificada para portafolio |
| Tests unitarios / e2e | Se pueden agregar como mejora futura documentada |
| Rate limiting | No es el foco del proyecto |
| Pagos | Fuera del alcance del flujo de waitlist |
| Multi-idioma | No agrega valor técnico visible |

Estas exclusiones son **decisiones conscientes**, no omisiones. En una entrevista, saber articular qué dejaste afuera y por qué es tan valioso como saber qué pusiste adentro.