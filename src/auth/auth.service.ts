/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { RegisterUserDto } from 'src/dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from 'src/dto/interfaces/jwt-payload.interface';
import { envs } from 'src/config/envs';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  constructor(private readonly jwtService: JwtService) {
    super();
  }
  onModuleInit() {
    this.$connect();
  }

  async signJWT(payload: JWTPayload) {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      return {
        user: user,
        token: await this.signJWT(user),
      };
    } catch (error) {
      console.log(error);
      throw new RpcException({
        status: 400,
        message: 'Invalid Token',
      });
    }
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password } = registerUserDto;

    try {
      const user = await this.authUser.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User already exists',
        });
      }

      const newUser = await this.authUser.create({
        data: {
          email: email,
          name: name,
          password: bcrypt.hashSync(password, 10),
        },
      });

      const { password: __, ...rest } = newUser;
      console.log(__);

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async loginUser(loginuserDto: LoginUserDto) {
    const { email, password } = loginuserDto;

    try {
      const user = await this.authUser.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        console.log("user")
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Credenciales Invalidas',
        });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Credenciales Invalidas',
        });
      }
      const { password: __, ...rest } = user;
      console.log(__);

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}
