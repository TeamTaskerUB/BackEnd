import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { get } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { ChangePasswordDto } from './dto/changepassword.dto';

@Controller('user')
export class UserController {


    constructor(private userService: UserService){}


    
    @Post('create')
    @UsePipes(new ValidationPipe())
    async createUser(
        @Body() createUserDto: CreateUserDto
    ){
        console.log(createUserDto);
        
        // Llama al servicio para crear el usuario
        const user = await this.userService.createUser(createUserDto);
        return user; // Devuelve la respuesta
    }

    @UseGuards(JwtAuthGuard)  // Asegurarte de que el usuario está autenticado
  @Get(':id')
  async getUserById(@Param('id') id: string, @Req() req: Request) {
    

    const userId = req.user.userId.toString();
    const user = await this.userService.getUserById(userId);



    // Si no se encuentra el usuario, lanzamos una excepción
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;  // Devolver los datos del usuario
  }
    
  @Post('search')
  async searchUsersByName(@Body('name') name: string) {
    if (!name) {
      throw new NotFoundException('Please provide a name to search.');
    }

    const users = await this.userService.searchUsersByName(name);
    if (!users.length) {
      throw new NotFoundException('No users found with the given name.');
    }

    return users;
  }

  @UseGuards(JwtAuthGuard) // Proteger la ruta con autenticación JWT
  @Put('modify')
  async modifyUser(
    @Req() req: Request,
    @Body() updateData: { name?: string; email?: string; skills?: string[]; photoBase64?: string }
  ) {
    const userId = req.user.userId.toString(); // Obtener el ID del usuario del JWT

    return this.userService.modifyUser(userId, updateData);
  }

  @Post('change-password')
  @UsePipes(new ValidationPipe())
  async changePassword(
    @Req() req: Request,
    @Body() body: ChangePasswordDto,
  ) {
    const userId = req.user.userId;
    return this.userService.changePassword(userId, body.currentPassword, body.newPassword);
  }


   

    
}
