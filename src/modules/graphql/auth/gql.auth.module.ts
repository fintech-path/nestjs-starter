import { Module } from '@nestjs/common';
import { GqlAuthResolver } from './gql.auth.resolver';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../../restful/auth/auth.module';

@Module({
  imports: [PassportModule, AuthModule],
  providers: [GqlAuthResolver],
})
export class GqlAuthModule {}
