import { IsString, IsNotEmpty, IsDate, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {

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

  @IsString()
  @IsNotEmpty()
  groupalTaskId: string;

  @IsString()
  @IsNotEmpty()
  globalTaskId: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;  // Campo opcional para cambiar el status, por defecto será false
}
