import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class HomeService {
  private readonly supabase;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  async getHome(userId: string) {
    const [profileResult, accountResult, cardsResult, transactionsResult, promosResult] = await Promise.all([
      this.supabase.from('profiles').select('id, login, full_name, avatar_seed').eq('id', userId).single(),
      this.supabase.from('accounts').select('id, title, balance, currency').eq('user_id', userId).limit(1).single(),
      this.supabase.from('cards').select('id, title, masked_pan, expires_at, balance, currency').eq('user_id', userId).order('created_at', { ascending: true }),
      this.supabase
        .from('transactions')
        .select('id, title, subtitle, amount, currency, icon_key')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(6),
      this.supabase.from('promo_banners').select('id, title, subtitle, tone, sort_order').order('sort_order', { ascending: true }),
    ]);

    if (profileResult.error || accountResult.error || cardsResult.error || transactionsResult.error || promosResult.error) {
      throw new BadRequestException('Не удалось загрузить домашний экран');
    }

    return {
      profile: profileResult.data,
      account: accountResult.data,
      cards: cardsResult.data ?? [],
      transactions: transactionsResult.data ?? [],
      promoBanners: promosResult.data ?? [],
    };
  }
}
