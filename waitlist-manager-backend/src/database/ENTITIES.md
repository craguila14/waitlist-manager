# Entidades — Waitlist Manager

## Diagrama de relaciones

```
User ──────────────────────────────────────────┐
 │ ManyToOne                                   │
 │ (muchos users → un restaurante)             │
 ▼                                             │
Restaurant ◄──────────────────────────────────-┘
 │                    │                    │
 │ OneToMany          │ OneToMany          │ OneToMany
 ▼                    ▼                    ▼
Table[]         WaitlistEntry[]          User[]
                                        (staff)
```

## Decisiones de modelado

### ¿Por qué User tiene ManyToOne con Restaurant y no al revés?

La relación natural sería pensar "un restaurante tiene muchos usuarios".
Pero en SQL, la foreign key siempre vive en el lado "muchos".

Entonces: la tabla `users` tiene una columna `restaurantId`.
La tabla `restaurants` no tiene ninguna columna de users.

TypeORM refleja esto: `User` tiene `@ManyToOne → Restaurant`,
y `Restaurant` tiene `@OneToMany → User[]` como relación inversa (sin columna real).

### ¿Por qué los enums y no strings simples?

Con un `@Column() status: string` TypeScript te avisa si escribes mal el valor,
pero la base de datos acepta cualquier string. Podrías guardar 'Waiting', 'WAITING',
'waiting ' (con espacio) y serían tres valores distintos.

Con `@Column({ type: 'enum', enum: TableStatus })`:
- PostgreSQL crea un tipo `enum` real en la DB
- La DB rechaza cualquier valor que no esté en el enum
- TypeScript infiere el tipo correcto automáticamente

### ¿Por qué calledAt y seatedAt son nullable?

Porque representan momentos que aún no ocurrieron.

Una entry recién creada tiene:
- joinedAt: "2024-01-15 20:30:00"  ← se genera automáticamente
- calledAt: null                    ← todavía no fue llamado
- seatedAt: null                    ← todavía no está sentado

Cuando el host llama a la party:
- calledAt: "2024-01-15 20:45:00"  ← se llena ahora
- seatedAt: null                    ← todavía no está sentado

Cuando se sienta:
- seatedAt: "2024-01-15 20:47:00"  ← se llena ahora

Con estos tres timestamps podemos calcular:
- Tiempo de espera: calledAt - joinedAt = 15 minutos
- Tiempo de llegada: seatedAt - calledAt = 2 minutos

### ¿Por qué onDelete: 'CASCADE' en Table y WaitlistEntry?

Si se borra un restaurante, no tiene sentido mantener sus mesas
ni su historial de fila huérfanos en la DB.

`CASCADE` le dice a PostgreSQL: "cuando borres el restaurante padre,
borra automáticamente todos sus hijos".

En User usamos `SET NULL` en cambio, porque si se borra un restaurante
no queremos perder las cuentas del staff — solo desvinculamos al user
del restaurante (su restaurantId queda en null).

### ¿Por qué el slug se genera en @BeforeInsert y no en el Service?

Podría generarse en el Service antes de llamar a `restaurantRepo.save()`.
Pero si lo ponemos en `@BeforeInsert`, el Entity es responsable de su
propio invariante — el slug siempre va a existir sin importar desde dónde
se guarde la entidad. Es más robusto.

`@BeforeUpdate` también lo regenera por si el dueño cambia el nombre
del restaurante — el slug se actualiza automáticamente.

## Archivos

```
src/database/entities/
├── user.entity.ts
├── restaurant.entity.ts
├── table.entity.ts
└── waitlist-entry.entity.ts
```

## Cómo registrar las entidades en NestJS

Cada módulo registra sus entidades con `TypeOrmModule.forFeature([])`.
Esto le dice a TypeORM qué repositorios inyectar en ese módulo.

```typescript
// restaurants.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Table])],
  // ...
})

// waitlist.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([WaitlistEntry])],
  // ...
})
```

La configuración global de la conexión va en `app.module.ts` con
`TypeOrmModule.forRoot()` — eso se verá en el documento del módulo Auth.