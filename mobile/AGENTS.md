# Mobile - Flutter Instructions

## Inheritance
- Follow [../AGENTS.md](../AGENTS.md) first.
- Root behavioral guidelines apply here too.

## Stack (strict - do not substitute)
| Concern | Package |
|---|---|
| State | `riverpod` + `flutter_riverpod` + `riverpod_annotation` |
| Navigation | `go_router` |
| HTTP | `dio` |
| Animation | `flutter_animate` |
| Auth + DB | `supabase_flutter` |

Do NOT use: `GetX`, `BLoC`, `Provider`, `Navigator` directly, `http` package.

## Architecture
Each feature follows: `data/` -> `domain/` -> `presentation/`
- `data/` - repositories, API calls via Dio, Supabase queries
- `domain/` - entities, use cases, interfaces
- `presentation/` - screens, widgets, providers

Shared across features: `shared/widgets/`, `shared/components/`
Global: `core/theme/`, `core/router/`, `core/config/`, `core/constants/`

## Code Rules
- Use `AsyncNotifier` / `Notifier` from Riverpod - never raw `StateNotifier`.
- Use `AsyncValue` for all loading/error/data states.
- All providers annotated with `@riverpod`.
- Use `const` constructors wherever possible.
- Never use `BuildContext` across async gaps without a `mounted` check.
- Never use `print()` - use `debugPrint()`.
- Never hardcode colors - use `Theme.of(context).colorScheme`.
- Target: `minSdkVersion 35` (Android 15+).

## Naming
- Files: `snake_case.dart`
- Classes/Widgets: `PascalCase`
- Providers: `featureNameProvider` / `featureNameNotifierProvider`
- Screens: `FeatureNameScreen` in `presentation/screens/`
- Widgets: descriptive name in `presentation/widgets/`

## Tests
Write unit tests only when explicitly asked.
Location: `mobile/test/` mirroring `lib/` structure.

## Verification After Every Dart Change
### 1. Static Analysis
```text
mcp_dart_analyze_files
```
It must return zero errors. If errors are found, fix them and re-run analysis before proceeding.

### 2. Auto-fix and Format
```text
mcp_dart_dart_fix
mcp_dart_dart_format
```
Apply safe fixes and format the changed files.

### 3. Runtime Check, if the app is already running
- Use hot reload for the running Flutter app.
- Check runtime errors after the reload.
- If runtime errors remain, fix them and repeat until clean.

### 4. Visual Verification, for UI changes only
- Use the available screenshot tooling when you change a screen, widget, or layout.
- Check for overflow indicators, clipped text, missing widgets, and broken layout structure.
- If visual issues appear, fix them and verify again.

### 5. Tests, only when relevant tests exist or the user asked for them
```text
mcp_dart_run_tests
```
Run tests for the affected feature only.

## Device Workflow
- Before runtime or visual verification, confirm Android connectivity with `mcp_android-adb_adb_devices`.
- If no device is available, report that runtime or visual verification cannot proceed.

## What Not To Do
- Never use `setState` except for purely local UI state.
- Never navigate with `Navigator.push` - always use `context.go()` / `context.push()`.
- Never put business logic in widgets.
- Never import across features directly - go through `domain/` interfaces.
- Never skip static analysis before finishing a change.
- Never hot reload without checking runtime errors after.
- Never mark a task as done if analysis has errors or runtime errors exist.