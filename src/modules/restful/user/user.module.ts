import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '../../../common/auth/services/user.service';
import { PostService } from './post.service';
import { RouterModule } from '@nestjs/core';
import { PrismaService } from '../../../common/database/prisma.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '/api',
        module: UserModule,
        children: [UserController],
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, PostService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
