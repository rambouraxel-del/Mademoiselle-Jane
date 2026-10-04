# Mademoizelle Jane

Boutique en ligne de médailles personnalisées pour chiens, réalisées à la main par Ophélie.

- **Site public** fidèle aux maquettes (`docs/maquettes/`) : accueil, boutique avec filtres, fiches produits, notre histoire, contact et FAQ, panier, paiement, pages d’informations.
- **Administration** (`/admin`) pour gérer produits, photos, collections, textes, commandes, messages et livraison, sans toucher au code.
- **Paiement** Stripe Checkout, confirmé uniquement par des webhooks signés.

| Documentation | Pour qui |
| --- | --- |
| [docs/GUIDE-ADMINISTRATION.md](docs/GUIDE-ADMINISTRATION.md) | Ophélie et Axel : utiliser l’administration au quotidien |
| [docs/MISE-EN-LIGNE.md](docs/MISE-EN-LIGNE.md) | Connecter Supabase, Vercel, Stripe, les emails et le domaine |
| [docs/BILAN.md](docs/BILAN.md) | Ce qui est fait, testé, et ce qu’il reste à renseigner |
| `docs/captures/` | Captures de validation (ordinateur et mobile) |

## Technologies

- Next.js 16 (App Router, TypeScript, Turbopack), React 19, Tailwind CSS 4
- Supabase : PostgreSQL, authentification, stockage des photos, règles RLS
- Stripe Checkout (`stripe` 23), emails via Resend ou SMTP (`nodemailer`)
- Tests : Vitest (unitaires et intégration sur la base locale), Playwright (de bout en bout)
- Compatible Vercel (aucune donnée écrite sur le disque du serveur)

## Organisation du projet

```
src/
  app/(site)/          pages publiques (accueil, boutique, produit, histoire, contact, panier, commande, infos)
  app/admin/           administration (connexion, produits, collections, médias, contenus, commandes, réglages)
  app/actions/         actions serveur publiques (paiement, contact, newsletter, suivi)
  app/admin/actions/   actions serveur de l'administration (toutes vérifient le rôle admin)
  app/api/stripe/webhook/  réception des événements Stripe signés
  components/          composants (site, produit, panier, administration, icônes)
  lib/catalog/         lecture et calculs du catalogue
  lib/checkout/        calcul fiable du panier et création de la session Stripe
  lib/payments/        client Stripe et traitement des webhooks
  lib/orders/          libellés, emails de commande, page de confirmation
  lib/email/           envoi (Resend / SMTP) et modèles d'emails
  lib/content/         contenus éditables (valeurs par défaut issues des maquettes)
  lib/security/        limitation des tentatives, jetons de formulaire, empreintes
  lib/validation/      validations communes
  app/globals.css      système de design centralisé (couleurs, typographies)
  fonts/               polices locales + licences (SIL OFL)
supabase/
  migrations/          schéma, sécurité RLS, fonctions métier, fonctions admin
  seed-media/          visuels provisoires extraits des maquettes
scripts/
  seed.ts              données initiales (contenus, produits, photos, FAQ, pages)
  admin.ts             création / liste / retrait des comptes administrateurs
  captures.mjs         captures de validation visuelle
tests/                 unit/, integration/, e2e/
```

## Installation locale

Prérequis : Node.js 20.9 ou plus récent (22 recommandé) et Docker (pour Supabase local).

```bash
npm install
cp .env.example .env.local

# 1. Démarrer Supabase en local (télécharge les images Docker la première fois)
npm run db:start
#    → recopiez dans .env.local : API URL, Publishable key, Secret key
#    → FORM_SECRET : n'importe quelle chaîne de 32 caractères en local

# 2. Appliquer les migrations et charger les données initiales
npm run db:reset
npm run seed

# 3. Créer un compte administrateur (le mot de passe est demandé au clavier)
npm run admin:create -- --email=vous@exemple.fr --name=Axel

# 4. Lancer le site
npm run dev
```

- Site : http://localhost:3000 — Administration : http://localhost:3000/admin
- Emails locaux (Mailpit) : http://127.0.0.1:54324 — pour les voir, mettez dans `.env.local` :
  `EMAIL_PROVIDER=smtp`, `SMTP_HOST=127.0.0.1`, `SMTP_PORT=54325`, `EMAIL_FROM=Mademoizelle Jane <boutique@example.test>`.
- Sans clés Stripe, le panier fonctionne et affiche « paiement pas encore activé » ; aucun paiement n’est simulé.
- Pour tester le paiement en local avec un compte Stripe de test : voir [docs/MISE-EN-LIGNE.md](docs/MISE-EN-LIGNE.md#tester-le-paiement-en-local).

> Si `supabase start` ne parvient pas à télécharger les images depuis `public.ecr.aws`, utilisez Docker Hub :
> `SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io npm run db:start`.

## Commandes utiles

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` puis `npm start` | version de production |
| `npm run lint` / `npm run typecheck` | contrôles de qualité |
| `npm test` | tests unitaires et d’intégration (Supabase local démarré + `npm run seed`) |
| `npm run test:e2e` | tests de bout en bout (Supabase local + serveur) |
| `npm run seed` | données initiales (ne remplace jamais ce qui existe) |
| `npm run admin:create` / `admin:list` / `admin:remove` | comptes administrateurs |
| `npm run db:types` | régénère les types TypeScript de la base |
| `node scripts/captures.mjs` | captures d’écran de validation |

### Tests de paiement automatisés

Les tests de paiement utilisent [stripe-mock](https://github.com/stripe/stripe-mock) (faux serveur Stripe local) et des webhooks signés localement. Ils ne contactent jamais Stripe.

```bash
docker run -d -p 12111:12111 stripe/stripe-mock:latest
# dans .env.local (tests uniquement) :
# STRIPE_SECRET_KEY=sk_test_localStripeMock123
# STRIPE_WEBHOOK_SECRET=whsec_test_local
# STRIPE_MOCK_URL=http://localhost:12111
npm test && npm run test:e2e
```

Si Chromium n’est pas installé pour Playwright : `npx playwright install chromium`, ou `PLAYWRIGHT_CHROMIUM_PATH=/chemin/vers/chromium`.

## Sécurité (résumé)

- Rôle administrateur vérifié côté serveur dans chaque page et action, et dans la base (RLS + `is_admin()`).
- Inscription publique désactivée ; comptes créés uniquement par `npm run admin:create`.
- Lecture publique limitée aux contenus publiés ; commandes, messages et newsletter réservés aux administrateurs.
- Le statut de paiement n’est modifiable que par les webhooks Stripe signés (privilèges de colonnes en base).
- Prix, stock et personnalisation recalculés côté serveur ; instantané figé dans chaque commande.
- Photos vérifiées (format réel, taille, dimensions), réencodées sans métadonnées (EXIF, GPS).
- Formulaires : validation serveur, champ piège, délai minimal, limitation des tentatives, Turnstile en option.
- Aucune donnée de carte bancaire ne transite par l’application ; aucun secret côté navigateur.
- Adresses IP jamais stockées en clair (empreinte HMAC pour la limitation).
