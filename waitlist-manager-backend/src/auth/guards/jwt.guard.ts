import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JwtGuard es un wrapper sobre el AuthGuard de Passport.
// Cuando decoramos un endpoint con @UseGuards(JwtGuard):
//   1. Passport extrae el token del header Authorization
//   2. Verifica la firma con el JWT_SECRET
//   3. Llama a JwtStrategy.validate() para cargar el User
//   4. Si algo falla, devuelve 401 automáticamente
//   5. Si todo va bien, adjunta el User a req.user y deja pasar

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}