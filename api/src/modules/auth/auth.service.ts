import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type SessionResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    login: string;
    fullName: string;
  };
};

@Injectable()
export class AuthService {
  private readonly supabaseUrl: string;
  private readonly anonKey: string;
  private readonly serviceRoleKey: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
    this.anonKey = this.configService.getOrThrow<string>('SUPABASE_ANON_KEY');
    this.serviceRoleKey = this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
  }

  async register(dto: RegisterDto) {
    const adminClient = this.createAdminClient();
    const normalizedLogin = normalizeLogin(dto.login);
    const email = loginToEmail(normalizedLogin);

    const existingProfile = await adminClient.from('profiles').select('id').eq('login', normalizedLogin).maybeSingle();

    if (existingProfile.error) {
      throw new BadRequestException('Failed to validate login');
    }

    if (existingProfile.data) {
      throw new BadRequestException('Такой логин уже занят');
    }

    const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: dto.password,
      email_confirm: true,
      user_metadata: {
        login: normalizedLogin,
        full_name: dto.fullName.trim(),
      },
    });

    if (createError || !createdUser.user) {
      throw new BadRequestException('Не удалось создать аккаунт');
    }

    return this.login({ login: normalizedLogin, password: dto.password });
  }

  async login(dto: LoginDto): Promise<SessionResponse> {
    const client = this.createAnonClient();
    const normalizedLogin = normalizeLogin(dto.login);
    const email = loginToEmail(normalizedLogin);

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: dto.password,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const profile = await this.getProfileById(data.user.id);

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email,
        login: profile.login,
        fullName: profile.full_name,
      },
    };
  }

  async me(user: AuthenticatedUser) {
    const profile = await this.getProfileById(user.id);

    return {
      id: profile.id,
      login: profile.login,
      fullName: profile.full_name,
      email: user.email,
    };
  }

  private async getProfileById(userId: string) {
    const adminClient = this.createAdminClient();
    const result = await adminClient.from('profiles').select('id, login, full_name').eq('id', userId).single();

    if (result.error || !result.data) {
      throw new BadRequestException('Не удалось загрузить профиль пользователя');
    }

    return result.data;
  }

  private createAnonClient() {
    return createClient(this.supabaseUrl, this.anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  private createAdminClient() {
    return createClient(this.supabaseUrl, this.serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}

function normalizeLogin(value: string) {
  return value.trim().toLowerCase();
}

function loginToEmail(login: string) {
  return `${login}@mtbank.app`;
}
