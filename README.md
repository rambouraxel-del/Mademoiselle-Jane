# Mademoiselle Jane

Site vitrine e-commerce pour la vente de médailles personnalisées pour chiens,
fabriquées artisanalement en résine époxy.

Version v1 : catalogue, personnalisation produit, panier client (localStorage).
Le paiement (Stripe) et les comptes clients (Supabase) seront branchés au
prochain lot — l'architecture est déjà prête à les accueillir.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4 (thème personnalisé via variables CSS, voir `src/app/globals.css`)
- État panier en React Context + `localStorage`
- Données produits de démonstration dans `src/data/`

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — sert le build de production
- `npm run lint` — vérifie le code (ESLint)

## Variables d'environnement

Copier `.env.example` en `.env.local` et compléter les valeurs (Supabase,
Stripe) lorsque ces intégrations seront activées. Aucune clé réelle ne doit
être committée.

## Structure

```
src/
  app/            routes (App Router)
  components/     composants (ui, layout, home, product, cart, faq, contact)
  context/        CartContext (panier client)
  data/           données de démonstration (produits, options, FAQ, avis)
  lib/            points d'entrée préparatoires Supabase / Stripe
  services/       couche d'accès aux données (produits, contact)
  types/          types TypeScript (Product, CartItem, Order, ...)
  utils/          fonctions utilitaires (prix, validation, ids)
```
