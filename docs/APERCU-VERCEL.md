# Aperçu visuel sur Vercel (sans Supabase ni autre service)

L’aperçu visuel permet de montrer le site avec un simple lien, avant d’avoir créé les comptes Supabase, Stripe ou email.

## Ce que montre l’aperçu

Il s’active avec **une seule variable : `PREVIEW_MODE=true`**.

| Disponible | Désactivé |
| --- | --- |
| Toutes les pages publiques, fidèles aux maquettes | Paiement (aucune commande n’est créée) |
| Les 3 médailles et leurs 6 finitions, avec photos et textes initiaux | Formulaire de contact, newsletter, suivi de commande (un message l’indique) |
| Filtres, tri, recherche, fiches produits, choix de la finition | Administration (`/admin` affiche « Administration désactivée ») |
| Personnalisation, récapitulatif, panier, frais de livraison | Webhook Stripe |
| Affichage ordinateur et mobile | Référencement Google (le site demande à ne pas être indexé) |

- Un bandeau en haut de chaque page rappelle qu’il s’agit d’un aperçu.
- Les données viennent du dépôt : `src/lib/seed/content.ts` et `src/lib/content/sections.ts` pour les textes et produits, `public/media-initiales/` pour les photos. Ce sont les mêmes données initiales que celles chargées dans la vraie base par `npm run seed`.
- Modifier un texte de l’aperçu passe donc par le code. Dans la vraie boutique, tout se modifie depuis l’administration.

## Étapes pour obtenir le lien (environ 10 minutes)

