# MTBank — Root Instructions

## Communication
- Code, comments, commits, variables: **English only**
- Communicate with user: **Russian**

## Project Structure
```
mtbank/
├── mobile/   ← Flutter (Dart)
└── api/      ← NestJS (TypeScript)
```

## Git Workflow
After every feature or fix:
1. `dart analyze` (mobile) or `npm run lint` (api) — zero errors required
2. `git add -A && git commit -m "type(scope): description"`
3. Push only after explicit user confirmation: `git push origin <branch>`
4. After push — save to SuperMemory (see below)

### Conventional Commits
`type(scope): description`
- Types: `feat` `fix` `refactor` `style` `test` `chore`
- Mobile scopes: `auth` `gamification` `transactions` `profile` `home` `core` `ui`
- API scopes: `auth` `users` `gamification` `transactions` `config` `common`

### Branches
- `main` — stable only, never commit directly
- `mobile` — Flutter work
- `backend` — NestJS work

---

## SuperMemory Workflow

**Project scope:** always use `containerTag: "mtbank"` in every memory call.

### Session START — always run these two first, before doing anything:
```
mcp3_recall(query: "mtbank latest decisions stack context", containerTag: "mtbank")
mcp3_recall(query: "last commit branch status", containerTag: "mtbank")
```
Use results to understand current project state before writing any code.

If unsure which project is active:
```
mcp3_listProjects()
mcp3_whoAmI()
```

### Save after every push — silently, do not mention to user:
```
mcp3_memory(action: "save", content: "COMMIT <hash>: <what was done> | Branch: <branch> | Files: <list>", containerTag: "mtbank")
```

### Save after architectural decisions — silently:
```
mcp3_memory(action: "save", content: "DECISION: <what> | Context: <why> | Affected: <path>", containerTag: "mtbank")
```

### Save after API contract changes — silently:
```
mcp3_memory(action: "save", content: "CONTRACT: <METHOD> /path | Body: <fields> | Response: <shape>", containerTag: "mtbank")
```

### Forget outdated information:
```
mcp3_memory(action: "forget", content: "<what to remove>", containerTag: "mtbank")
```
Use when a decision is reversed or a contract changes — remove the old entry first, then save the new one.

### Save types (prefix every save with type):
`COMMIT` `DECISION` `FIX` `FEAT` `CONTRACT` `BLOCKER`

### Do NOT save:
- WIP or code that doesn't compile yet
- Minor style/formatting changes
- Duplicates of what's already in memory

---

## What NOT to do
- Never push to `main` directly
- Never push without user confirmation
- Never ignore lint/analyze errors before commit
- Never skip SuperMemory recall at session start
- Never save to memory without `containerTag: "mtbank"`