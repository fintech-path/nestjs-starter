import { Module } from '@nestjs/common';
import { AuthService } from '../../../common/auth/services/auth.service';
import { UserModule } from 'src/modules/restful/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from 'src/common/auth/strategies/jwt.strategy';
import { LocalStrategy } from 'src/common/auth/strategies/local.strategy';
import { AuthController } from './auth.controller';
import { RouterModule } from '@nestjs/core';
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      secretOrPrivateKey: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRE },
    }),
    RouterModule.register([
      {
        path: '/api',
        module: AuthModule,
        children: [AuthController],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
