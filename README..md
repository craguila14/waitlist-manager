# Waitlist Manager 🍽️

Sistema de gestión de filas de espera en tiempo real para restaurantes. Los clientes se unen a la fila escaneando un QR, y el staff gestiona las mesas desde un dashboard que se actualiza instantáneamente sin recargar la página.

> Proyecto de portafolio construido con Next.js + NestJS para demostrar arquitectura fullstack con WebSockets, JWT auth y notificaciones SMS.

---

## ¿Qué problema resuelve?

Los restaurantes con fila de espera suelen manejarla con papel y lápiz o llamando el nombre en voz alta. Este sistema digitaliza ese flujo:

- El cliente escanea un QR en la entrada → completa un formulario simple → queda en la fila
- El host ve la fila en tiempo real en una tablet → llama a la mesa con un clic
- El cliente recibe un SMS cuando su mesa está lista
- Si el cliente cancela o no llega, la fila se reordena automáticamente

---

## Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR para la página pública del cliente, Client Components para el dashboard en tiempo real |
| Backend | NestJS | Arquitectura modular, WebSocket Gateway nativo, decoradores para guards y roles |
| Base de datos | PostgreSQL + TypeORM | Relaciones claras entre Restaurant, Table y WaitlistEntry |
| Tiempo real | Socket.io (NestJS Gateway) | Rooms por restaurante, el dashboard se actualiza sin polling |
| Autenticación | JWT + Guards de NestJS | Roles: OWNER y HOST con acceso diferenciado |
| Notificaciones | Twilio SMS | El cliente recibe SMS cuando su mesa está lista |
| Contenedor | Docker Compose | PostgreSQL + Redis listos con un comando |

---

## Funcionalidades

### Para el cliente (página pública — sin login)
- Escanea QR único por restaurante
- Completa formulario: nombre, tamaño del grupo, teléfono
- Ve su posición en la fila en tiempo real
- Recibe SMS cuando su mesa está lista
- Puede cancelar su lugar desde el link del SMS

### Para el host / staff (dashboard protegido)
- Ve la fila completa ordenada por tiempo de espera
- Llama a una party con un clic (dispara el SMS)
- Marca una party como sentada o cancelada
- Ve el estado de cada mesa (disponible / ocupada / reservada)
- Todo se actualiza en tiempo real vía WebSockets

### Para el dueño (rol OWNER)
- Gestiona el restaurante (nombre, capacidad, horarios)
- Agrega y edita mesas
- Agrega cuentas de staff (rol HOST)
- Ve métricas básicas: tiempo de espera promedio, parties atendidas hoy

---

## Estructura del proyecto

```
waitlist-manager/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/
│   │   ├── restaurants/
│   │   ├── tables/
│   │   ├── waitlist/
│   │   └── notifications/
│   └── ...
├── frontend/         # Next.js App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/    # rutas protegidas para staff
│   │   │   └── join/[slug]/    # página pública para clientes
│   │   └── ...
│   └── ...
└── docker-compose.yml
```

---

## Correr el proyecto localmente

### Requisitos
- Node.js 20+
- Docker y Docker Compose
- Cuenta de Twilio (para SMS — opcional en desarrollo)

### Pasos

```bash
# 1. Clonar el repo
git clone https://github.com/tu-usuario/waitlist-manager
cd waitlist-manager

# 2. Levantar PostgreSQL y Redis con Docker
docker-compose up -d

# 3. Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# editar los archivos .env con tus credenciales

# 4. Instalar dependencias y correr el backend
cd backend
npm install
npm run migration:run
npm run start:dev

# 5. En otra terminal, correr el frontend
cd frontend
npm install
npm run dev
```

El backend corre en `http://localhost:3000`  
El frontend corre en `http://localhost:3001`

---

## Variables de entorno

### Backend (`backend/.env`)

```env
# Base de datos
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/waitlist_db

# JWT
JWT_SECRET=tu_secreto_muy_largo_aqui
JWT_EXPIRES_IN=7d

# Twilio (opcional en desarrollo)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# App
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

---

## Flujo técnico completo

```
Cliente escanea QR
  → GET /restaurants/:slug        (datos del restaurante)
  → POST /waitlist                (se une a la fila)
  → WS joinRoom restaurant:id     (escucha updates de su posición)

Host en dashboard
  → WS joinRoom restaurant:id     (recibe updates en tiempo real)
  → POST /waitlist/:id/call       (llama a una party)
    → NotificationsService        (envía SMS por Twilio)
    → WS emit waitlistUpdated     (actualiza todos los clientes conectados)
```

---

## Decisiones técnicas relevantes

**¿Por qué Socket.io y no WebSocket nativo?**  
Socket.io maneja reconexión automática, rooms, y fallback a long-polling. Para un portafolio es más práctico y el NestJS Gateway lo integra nativamente con `@WebSocketGateway`.

**¿Por qué JWT y no sessions?**  
El backend es stateless — cualquier instancia puede validar un token sin consultar estado compartido. En producción esto facilita escalar horizontalmente.

**¿Por qué roles OWNER y HOST separados?**  
Principio de mínimo privilegio: el staff solo puede gestionar la fila, no modificar la configuración del restaurante. Esto también hace el sistema más realista y demuestra conocimiento de RBAC.

---

## Autor

Construido por [Tu Nombre](https://tu-portfolio.com) como proyecto de portafolio.  
[LinkedIn](https://linkedin.com/in/tu-perfil) · [GitHub](https://github.com/tu-usuario)