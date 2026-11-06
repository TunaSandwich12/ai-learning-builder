# AI Learning Builder (Option 1)

Next.js (App Router) + TypeScript + Tailwind + Supabase + Zod. Tests: Vitest.

## Rules (non-negotiable)
1. ANTHROPIC_API_KEY is server-only. Never in browser code, never NEXT_PUBLIC_, never committed.
2. FAKE_MODE=true makes /api/generate return a saved sample instead of calling the AI. Use it for all UI work.
3. AI-generated text is always rendered as text, never as HTML (no dangerouslySetInnerHTML).
4. Row-level security is on for every table. A teacher can only read/change their own rows.
5. All generation uses Sonnet 5.5 (claude-sonnet-5-5), called only from /api/generate.

## Where things live
- Zod schemas for activity types: src/lib/schemas/
- Sample activities for fake mode: src/lib/samples.ts
- Supabase clients: src/lib/supabase/
- AI code (server only): src/lib/ai/
- Database SQL: supabase/schema.sql
## Commands
- Run: npm run dev
- Lint: npm run lint
- Typecheck: npm run typecheck
- Tests: npm test
