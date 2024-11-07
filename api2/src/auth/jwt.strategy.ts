import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // Para obtener la clave desde .env

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del encabezado Authorization
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // Clave secreta desde .env
    });
  }

  async validate(payload: any) {
    // Retornamos el userId y el username del payload del JWT
    return { userId: payload.sub, username: payload.username};
  }
}