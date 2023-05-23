import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from '../../../common/auth/services/auth.service';
import { Public } from 'src/core/decorators/public.decorator';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Resolver('Auth')
@Injectable()
export class GqlAuthResolver {
  @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger;
  constructor(private authService: AuthService) {}

  @Public()
  @Mutation('token')
  async getToken(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<string> {
    this.logger.info(
      `[${this.constructor.name}] GraphQL Token Request with username: ${username}`,
    );
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.signToken(user);
  }
}
