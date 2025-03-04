import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  register(@Payload() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @MessagePattern('auth.login')
  login(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern('verify.token')
  verify(@Payload() id: string) {
    return this.authService.verify(id);
  }

  //obtener todos los usuarios

  @MessagePattern('auth.findAll')
  findAll() {
    return this.authService.findAll();
  }
}
