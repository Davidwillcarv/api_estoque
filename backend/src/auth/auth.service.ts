import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(body: any) {
    const { email, password } = body;

    // Utilizador fixo para testes (substitua por BD futuramente)
    if (email === 'admin@admin.com' && password === '123456') {
      const payload = { email };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }

    throw new UnauthorizedException('E-mail ou senha inválidos.');
  }
}