import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: Partial<CreateUserDto>) {
    // Llamamos al servicio de auth para registrar el usuario
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    // Llamamos al servicio de auth para hacer login
    return this.authService.login(email, password);
  }
}