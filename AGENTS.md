# MTBank - Workspace Instructions

## Scope and Priority
- Applies to the whole workspace.
- More specific `AGENTS.md` files override this one when they are more specific.
- System, developer, and direct user instructions always win over workspace instructions.
- If a request is ambiguous or instructions conflict, stop and ask before editing.

## Communication
- Code, comments, commits, and variables: English only.
- Communicate with the user in Russian.

## Behavioral Guidelines
### Think Before Coding
- State assumptions explicitly.
- If multiple interpretations exist, name them instead of guessing.
- Prefer the simplest workable approach.
- Push back when a request is contradictory or overcomplicated.
- If something is unclear, ask before you edit.

### Simplicity First
- Implement only what was asked.
- Do not add speculative abstractions, configurability, or error handling for impossible cases.
- If the solution is growing without benefit, cut it down.

### Surgical Changes
- Touch only the code that the request requires.
- Do not refactor unrelated code, comments, formatting, or names.
- Match the existing style unless the task requires a change.
- Remove imports, variables, or functions only when your own change makes them unused.
- If you notice unrelated dead code, mention it instead of deleting it.
- Every changed line should trace directly to the user's request.

### Goal-Driven Execution
- Turn multi-step work into short, verifiable steps.
- State a brief plan with explicit verification when the task spans more than one step.
- Do not mark the work done until the relevant verification passes.

## Repository Structure
```
mtbank/
├── apps/mobile/   ← React Native (Expo)
└── api/      ← NestJS (TypeScript)
```

## Domain Instructions
- Follow [api/AGENTS.md](api/AGENTS.md) for NestJS work.
- Mobile app lives in `apps/mobile/` and uses React Native with Expo.
- Do not duplicate feature-specific rules here unless they apply across the whole workspace.

## Working Process
- Gather context before editing when the task is not trivial.
- Make the smallest change that solves the request.
- After each feature or fix, verify the relevant stack:
  - api: run `npm run lint`.
  - mobile: run TypeScript or Expo-appropriate verification for `apps/mobile`.
- If verification fails, fix the problem before finishing.
- Use conventional commits for completed feature or fix work.
- Never push without explicit user confirmation.

## Memory and Project Context
- Use SuperMemory MCP (`mcp_supermemory_*` tools) for persistent project memory.
- Project scope: always use `containerTag: "mtbank"` in every memory call.

### Session Start
- Always run these two first, before doing anything:
```
mcp_supermemory_recall(query: "mtbank latest decisions stack context", containerTag: "mtbank")
mcp_supermemory_recall(query: "last commit branch status", containerTag: "mtbank")
```
- Use the results to understand the current project state before writing any code.

### Active Project
- If you are unsure which project is active:
```
mcp_supermemory_listProjects()
mcp_supermemory_whoAmI()
```

### Save Rules
- Save after every push, silently, and do not mention it to the user:
```
mcp_supermemory_memory(action: "save", content: "COMMIT <hash>: <what was done> | Branch: <branch> | Files: <list>", containerTag: "mtbank")
```
- Save after architectural decisions, silently:
```
mcp_supermemory_memory(action: "save", content: "DECISION: <what> | Context: <why> | Affected: <path>", containerTag: "mtbank")
```
- Save after API contract changes, silently:
```
mcp_supermemory_memory(action: "save", content: "CONTRACT: <METHOD> /path | Body: <fields> | Response: <shape>", containerTag: "mtbank")
```
- Forget outdated information when a decision is reversed or a contract changes:
```
mcp_supermemory_memory(action: "forget", content: "<what to remove>", containerTag: "mtbank")
```
- Use these save types: `COMMIT`, `DECISION`, `FIX`, `FEAT`, `CONTRACT`, `BLOCKER`.
- Do not save WIP, code that does not compile yet, minor style changes, or duplicates.

## What Not To Do
- Never push to `main` directly.
- Never invent tools, commands, file paths, package names, or project state.
- Never make unrelated edits or cleanup.
- Never ignore lint or analyze errors.
- Never skip verification.
