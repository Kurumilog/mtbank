# Project Review

## Status

MTBank Pet + Game Ecosystem is a hackathon MVP for Gen Z where the bank app, a digital pet, a skill-based maze game, and Telegram Mini App form one engagement loop.

Core product formula from project docs:

- spend in real life -> feed the pet;
- play -> increase emotional attachment and progression;
- invite friends through Telegram -> grow acquisition.

## Product Intent

- Audience: 18-25 years old.
- Positioning: not another cashback card, but a bank with an emotional core.
- Pet is the main UX bridge between banking actions and game actions.
- Telegram is a growth channel, not a side feature.
- The game must not pay real money and must not become pay-to-win.

## Platforms

- `apps/web`: shared web game client.
- `apps/mobile`: mobile banking shell.
- `apps/telegram`: Telegram Mini App shell over the same game.
- `api`: backend, not touched in the latest Telegram task.

## Game Requirements From Docs

- Genre: hyper-casual / arcade puzzle maze.
- Core loop: swipe up/down/left/right, character slides wall-to-wall.
- Inspiration: Tomb of the Mask, but not a direct clone.
- No enemies or lethal traps in MVP.
- Focus on route planning, star collection, finish portal, short sessions.
- MVP content target: 60 levels + daily challenge later.

## Telegram Mini App Requirements From Docs

- Must run the same game content as the WebView version.
- Telegram user can:
  - play the same game;
  - use referral links;
  - send challenge links to friends;
  - participate in leaderboards.
- Telegram is the top-of-funnel product surface.
- Shared web client is the preferred technical approach.

## Existing Web Game State

Based on `memory/PRD.md` and `REVIEW.md`, `apps/web` already contains:

- Babylon.js maze game engine.
- Swipe movement and debug keyboard fallback.
- Duolingo-style level menu.
- 5 handcrafted levels and placeholders up to 60.
- Local progress persistence via zustand + localStorage.
- Host bridge with Telegram/WebView detection.

## Telegram Work Completed In This Session

Created `apps/telegram` as a separate workspace app.

Implemented:

- Telegram Mini App home screen.
- Reuse of the same game client from `apps/web`.
- Invite/share skeleton.
- Challenge/share skeleton.
- Leaderboard placeholder screen.
- Minimal optional bot runtime in `apps/telegram/bot.mjs`.
- `.env.example` and `README.md` for setup.

Also updated root workspace config:

- added `apps/telegram` to workspaces;
- added scripts for `telegram` and `telegram:bot`.

## Verification

Verified successfully:

- `npm run build --prefix apps/telegram`
- `npm run build --prefix apps/web`

## Important Technical Notes

- Telegram Mini App requires a public `https` URL.
- `TELEGRAM_APP_URL` is the public Mini App URL used by the bot runtime.
- `VITE_TELEGRAM_APP_URL` is the same URL exposed to frontend code for share/deep links.
- `VITE_TELEGRAM_BOT_USERNAME` is the bot username from BotFather.
- If BotFather alone is used to configure Web App launch, `bot.mjs` is optional.

## Important Constraints

- Do not touch `api` for the Telegram shell task.
- Do not split Telegram into a separate different game implementation.
- Keep Telegram Mini App in scope.
- No real-money rewards for game progress.
- Do not turn the MVP into a crypto-first app.

## Follow-Up For Next Chat

Save the following knowledge into SuperMemory when MCP tools are available again.

Suggested memory entries:

`DECISION: Telegram Mini App uses the same shared web game client as apps/web instead of a separate implementation | Context: project docs require one common game surface for WebView and Telegram | Affected: apps/telegram, apps/web`

`FEAT: Added Telegram Mini App skeleton in apps/telegram | Includes Telegram home screen, shared game launch, invite/challenge share skeleton, leaderboard placeholder, optional bot runtime, env example, and README | Branch: current working branch | Files: package.json, apps/telegram/*`

`FIX: Verified both apps/telegram and apps/web production builds after workspace update and local dependency repair | Context: rolldown native binding had to be reinstalled locally during verification | Affected: package-lock.json, workspace node_modules`

## Reminder

This file was created specifically so the next chat can push the distilled project context and Telegram Mini App work into SuperMemory.