1. **Créer le compte**
   Allez sur [vercel.com](https://vercel.com), cliquez sur **Sign Up**, choisissez l’offre gratuite **Hobby**, puis **Continue with GitHub**. Connectez-vous avec le compte GitHub qui possède le dépôt.

2. **Importer le dépôt**
   - Sur le tableau de bord : **Add New… → Project**.
   - Dans « Import Git Repository », cherchez `Mademoiselle-Jane`.
   - S’il n’apparaît pas : cliquez sur **Configure GitHub App** (ou « Adjust GitHub App Permissions »), autorisez l’accès au dépôt `Mademoiselle-Jane`, puis revenez.
   - Cliquez sur **Import**.

3. **Configurer le projet** (écran « Configure Project »)
   - *Project Name* : par exemple `mademoizelle-jane-apercu`. Ce nom formera le lien.
   - *Framework Preset* : **Next.js** (détecté automatiquement). Ne changez rien d’autre (dossier racine, commandes de build).
   - Ouvrez **Environment Variables** et ajoutez une seule variable :

     | Key | Value |
     | --- | --- |
     | `PREVIEW_MODE` | `true` |

     Aucune autre variable n’est nécessaire.

4. **Déployer**
   Cliquez sur **Deploy**. La construction prend environ 2 minutes. À la fin, l’écran « Congratulations » propose **Continue to Dashboard**.

5. **Récupérer le lien de test**
   - Sur le tableau de bord du projet, la case **Domains** affiche le lien, par exemple `https://mademoizelle-jane-apercu.vercel.app`.
   - C’est le lien à partager : il est public et ne demande pas de compte Vercel.
   - Les liens de déploiement plus longs (avec des lettres et chiffres aléatoires) peuvent, eux, demander une connexion Vercel : partagez toujours le lien de la case *Domains*.

6. **Vérifier**
   - Ouvrez le lien : le bandeau sombre « Aperçu visuel du site » doit apparaître en haut.
   - Parcourez l’accueil, la boutique, une fiche produit, puis ajoutez une médaille au panier.

## Environnements Vercel : Production ou Preview

Vercel classe chaque déploiement dans un environnement :

- **Production** : la *branche de production* du projet. À l’import, Vercel prend la branche par défaut du dépôt GitHub.
- **Preview** : toutes les autres branches.

Dans ce dépôt, la branche par défaut GitHub est encore l’ancienne `claude/dog-medals-ecommerce-v1-7reo8x`. Les déploiements de `main` sont donc des déploiements **Preview**.

Une variable n’est transmise qu’aux environnements cochés. Pour que l’aperçu fonctionne sur un déploiement Preview, `PREVIEW_MODE` doit être cochée pour **Preview**.

### Activer l’aperçu dans l’environnement Preview

1. Vercel → votre projet → **Settings → Environment Variables**.
2. Si `PREVIEW_MODE` existe déjà : menu **…** → **Edit**. Sinon : **Add Environment Variable**.
   - *Key* : `PREVIEW_MODE`
   - *Value* : `true`
   - *Environments* : cochez **Preview**. Cochez aussi **Production** si vous voulez l’aperçu sur le lien principal.
   - Pour *Preview*, laissez « All Preview Branches » (ou choisissez `main`).
   - **Save**.
3. Une variable ne s’applique qu’aux **nouveaux** déploiements. Allez dans **Deployments**, ouvrez le dernier déploiement de la branche `main`, puis menu **…** → **Redeploy** → **Redeploy**.
4. Quand le statut passe à *Ready*, ouvrez le lien du déploiement suivi de `/api/etat`, par exemple `https://….vercel.app/api/etat`. Vous devez lire `"previewMode":true` et `"vercelEnvironment":"preview"`.

Attention : par défaut, Vercel protège les déploiements **Preview** (« Vercel Authentication »). Le lien demande alors une connexion au compte Vercel. Pour partager l’aperçu sans compte, deux possibilités :
- **Recommandé** : faire de `main` la branche de production (voir ci-dessous). Le lien principal `https://<projet>.vercel.app` est public.
- Ou : *Settings → Deployment Protection* → désactiver « Vercel Authentication » pour ce projet.

### Faire de `main` la branche de production (recommandé)

1. GitHub → dépôt → **Settings → General → Default branch** : choisissez `main` (icône ⇄ → `main` → **Update**).
2. Vercel → projet → **Settings → Environments → Production → Branch Tracking** : indiquez `main` → **Save**.
3. **Deployments** → dernier déploiement de `main` → **…** → **Promote to Production**, ou **Redeploy**.

Le lien de la case *Domains* affiche alors l’aperçu. Vérifiez que `PREVIEW_MODE` est aussi cochée pour **Production**.

## Mises à jour

- Chaque nouveau commit sur la branche `main` redéploie automatiquement l’aperçu en 2 minutes environ.
- Après une modification de variable (*Settings → Environment Variables*), il faut redéployer : *Deployments* → menu **…** du dernier déploiement → **Redeploy**.
- La valeur de `PREVIEW_MODE` est lue au moment du build **et** à l’exécution. Les valeurs `true`, `1`, `oui`, `yes` et `on` sont acceptées, sans tenir compte des majuscules, espaces ou guillemets. Pour **désactiver** l’aperçu, supprimez la variable puis redéployez.

## Si quelque chose ne va pas

| Symptôme | Solution |
| --- | --- |
| La page affiche « Configuration requise » | La page indique maintenant le diagnostic : variable absente, valeur non reconnue, environnement (Production ou Preview), branche et commit. Ajoutez `PREVIEW_MODE` = `true` pour **cet** environnement (voir « Environnements Vercel »), puis faites **Redeploy**. |
| Vérifier l’état d’un déploiement | Ouvrez `<lien>/api/etat` : `previewMode` doit valoir `true`. Aucune donnée sensible n’y est affichée. |
| Le dépôt n’apparaît pas à l’import | Autorisez l’application GitHub de Vercel sur ce dépôt (étape 2). |
| Le déploiement échoue | Ouvrez le déploiement → **Build Logs** et transmettez-moi les dernières lignes. |
| Le lien demande de se connecter à Vercel | Utilisez le lien de la case *Domains*, pas celui d’un déploiement précis. Sinon : *Settings → Deployment Protection* → désactivez la protection pour ce projet d’aperçu. |

## Tester l’aperçu sur son ordinateur (facultatif)

```bash
PREVIEW_MODE=true npm run build
PREVIEW_MODE=true npm start
# puis ouvrir http://localhost:3000
```

Autre méthode : ajouter `PREVIEW_MODE=true` dans `.env.local`.

Tests automatisés de l’aperçu, avec le serveur d’aperçu lancé sur le port 3200 :

```bash
PREVIEW_MODE=true npm run build && PREVIEW_MODE=true npx next start -p 3200
npm run test:preview
```

## Passer ensuite à la vraie boutique

**Option recommandée :** garder ce projet comme aperçu et créer **un second projet Vercel** à partir du même dépôt pour la vraie boutique, **sans** `PREVIEW_MODE` et avec toutes les variables de [MISE-EN-LIGNE.md](MISE-EN-LIGNE.md).

**Option plus simple :** utiliser ce même projet. Supprimez `PREVIEW_MODE` (ou mettez `false`), ajoutez les variables de la vraie boutique, puis redéployez.

> Ne laissez jamais `PREVIEW_MODE=true` sur le projet de la vraie boutique : le paiement et l’administration y seraient désactivés.
