import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importamos ConfigModule y ConfigService
import { JwtStrategy } from './jwt.strategy'; // Importamos JwtStrategy

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Usamos ConfigModule para acceder a las variables de entorno
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Obtenemos la clave secreta desde .env
        signOptions: { expiresIn: '1h' }, // Duración del token
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Registramos AuthService y JwtStrategy
})
export class AuthModule {}