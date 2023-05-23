import { Inject, Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.user({ name: username, password });
    if (user && user.password === password) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async signToken(user) {
    const payload = {
      id: user.id,
      username: user.name,
      email: user.email,
    };
    //  return this.jwtService.sign(payload);
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.TOKEN_EXPIRE,
    });
  }
}
