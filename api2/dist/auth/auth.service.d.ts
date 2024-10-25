import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/user.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    register(registerDto: Partial<CreateUserDto>): Promise<import("../user/schemas/user.schema").User>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
}
