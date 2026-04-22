# MTBank Pet Game — PRD (apps/web)

**Last update:** 2026-04-22

## Original problem statement
Реализовать веб-игру в `apps/web` монорепо MTBank. Жанр — микс Paper.io / Tomb
of the Mask в 2.5D стилистике. Управление — свайпами вверх/вниз/влево/вправо,
персонаж скользит от стены к стене по лабиринту. В отличие от Tomb of the Mask
— нет ловушек и врагов, только чистая маршрутизация и сбор звёзд. До 60 уровней
в story mode + ежедневные уровни (на потом).

## Constraints (from context doc)
- **Monorepo** `mtbank/`: `apps/web` (Vite + React + TS + Babylon.js + Zustand),
  `apps/mobile` (Expo RN), `api/` (NestJS).
- **Asset**: `shared/assets/models/blob.glb` — модель персонажа.
- **Target platform**: мобильное устройство (WebView в банковском приложении +
  Telegram Mini App).
- **Controls**: только свайпы (pointer events); keyboard-fallback оставлен для
  удобства отладки.
- **Visual style**: «бумажный», приятный (тёплая палитра, flat-shading,
  скруглённые формы).
- **Persistence**: localStorage на MVP + заглушка Supabase (не подключён).

## Architecture
```
apps/web/src/
├── app/App.tsx                                  # маршрутизация Menu ↔ Level
├── core/game/
│   ├── constants.ts                             # тюнинг (cellSize, speed, FOV)
│   ├── types.ts                                 # Direction, LevelData, LevelResult
│   ├── engine/
│   │   ├── LevelRunner.ts                       # оркестратор сцены уровня
│   │   ├── Maze.ts                              # парсинг грида + геометрия стен
│   │   ├── Player.ts                            # скольжение по клеткам
│   │   ├── Collectibles.ts                      # звёзды + портал финиша
│   │   └── SwipeInput.ts                        # pointer-swipe детектор
│   └── scene/
│       ├── createSceneCamera.ts                 # top-down камера с fit-to-viewport
│       ├── createLighting.ts                    # мягкое «бумажное» освещение
│       └── loadPlayerModel.ts                   # импорт blob.glb
├── features/game/
│   ├── components/
│   │   ├── MainMenu.tsx                         # Duolingo-style змейка уровней
│   │   ├── GameScreen.tsx                       # full-viewport игровой экран
│   │   ├── GameCanvas.tsx                       # монтирование Babylon engine
│   │   ├── GameHud.tsx                          # название уровня + звёзды
│   │   └── LevelCompleteOverlay.tsx             # оверлей с рейтингом
│   ├── domain/
│   │   ├── gameState.ts                         # типы фаз игры
│   │   └── useGameStore.ts                      # zustand + persist middleware
│   └── levels/
│       ├── registry.ts                          # индекс вручную сделанных уровней
│       └── 001.json..005.json                   # 5 handcrafted уровней
├── services/supabase/
│   ├── client.ts                                # lazy-конфиг из Vite env
│   ├── types.ts
│   └── progressService.ts                       # REST-заглушка (offline-safe)
└── shared/theme/
    ├── colors.ts                                # «бумажная» палитра
    └── spacing.ts
```

## Level data format
```json
{
  "id": 1,
  "name": "Первые шаги",
  "width": 9,
  "height": 9,
  "grid": [
    "WWWWWWWWW",
    "WS.....*W",
    ...
  ]
}
```
Символы: `W` стена, `.` пол, `S` спавн, `F` портал (финиш), `*` звезда.

## Implemented (MVP)
- [x] Бумажная палитра и тёплый градиентный фон.
- [x] Camera: near-top-down (`beta = PI/8`) с адаптивным радиусом под aspect.
- [x] Движение: pointer-свайпы + keyboard (`WASD` / стрелки) как fallback.
- [x] Слайд-логика «до стены» на сетке клеток (`slideDestination` raycast).
- [x] Сбор звёзд на траектории + портал-финиш.
- [x] 5 ручных уровней (9×9 и 11×11), остальные 55 показаны как «Скоро».
- [x] HUD: номер уровня, название, прогресс звёзд, кнопка назад.
- [x] Level-complete overlay: 1/2/3 звёзды по % собранных, время, кнопки
      «Заново», «К карте», «Далее».
- [x] Menu: Duolingo-style зиг-заг путь, оранжевый focus-уровень,
      золотая заливка завершённых, замок на locked.
- [x] Progress persistence: zustand `persist` → `localStorage`
      (`mtbank-game-progress-v1`).
- [x] Supabase service-stubs: `progressService.saveProgress / fetchProgress`
      (short-circuit если env не задан).
- [x] `data-testid` на всех интерактивных элементах.

## Personas
- **Молодой пользователь MTBank** (18–25), мобильный, ценит быстрые сессии
  30–120 сек между делами.
- **Гость из Telegram Mini App** (tier 0) — играет без банка, знакомится
  с экосистемой.

## Not in scope yet (deferred)
- **P1** Daily levels (ежедневная генерация / ротация).
- **P1** Реальное подключение Supabase (auth + sync прогресса).
- **P2** Ghost-дуэли / PvP по ссылке, лидерборды.
- **P2** Ещё 55 ручных уровней (или процедурная генерация + baking).
- **P2** Косметика питомца / масок.
- **P3** Анимации персонажа (блоб сейчас статичный меш).
- **P3** Haptic feedback в WebView / Telegram.

## Next Action Items
1. Дизайнерский проход — автор уровней может добавить уровни 6–60 в
   `apps/web/src/features/game/levels/` и зарегистрировать их в
   `registry.ts`.
2. Подключить Supabase: `yarn add @supabase/supabase-js`, заполнить
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, заменить REST-заглушки.
3. Интеграция с мобильным приложением через `core/bridge/hostBridge.ts` —
   пробрасывать `game:state` с количеством собранных звёзд, чтобы они
   отображались в банковском приложении.
4. Процедурная генерация лабиринтов для daily challenge.

## Dev commands
```bash
# из корня монорепо
yarn install

# dev-сервер (http://localhost:5173)
yarn web

# production build
npm run build --prefix apps/web
```

## Files of interest for future work
- `apps/web/src/core/game/constants.ts` — все тюнинг-константы.
- `apps/web/src/core/game/engine/LevelRunner.ts` — точка расширения для новых
  типов клеток (телепорты, переключатели и т.д.).
- `apps/web/src/features/game/levels/` — папка для новых уровней.
