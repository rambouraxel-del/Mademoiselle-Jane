import { existsSync } from "node:fs";

// Les tests d'intégration utilisent la base Supabase locale (npm run db:start).
const file = process.env.TEST_ENV_FILE ?? ".env.local";
if (existsSync(file)) process.loadEnvFile(file);
