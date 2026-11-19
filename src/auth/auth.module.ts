import { Module } from '@nestjs/common';
import { JwtModule } from "@nestjs/jwt";

import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

import { envs } from '../config/index.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.register({
      global: true,
      secret: envs.authJwtSecret,
      signOptions: { expiresIn: '2h' }
    })
  ]
})
export class AuthModule { }
