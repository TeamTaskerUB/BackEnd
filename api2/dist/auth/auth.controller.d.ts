import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/user.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: Partial<CreateUserDto>): Promise<import("../user/schemas/user.schema").User>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
}
