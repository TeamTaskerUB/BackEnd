import { BadRequestException, ForbiddenException, Injectable, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/user.dto';
import { NotFoundError, throwIfEmpty } from 'rxjs';
import { Type } from 'class-transformer';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  
      async searchUsersByName(name: string) {
        const users = await this.userModel
          .find({ name: { $regex: name, $options: 'i' } }) // Case-insensitive search
          .select('_id name') // Only return `id` and `name`
          .lean();
        
        if (!users || users.length === 0) {
          throw new NotFoundException('No users found with the given name.');
        }
        
        return users.map(user => ({
          id: user._id,
          name: user.name,
        }));
      }

    
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
    

      async modifyUser(userId: string, updateData: { name?: string; email?: string; skills?: string[]; photoBase64?: string }): Promise<User> {
        const user = await this.userModel.findById(userId);
    
        if (!user) {
          throw new NotFoundException(`User with ID "${userId}" not found`);
        }
    
        // Actualizar los valores si existen
        if (updateData.name) user.name = updateData.name;
        if (updateData.email) user.email = updateData.email;
        if (updateData.skills) user.skills = updateData.skills;
        if (updateData.photoBase64) user.photo = updateData.photoBase64; // Asumiendo que `photo` es un campo de la base de datos
    
        await user.save();
    
        return user;
      }

      
      async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<string> {
        // Buscar el usuario por su ID
        const user = await this.userModel.findById(userId);
        if (!user) {
          throw new NotFoundException(`User with ID "${userId}" not found`);
        }
      
        // Verificar si la contraseña actual coincide
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          throw new ForbiddenException('Current password is incorrect');
        }
      
        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
      
        // Actualizar la contraseña del usuario
        user.password = hashedPassword;
        await user.save();
      
        return 'Password updated successfully';
      }
      

   


}
