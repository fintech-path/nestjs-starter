import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger;

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      expiresIn: process.env.TOKEN_EXPIRE,
    });
  }

  async validate(payload: any) {
    this.logger.info(
      `[${this.constructor.name}]  validate: ${JSON.stringify(payload)}`,
    );
    return { payload, userId: payload.sub };
  }
}
