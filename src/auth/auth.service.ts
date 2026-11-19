import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { PrismaClient } from '../../generated/prisma/client.js';
import { LoginUserDto, RegisterUserDto } from './dto/index.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { envs } from '../config/index.js';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('auth-service');

  constructor(
    private readonly jwtService: JwtService
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('MongoDB connected')
  }

  async registerUser({ email, name, password }: RegisterUserDto) {
    console.log('entramos')
    try {
      const user = await this.user.findUnique({
        where: { email }
      })

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists'
        })
      }

      const newUser = await this.user.create({
        data: {
          email,
          password: bcrypt.hashSync(password, 10),
          name
        }
      });

      const { password: __, ...rest } = newUser;

      return {
        user: rest,
        token: this.signJwt(rest)
      }
    } catch (error: any) {
      throw new RpcException({
        status: 400,
        message: error?.message ?? 'Error en registerUser'
      })
    }
  }

  async loginUser({ email, password }: LoginUserDto) {
    console.log('entramos')
    try {
      const user = await this.user.findUnique({
        where: { email }
      })

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User/password not valid'
        })
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'User/password not valid'
        })
      }

      const { password: __, ...rest } = user

      return {
        user: rest,
        token: this.signJwt(rest)
      }
    } catch (error: any) {
      throw new RpcException({
        status: 400,
        message: error?.message ?? 'Error en registerUser'
      })
    }
  }

  verifyUser(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.authJwtSecret
      });

      return {
        user,
        token: this.signJwt(user)
      }
    } catch (error) {
      console.log(error)
      throw new RpcException({
        status: 401,
        message: 'Invalid token'
      })
    }
  }

  private signJwt(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

}
