import { Controller, Post, Get, Body, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService, RegisterDto, LoginDto } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: UserPayload) {
    return this.authService.getMe(user.id);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword?: string; password?: string }) {
    return this.authService.resetPassword(body.token, body.newPassword || body.password || '');
  }

  @Get('verify-email')
  async verifyEmailGet(@Query('token') token: string, @Res() res: Response) {
    const frontendUrl = 'http://localhost:8080';
    try {
      await this.authService.verifyEmail(token);
      return res.redirect(`${frontendUrl}/login?verified=true`);
    } catch (err: any) {
      return res.redirect(`${frontendUrl}/login?verification_error=${encodeURIComponent(err.message || 'Invalid or expired link')}`);
    }
  }

  @Post('verify-email')
  async verifyEmailPost(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}

