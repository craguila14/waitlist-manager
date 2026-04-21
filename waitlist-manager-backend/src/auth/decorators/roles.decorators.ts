import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../database/entities/user.entity';

// ROLES_KEY es la clave con la que guardamos los metadatos.
// El RolesGuard usa esta misma clave para leerlos.
export const ROLES_KEY = 'roles';

// @Roles(UserRole.OWNER) es un decorator que usarás así en los controladores:
//
// @UseGuards(JwtGuard, RolesGuard)
// @Roles(UserRole.OWNER)
// @Delete(':id')
// remove(@Param('id') id: string) { ... }
//
// Esto significa: "solo usuarios con rol OWNER pueden acceder a este endpoint"
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);