# MTBank Telegram Mini App

Каркас Telegram Mini App для MTBank Pet Game.

## Что внутри

- Telegram-native home screen c CTA на игру.
- Переиспользование той же игры из `apps/web`.
- Skeleton под referral links, challenge links и leaderboard screen.
- Минимальный bot launcher, который читает токен из `.env` и отдает кнопку `web_app`.

## Env

Скопируй `.env.example` в `.env` и заполни:

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_APP_URL=https://your-public-mini-app-url.example
VITE_TELEGRAM_APP_URL=https://your-public-mini-app-url.example
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

## Команды

```bash
npm run telegram
npm run telegram:bot
npm run build --prefix apps/telegram
```

## Что подключать дальше

- real init-data validation;
- backend для referrals / challenge history / leaderboards;
- deep-link routing в конкретный challenge или daily level;
- share result после завершения уровня.
