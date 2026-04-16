# Mobile — Flutter Instructions

## Communication
- Code, comments, commits, variables: **English only**
- Communicate with user: **Russian**

## Stack (strict — do not substitute)
| Concern | Package |
|---|---|
| State | `riverpod` + `flutter_riverpod` + `riverpod_annotation` |
| Navigation | `go_router` |
| HTTP | `dio` |
| Animation | `flutter_animate` |
| Auth + DB | `supabase_flutter` |

Do NOT use: `GetX`, `BLoC`, `Provider`, `Navigator` directly, `http` package.

## Architecture
Each feature follows: `data/` → `domain/` → `presentation/`
- `data/` — repositories, API calls via Dio, Supabase queries
- `domain/` — entities, use cases, interfaces
- `presentation/` — screens, widgets, providers

Shared across features: `shared/widgets/`, `shared/components/`
Global: `core/theme/`, `core/router/`, `core/config/`, `core/constants/`

## Code Rules
- Use `AsyncNotifier` / `Notifier` from Riverpod — never raw `StateNotifier`
- Use `AsyncValue` for all loading/error/data states
- All providers annotated with `@riverpod`
- `const` constructors wherever possible
- Never use `BuildContext` across async gaps without `mounted` check
- Never use `print()` — use `debugPrint()`
- Never hardcode colors — use `Theme.of(context).colorScheme`
- Target: `minSdkVersion 35` (Android 15+)

## Naming
- Files: `snake_case.dart`
- Classes/Widgets: `PascalCase`
- Providers: `featureNameProvider` / `featureNameNotifierProvider`
- Screens: `FeatureNameScreen` in `presentation/screens/`
- Widgets: descriptive name in `presentation/widgets/`

## Tests
Write unit tests **only when explicitly asked**.
Location: `mobile/test/` mirroring `lib/` structure.

---

## Self-Verification After Every Code Change

After **every** big edit to Dart/Flutter code, run this sequence autonomously without waiting for user instruction:

### Step 1 — Static Analysis
```
mcp1_analyze_files → must return zero errors
```
If errors found → fix them → re-run analyze → only proceed when clean.

### Step 2 — Auto-fix & Format
```
mcp1_dart_fix      → apply all safe automatic fixes
mcp1_dart_format   → format changed files
```

### Step 3 — Runtime Check (if app is running)
Check if app is already running:
```
mcp1_list_running_apps
```

**If app IS running:**
```
mcp1_hot_reload              → apply changes
mcp1_get_runtime_errors      → must be empty
mcp1_get_app_logs            → check for exceptions/warnings
```
If runtime errors found → fix → hot_reload → re-check until clean or ask user for help.

**If app is NOT running:**
```
mcp1_launch_app              → start app on connected device
mcp1_get_runtime_errors      → must be empty
mcp1_get_app_logs            → check for exceptions
```

### Step 4 — Visual Verification (for UI changes only)
Run this step only when you changed a screen, widget, or layout:
```
mcp0_take_screenshot_and_save → capture current screen
```
Analyze the screenshot:
- No overflow indicators (yellow/black stripes)
- No missing widgets (empty boxes)
- No text clipped or cut off
- Layout matches the intended structure

If visual issues found → fix → hot_reload → take new screenshot → verify again.

### Step 5 — Widget Tree Inspection (for layout bugs)
Run only if Step 4 reveals layout issues:
```
mcp1_get_widget_tree         → inspect problematic widget subtree
```
Use result to identify the root cause of layout problem.

### Step 6 — Tests (only if tests exist for changed code)
```
mcp1_run_tests               → run tests for the affected feature only
```
Skip if no tests exist for the changed area (unless user explicitly asked).

---

## Verification Result — Report to User
After completing the verification sequence, report briefly in Russian:
- ✅ Analyze: чисто
- ✅ Hot reload: успешно
- ✅ Runtime: ошибок нет
- ✅ Скриншот: UI выглядит корректно
OR list what was found and fixed automatically.

---

## Device Workflow
Before starting any session that involves running code:
```
mcp1_list_devices   → check Flutter sees the device
mcp0_adb_devices    → cross-check ADB connection
```
If no device found → report to user immediately, do not proceed with run/reload steps.

---

## What NOT to do
- Never use `setState` except for purely local UI state
- Never navigate with `Navigator.push` — always `context.go()` / `context.push()`
- Never put business logic in widgets
- Never import across features directly — go through `domain/` interfaces
- Never skip Step 1 (analyze) before committing
- Never hot_reload without checking runtime errors after
- Never mark a task as done if analyze has errors or runtime errors exist