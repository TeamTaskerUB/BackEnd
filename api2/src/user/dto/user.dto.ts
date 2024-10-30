import { IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsInt()
    age: number;

    

    @IsArray()
    @IsOptional()
    proyects?: string[]; // Lista de IDs de proyectos referenciados
}
