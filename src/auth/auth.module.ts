import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService],
  exports: [AuthModule, AuthService],
})
export class AuthModule {}
