# MTBank Clone MVP

Monorepo project with React Native mobile app and NestJS API backend.

## Structure

- `apps/mobile/` - Expo React Native application
- `api/` - NestJS backend API
- `apps/web/` - Web game client

## Tech Stack

### Mobile
- React Native
- Expo
- Expo Router
- React Native Reanimated
- Zustand
- React Native WebView
- Supabase (Auth & Database)

### Backend
- NestJS
- Supabase (PostgreSQL + Auth + Realtime)

## Setup

### Mobile
```bash
cd apps/mobile
npm install
npm run start
```

### API
```bash
cd api
npm install
npm run start:dev
```
