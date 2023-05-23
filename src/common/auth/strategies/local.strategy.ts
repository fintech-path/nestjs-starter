import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/common/auth/services/auth.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger;

  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    this.logger.info(
      `[${this.constructor.name}] validate user with: username = ${username}.`,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
