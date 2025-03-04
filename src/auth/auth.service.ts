import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InterfaceJwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  constructor(private readonly jwtService: JwtService) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
  }

  async register(registerDto: RegisterDto) {
    const exist = await this.user.findUnique({
      where: { email: registerDto.email },
    });

    if (exist) {
      throw new RpcException({
        status: 401,
        message: 'Email already exists',
      });
    }

    const user = await this.user.create({
      data: {
        ...registerDto,
        password: bcrypt.hashSync(registerDto.password, 10),
      },
    });
    return { user };
  }

  async login(loginDto: LoginDto) {
    const user = await this.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      console.log('user', user);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Credenciales Invalidas',
      });
    }

    const isMatch = bcrypt.compareSync(loginDto.password, user.password);
    if (!isMatch) {
      throw new RpcException({
        status: 401,
        message: 'Invalid password',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, createdAt: __, updatedAt: ___, ...rest } = user;

    return { user: rest, token: this.signToken(rest) };
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async verify(token: string) {
    try {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sub: _,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        iat: __,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        exp: ___,
        ...user
      } = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      return { user, token: this.signToken(user) };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
    return { token };
  }

  //create para obetner todos los usuarios
  async findAll() {
    return this.user.findMany();
  }

  signToken(payload: InterfaceJwtPayload) {
    return this.jwtService.sign(payload);
  }
}
