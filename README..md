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
git clone https://github.com/craguila14/waitlist-manager
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
cp .env.example .env
npm run start:dev

# 2. Frontend (en otra terminal)
cd waitlist-manager-frontend
npm install
npm run dev
```

---

## Mejoras futuras

- Refresh tokens con rotación
- Dashboard de métricas con IA (análisis de la noche, hora pico, tiempo promedio)
- Tests unitarios y e2e
- Endpoint `/auth/me` para refrescar el usuario sin hacer logout

---

## Autor

Construido por [Constanza Águila](https://portafolio-constanza-aguila.netlify.app/) como proyecto de portafolio.  
[LinkedIn](https://www.linkedin.com/in/constanza-aguila-asenjo-a56243220/) · [GitHub](https://github.com/craguila14)