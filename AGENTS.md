<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Projet Mademoizelle Jane

- Lire `README.md` (installation, commandes) et `docs/BILAN.md` (état du projet).
- Données : Supabase (migrations dans `supabase/migrations/`, types : `npm run db:types`).
- Toute action d'administration passe par `assertAdmin()` / `requireAdmin()` (`src/lib/auth/admin.ts`).
- Le statut de paiement n'est modifié que par les webhooks Stripe (`src/lib/payments/webhook.ts`).
- Couleurs et typographies centralisées dans `src/app/globals.css` ; contenus éditables décrits dans `src/lib/content/sections.ts`.
- Vérifications : `npm run lint && npm run typecheck && npm test && npm run test:e2e`.
