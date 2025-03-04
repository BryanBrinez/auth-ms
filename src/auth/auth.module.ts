import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { environments } from 'src/config/environments';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.register({
      secret: environments.jwtSecret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class AuthModule {}
