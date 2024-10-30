import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService, // Inyectamos JwtService
  ) {}

  async register(registerDto: Partial<CreateUserDto>) {
    // Verificamos si ya existe un usuario con el mismo correo electrónico
    const userExists = await this.userService.getUserByEmail(registerDto.email);
    
    if (userExists) {
      throw new ConflictException('El usuario ya existe');
    }

    // Si no existe, creamos el usuario utilizando el servicio de User
    return this.userService.createUser(registerDto as CreateUserDto);
  }

  async login(email: string, password: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('no existe ese usuario');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Crear el payload solo con userId y username, sin rol
    const payload = { username: user.name, sub: user._id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}