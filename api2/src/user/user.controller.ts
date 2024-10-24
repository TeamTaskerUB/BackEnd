import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { get } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

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


    



   

    
}
