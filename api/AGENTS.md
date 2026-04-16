# API — NestJS Instructions

## Communication
- Code, comments, commits, variables: **English only**
- Communicate with user: **Russian**

## Stack (strict — do not substitute)
| Concern | Tool |
|---|---|
| Framework | NestJS (TypeScript strict mode) |
| DB / Auth | Supabase (PostgreSQL + Auth) |
| Validation | `class-validator` + `class-transformer` |
| Config | `@nestjs/config` + Joi schema validation |
| Auth guard | `nest-supabase-guard` or custom Supabase JWT guard |
| Docs | `@nestjs/swagger` — auto-generate from decorators |

Do NOT use: `any` type without comment, `process.env` directly, raw Supabase errors in responses.

## Architecture
```
src/
├── modules/<feature>/
│   ├── <feature>.module.ts
│   ├── <feature>.controller.ts   ← HTTP only, no business logic
│   ├── <feature>.service.ts      ← all business logic here
│   └── dto/
│       ├── create-<feature>.dto.ts
│       └── update-<feature>.dto.ts
├── common/
│   ├── guards/          ← SupabaseAuthGuard (global)
│   ├── interceptors/    ← ResponseEnvelopeInterceptor (global)
│   ├── filters/         ← GlobalExceptionFilter (global)
│   └── decorators/      ← @Public(), @CurrentUser()
└── config/              ← ConfigModule with Joi validation
```

## Global Setup (main.ts non-negotiable)
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,         // strip unknown fields
  forbidNonWhitelisted: true,
  transform: true,         // auto-cast types
}));
app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
app.useGlobalFilters(new GlobalExceptionFilter());
```

## Response Envelope (all endpoints)
Success:
```json
{ "data": ..., "error": null, "status": 200 }
```
Error:
```json
{ "data": null, "error": "Human-readable message", "status": 400 }
```
Never expose raw Supabase errors, stack traces, or internal field names to client.

## Auth Rules
- JWT guard is **global** — all routes protected by default
- Use `@Public()` decorator for open routes (e.g. health check)
- Verify Supabase JWT via Supabase Admin SDK — do NOT use shared secret (HS256) [security risk]
- Inject `@CurrentUser()` decorator to get user from request — never re-fetch from DB in guard
- Never expose `service_role` key outside server

## DTO Rules
- Every request body has a DTO with `class-validator` decorators
- Use `@IsNotEmpty()`, `@IsString()`, `@IsUUID()`, `@IsNumber()`, `@IsOptional()` — be explicit
- Add `@ApiProperty()` to every DTO field for auto-Swagger docs
- DTOs are the contract — mobile dev reads them to know what to send

## Error Handling
- Use NestJS built-in exceptions: `NotFoundException`, `BadRequestException`, `ForbiddenException`
- Throw in service layer — never in controller
- GlobalExceptionFilter catches everything else → returns envelope format
- Never use try/catch to silence errors silently — always re-throw or log

## Naming Conventions
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Methods: `camelCase`
- DTOs: `ActionEntityDto` — e.g. `CreateUserDto`, `UpdatePointsDto`, `GetLeaderboardDto`
- Endpoints: RESTful — `GET /users`, `POST /gamification/points`, `PATCH /quests/:id`

## Performance (hackathon-safe shortcuts)
- Use `async/await` everywhere — no callbacks
- For Supabase queries: call directly from service, no ORM needed — Supabase client is enough
- Avoid N+1: use `.select()` with joins in Supabase instead of multiple queries
- For leaderboard realtime: let Flutter handle Supabase Realtime directly — no WebSocket in NestJS needed

## Mobile Contract — save to SuperMemory on every new/changed endpoint
Format:
```
CONTRACT: <METHOD> /path
Request DTO: <fields with types>
Response data: <shape>
Auth: required | public
Notes: <any edge cases>
```
This is critical — mobile dev checks SuperMemory to know current API state.

## Swagger
- Always run with Swagger enabled in dev: `http://localhost:3000/api`
- Decorate every controller with `@ApiTags('feature')`
- Decorate every endpoint with `@ApiOperation({ summary: '...' })`
- This is the living documentation — keep it accurate

## What NOT to do
- Never put business logic in controllers
- Never push to `main` directly
- Never use `process.env` — always `ConfigService`
- Never return raw Supabase error objects to client
- Never use `any` without explaining why in a comment
- Never skip DTO validation on any POST/PATCH endpoint
- Never push without running `npm run lint` first