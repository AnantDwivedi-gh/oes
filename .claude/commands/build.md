---
description: >
  Full OeS build and validation sequence. Runs type-check, tests, lint, and
  Convex validation in parallel. Use at the start of every session and before
  shipping any feature. Usage: /build [optional-feature-name]
---

Running OeS build sequence for: $ARGUMENTS

Spawn these three subagents simultaneously:

1. type-checker → run `npm run type-check`, fix ALL errors, report before/after count.

2. test-runner → run `npm test -- --run`, fix ALL failures, report pass/fail + coverage
   on agent/ and overlay/.

3. convex-backend → validate schema consistency, confirm all query indexes exist,
   run `npx convex dev --once` to confirm functions compile, report any errors.

After all three finish:
4. Main agent: run `npm run lint`, fix errors.
5. Output build summary:
   TypeScript  ✓/✗
   Tests       ✓/✗  (X/Y passing, Z% coverage)
   Convex      ✓/✗
   Lint        ✓/✗
   Status      READY / NEEDS FIXES

If $ARGUMENTS is a feature name: also run the explore subagent to confirm the
feature is fully implemented across main/, renderer/, agent/, and convex/.
