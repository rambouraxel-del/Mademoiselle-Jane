# Mise en ligne : Supabase, Vercel, Stripe, emails, domaine

Ce guide liste, dans l’ordre, tout ce qu’il reste à configurer avec vos comptes. Aucune étape ne demande de modifier le code. Comptez environ 1 h 30.

> Conservez les clés dans un gestionnaire de mots de passe. Ne les envoyez jamais par email ni dans GitHub.

## 1. Supabase (base de données, connexion, photos)

1. Créez un compte sur supabase.com puis un projet : **région Europe (Paris ou Francfort)**, mot de passe de base fort (à conserver).
2. **Project Settings → API Keys** : notez
   - l’URL du projet → `NEXT_PUBLIC_SUPABASE_URL`
   - la clé *publishable* (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - une clé *secret* (`sb_secret_…`) → `SUPABASE_SECRET_KEY`
3. Envoyez le schéma de la base depuis le projet (sur votre ordinateur) :
   ```bash
   npx supabase login
   npx supabase link --project-ref VOTRE_REF_PROJET
   npx supabase db push
   ```
   Cela crée les tables, les règles de sécurité (RLS), les fonctions et l’espace de stockage des photos.
4. **Authentication → Sign In / Providers** :
   - désactivez **« Allow new users to sign up »** (aucune inscription publique) ;
   - laissez le fournisseur **Email** activé (connexion de l’administration).
5. **Authentication → URL Configuration** :
   - *Site URL* : `https://www.votre-domaine.fr`
   - *Redirect URLs* : ajoutez `https://www.votre-domaine.fr/**` (et l’adresse Vercel provisoire `https://….vercel.app/**` si besoin)
6. **Authentication → Emails → SMTP Settings** : renseignez le même SMTP que pour les emails de la boutique (étape 4). Sans cela, Supabase n’envoie que quelques emails par heure (réinitialisation de mot de passe).
7. **Authentication → Emails → Templates → Reset Password** : remplacez le lien par
   ```
   {{ .SiteURL }}/admin/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/admin/nouveau-mot-de-passe
   ```
   (le lien fonctionne alors même s’il est ouvert sur un autre appareil).
8. Créez un fichier `.env.production.local` sur votre ordinateur (jamais commité) avec les 3 valeurs Supabase, puis :
   ```bash
   npm run seed -- --env=.env.production.local
   npm run admin:create -- --env=.env.production.local --email=axel@… --name=Axel
   npm run admin:create -- --env=.env.production.local --email=ophelie@… --name=Ophélie
   ```
   Chaque personne tape son propre mot de passe (12 caractères minimum). Il peut ensuite être changé avec « Mot de passe oublié ».

## 2. Stripe (paiement) — d’abord en mode test

1. Créez le compte sur stripe.com (vous pourrez finaliser l’activation plus tard).
2. Restez en **mode test** (interrupteur « Test mode »). **Developers → API keys** : copiez la *Secret key* `sk_test_…` → `STRIPE_SECRET_KEY`.
3. **Developers → Webhooks → Add endpoint** :
   - URL : `https://www.votre-domaine.fr/api/stripe/webhook` (ou l’adresse Vercel provisoire `https://….vercel.app/api/stripe/webhook`)
   - événements à cocher :
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `checkout.session.expired`
     - `charge.refunded`
   - copiez le *Signing secret* `whsec_…` → `STRIPE_WEBHOOK_SECRET`.
4. **Settings → Payment methods** : choisissez les moyens de paiement (carte bancaire, Apple Pay / Google Pay…).
5. **Settings → Business → Public details** : nom affiché « Mademoizelle Jane », email du support.
6. Testez une commande avec la carte `4242 4242 4242 4242`, une date future et n’importe quel code. Vérifiez dans l’administration que la commande passe à « Payée » et que l’email de confirmation arrive.
7. **Passage en réel** (quand tout est validé) : activez le compte Stripe (identité, IBAN), remplacez `STRIPE_SECRET_KEY` par la clé `sk_live_…`, créez le **même webhook en mode réel** et remplacez `STRIPE_WEBHOOK_SECRET`. Le bandeau « mode test » disparaît automatiquement.

### Tester le paiement en local

```bash
# Stripe CLI : https://docs.stripe.com/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copiez le whsec_… affiché dans STRIPE_WEBHOOK_SECRET (.env.local), avec votre clé sk_test_…
npm run dev
```

## 3. Vercel (hébergement)

1. Créez un compte sur vercel.com et connectez GitHub.
2. **Add New → Project** → importez le dépôt `Mademoiselle-Jane`, branche `main`. Framework détecté : Next.js (aucun réglage à changer).
3. **Settings → Environment Variables** (environnement *Production*) : saisissez toutes les variables de `.env.example` :

| Variable | Valeur |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.votre-domaine.fr` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | clé publishable |
| `SUPABASE_SECRET_KEY` | clé secrète |
| `STRIPE_SECRET_KEY` | `sk_test_…` puis `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` du webhook |
| `EMAIL_PROVIDER` | `resend` ou `smtp` |
| `EMAIL_FROM` | `Mademoizelle Jane <commandes@votre-domaine.fr>` |
| `SHOP_NOTIFICATION_EMAIL` | adresse qui reçoit les commandes et messages |
| `RESEND_API_KEY` ou `SMTP_*` | selon le prestataire |
| `FORM_SECRET` | 64 caractères aléatoires (voir `.env.example`) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | facultatif |

Ne renseignez **pas** `STRIPE_MOCK_URL` en production.

4. **Deploy**. Après chaque modification de variable : *Deployments → … → Redeploy*.
5. **Settings → Domains** : ajoutez `votre-domaine.fr` et `www.votre-domaine.fr`, puis créez chez votre registraire les enregistrements DNS indiqués par Vercel.
6. Mettez à jour `NEXT_PUBLIC_SITE_URL`, l’URL du webhook Stripe et les URL Supabase (étape 1.5) avec le domaine définitif.

Les produits, photos et textes se modifient ensuite dans `/admin` : **aucun redéploiement n’est nécessaire**.

## 4. Emails (confirmation, expédition, contact)

Option recommandée : **Resend** (resend.com)
1. Créez le compte, ajoutez le domaine `votre-domaine.fr` et ajoutez chez le registraire les enregistrements DNS (SPF, DKIM) proposés. Attendez la validation.
2. Créez une clé API → `RESEND_API_KEY`, puis `EMAIL_PROVIDER=resend`.
3. `EMAIL_FROM` doit utiliser le domaine vérifié.
4. Resend fournit aussi un SMTP (`smtp.resend.com`, port 465, utilisateur `resend`, mot de passe = clé API) : utilisez-le dans Supabase (étape 1.6).

Alternative : tout SMTP (Brevo, OVH, boîte professionnelle) avec `EMAIL_PROVIDER=smtp` et les variables `SMTP_*`.

Sans configuration email, la boutique fonctionne : les commandes et messages sont visibles dans l’administration, mais aucun email n’est envoyé (c’est indiqué dans l’administration).

## 5. Anti-robot (facultatif)

Cloudflare Turnstile (gratuit) : créez un widget pour votre domaine, puis renseignez `NEXT_PUBLIC_TURNSTILE_SITE_KEY` et `TURNSTILE_SECRET_KEY`. Le formulaire de contact l’affichera automatiquement.

## 6. Avant l’ouverture

Dans l’administration, le **tableau de bord** affiche la liste « Avant l’ouverture ». À faire :

- [ ] Informations commerciales et légales (SIRET, adresse, statut, TVA, hébergeur, médiateur…)
- [ ] Relire et valider les pages Livraison, Entretien, Confidentialité, Mentions légales, CGV (idéalement avec un professionnel)
- [ ] Remplacer les visuels provisoires par les photos originales des médailles
- [ ] Vérifier frais de livraison, zones et délais (le tarif initial de 4,90 € est indicatif)
- [ ] Délai de fabrication indicatif
- [ ] Email de contact et liens Instagram / Pinterest / Facebook (masqués tant qu’ils sont vides)
- [ ] Dimensions du Cœur ovale (non indiquées sur les maquettes)
- [ ] Une commande test complète en mode test Stripe, puis passage en réel
