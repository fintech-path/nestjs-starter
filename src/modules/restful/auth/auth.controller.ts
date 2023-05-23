import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../../../common/auth/services/auth.service';
import { LocalAuthGuard } from 'src/common/auth/guards/local.auth.guard';
import { Public } from '../../../core/decorators/public.decorator';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('auth/token')
  async login(@Request() req) {
    return {
      access_token: await this.authService.signToken(req.user),
    };
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
