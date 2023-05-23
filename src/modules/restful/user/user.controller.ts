import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from '../../../common/auth/services/user.service';
import { PostService } from './post.service';
import { User as UserModel, Post as PostModel } from '@prisma/client';
import { UserDto } from '../../../common/dto/user.dto';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  @Post('user')
  async signupUser(@Body() userData: UserDto): Promise<UserModel> {
    return this.userService.createUser({
      name: userData.name,
      password: userData.password,
      email: userData.email,
    });
  }

  @Get('user/:id')
  async getUser(@Param('id') id: number): Promise<UserModel> {
    return this.userService.user({ id });
  }

  @Get('user')
  async getUserList(): Promise<UserModel[]> {
    return this.userService.users({});
  }

  @Delete('user/:id')
  async deleteUser(@Param('id') id: number): Promise<UserModel> {
    return this.userService.deleteUser({ id });
  }

  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.postService.post({ id: Number(id) });
  }

  @Get('feed')
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.posts({
      where: { published: true },
    });
  }

  @Get('filtered-posts/:searchString')
  async getFilteredPosts(
    @Param('searchString') searchString: string,
  ): Promise<PostModel[]> {
    return this.postService.posts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
      },
    });
  }

  @Post('post')
  async createDraft(
    @Body() postData: { title: string; content?: string; username: string },
  ): Promise<PostModel> {
    const { title, content, username } = postData;
    return this.postService.createPost({
      title,
      content,
      User: {
        connect: { name: username },
      },
    });
  }

  @Put('publish/:id')
  async publishPost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.deletePost({ id: Number(id) });
  }
}
