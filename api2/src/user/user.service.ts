import { BadRequestException, Injectable, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/user.dto';
import { NotFoundError, throwIfEmpty } from 'rxjs';
import { Type } from 'class-transformer';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {


    
    async getUserByEmail(email: string) {
        return this.userModel.findOne({ email });
      }
    
    
    

    constructor(@InjectModel(User.name) private userModel: Model<User>){}

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const saltOrRounds = 12; // Definimos la cantidad de rondas para el salteo del hash
        const hashedPassword = await bcrypt.hash(createUserDto.password, saltOrRounds); // Hasheamos la contraseña
    
        const newUser = new this.userModel({
          ...createUserDto,
          password: hashedPassword, // Guardamos la contraseña hasheada
        });
    
        return newUser.save();
      }

      async getUserById(id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
    
        // Si el usuario no existe, lanzamos una excepción
        if (!user) {
          throw new NotFoundException(`User with ID "${id}" not found`);
        }
    
        return user;
      }
    


    

   


}
