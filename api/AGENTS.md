# API - NestJS Instructions

## Inheritance
- Follow [../AGENTS.md](../AGENTS.md) first.
- Root behavioral guidelines apply here too.

## Stack (strict - do not substitute)
| Concern | Tool |
|---|---|
| Framework | NestJS (TypeScript strict mode) |
| DB / Auth | Supabase (PostgreSQL + Auth) |
| Validation | `class-validator` + `class-transformer` |
| Config | `@nestjs/config` + Joi schema validation |
| Auth guard | `nest-supabase-guard` or custom Supabase JWT guard |
| Docs | `@nestjs/swagger` - auto-generate from decorators |

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
Never expose raw Supabase errors, stack traces, or internal field names to the client.

## Auth Rules
- JWT guard is global - all routes are protected by default.
- Use `@Public()` for open routes such as health checks.
- Verify Supabase JWT via Supabase Admin SDK - do not use the shared secret (HS256).
- Inject `@CurrentUser()` to get the user from the request - never re-fetch from the DB in the guard.
- Never expose the `service_role` key outside the server.

## DTO Rules
- Every request body has a DTO with `class-validator` decorators.
- Use `@IsNotEmpty()`, `@IsString()`, `@IsUUID()`, `@IsNumber()`, and `@IsOptional()` explicitly.
- Add `@ApiProperty()` to every DTO field for auto-Swagger docs.
- DTOs are the contract - mobile dev reads them to know what to send.

## Error Handling
- Use NestJS built-in exceptions: `NotFoundException`, `BadRequestException`, `ForbiddenException`.
- Throw in the service layer - never in the controller.
- `GlobalExceptionFilter` catches everything else and returns the envelope format.
- Never use try/catch to silence errors - always re-throw or log.

## Naming Conventions
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Methods: `camelCase`
- DTOs: `ActionEntityDto` - for example `CreateUserDto`, `UpdatePointsDto`, `GetLeaderboardDto`
- Endpoints: RESTful - `GET /users`, `POST /gamification/points`, `PATCH /quests/:id`

## Performance (hackathon-safe shortcuts)
- Use `async/await` everywhere - no callbacks.
- For Supabase queries: call directly from the service, no ORM needed.
- Avoid N+1: use `.select()` with joins in Supabase instead of multiple queries.
- For leaderboard realtime: let the React Native client handle Supabase Realtime directly - no WebSocket in NestJS needed.

## Mobile Contract
- Record a contract note in workspace memory after every new or changed endpoint.
- Format:
```
CONTRACT: <METHOD> /path
Request DTO: <fields with types>
Response data: <shape>
Auth: required | public
Notes: <any edge cases>
```
- This is critical - mobile dev checks memory to know the current API state.

## Swagger
- Always run with Swagger enabled in dev: `http://localhost:3000/api`
- Decorate every controller with `@ApiTags('feature')`
- Decorate every endpoint with `@ApiOperation({ summary: '...' })`
- This is the living documentation - keep it accurate.

## What Not To Do
- Never put business logic in controllers.
- Never push to `main` directly.
- Never use `process.env`; always use `ConfigService`.
- Never return raw Supabase error objects to the client.
- Never use `any` without explaining why in a comment.
- Never skip DTO validation on any POST/PATCH endpoint.
- Never push without running `npm run lint` first.
