import { IsString, IsNotEmpty, IsDate, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGlobalTaskDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsString()
  @IsNotEmpty()
  priority: string;

  @IsArray()
  @IsOptional()
  comments?: Array<{ id: string; text: string }>;  // IDs y texto de los comentarios

  @IsArray()
  @IsOptional()
  grupalTasks?: string[];  // IDs de tareas grupales asociadas

  @IsString()
  @IsNotEmpty()
  admin: string;  // ID del admin

  @IsArray()
  @IsOptional()
  tasks?: string[];  // IDs de tareas asociadas
}
