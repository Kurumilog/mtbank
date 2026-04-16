# MTBank Clone MVP

Monorepo project with Flutter mobile app and NestJS API backend.

## Structure

- `mobile/` - Flutter application (Android 15+ / iOS)
- `api/` - NestJS backend API

## Tech Stack

### Mobile
- Flutter (Dart)
- Riverpod (state management)
- go_router (navigation)
- Dio (HTTP client)
- flutter_animate (animations)
- Supabase (Auth & Database)

### Backend
- NestJS
- Supabase (PostgreSQL + Auth + Realtime)

## Setup

### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

### API
```bash
cd api
npm install
npm run start:dev
```
