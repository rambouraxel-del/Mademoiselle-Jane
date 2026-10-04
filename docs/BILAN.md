# Bilan — Mademoizelle Jane

## Réalisé

**Site public** (fidèle aux maquettes, ordinateur et mobile)
- Accueil, boutique (filtres forme / finition / collection, tri, recherche), fiches produits, Notre histoire, Contact + FAQ, panier, paiement, confirmation, annulation, suivi de commande, pages Livraison / Entretien / Confidentialité / Mentions légales / CGV, newsletter (double consentement, désinscription), page 404.
- Logo : tracé vectoriel fidèle au lettrage de la maquette (`public/logo-mademoizelle-jane.svg`, fond transparent, texte alternatif « Mademoizelle Jane »). Aucune police libre ne reproduit ce lettrage : le logo n’est **pas** une police.
- Polices locales sous licence SIL OFL (`src/fonts/`) : EB Garamond (titres), Figtree (texte), Sacramento (petites accroches manuscrites, approximation du style des maquettes).
- Couleurs centralisées dans `src/app/globals.css`. Rose des boutons légèrement foncé (#A5656A au lieu de #AA6E73) pour un contraste lisible avec le texte blanc.
- SEO : métadonnées, sitemap, robots.txt, données structurées Produit avec une offre par finition.

**Catalogue** : 3 produits (Cœur rond 18 €, Fleur d’amour 20 €, Cœur ovale 18 €), chacun avec 2 finitions (Dorée, Argentée) → 6 déclinaisons dans la boutique comme sur la maquette. Personnalisation configurable par produit : prénom et téléphone au dos (activation, obligatoire, longueur maximale). Récapitulatif fiable des choix, sans aperçu photoréaliste.

**Administration** (`/admin`, ordinateur et téléphone) : produits (brouillon, aperçu privé, publication, dépublication, archivage, duplication, finitions, prix, stock, photos ordonnées par finition, mise en avant), ordre d’affichage, collections, médiathèque (import téléphone/ordinateur, texte alternatif, cadrage, protection des photos utilisées), tous les textes et images du site, FAQ, pages d’informations avec aperçu, informations légales, commandes (recherche, filtres, statuts de préparation séparés du paiement, suivi, note interne, email d’expédition, export CSV), messages, newsletter, zones et frais de livraison, liste « Avant l’ouverture ».

**Paiement et commandes** : Stripe Checkout ; montants recalculés côté serveur ; commande et instantané des lignes enregistrés avant le paiement ; webhooks signés et idempotents (payé, différé, échoué, expiré, remboursé, montant incohérent) ; réservation et remise en stock atomiques ; emails de confirmation et d’expédition envoyés une seule fois ; page de confirmation accessible uniquement par un jeton non devinable.

**Sécurité** : RLS sur toutes les tables et sur le stockage, rôle admin vérifié côté serveur et en base, statut de paiement non modifiable depuis l’administration, inscription publique fermée, validation serveur (zod), limitation des tentatives, contenu des images vérifié et métadonnées supprimées, pas de HTML brut dans les contenus, protection CSV contre l’injection de formules, secrets uniquement côté serveur.

## Testé (dans cet environnement)

74 tests automatisés, tous réussis sur une base locale remise à zéro, plus lint, TypeScript et build de production.

| Parcours | Test |
| --- | --- |
| Brouillon invisible au public (y compris ses photos et variantes) | intégration + bout en bout |
| Publication et apparition dans la boutique | intégration + bout en bout |
| Modification de prix et remplacement de photo, sans redéploiement | intégration + bout en bout |
| Refus des modifications par un utilisateur non administrateur / anonyme | intégration (RLS réelles) + bout en bout |
| Un admin ne peut pas déclarer un paiement réussi | intégration |
| Deux personnalisations différentes = deux articles | unitaire + bout en bout |
| Prix calculés côté serveur (prix falsifié dans le navigateur ignoré) | unitaire + bout en bout |
| Paiement : commande en attente, webhook non signé / mal signé / modifié refusé, webhook signé accepté, rejeu ignoré | bout en bout (stripe-mock + signature locale) |
| Webhook reçu plusieurs fois : un seul effet, un seul email (vérifié dans Mailpit) | intégration |
| Paiement différé, échec, expiration, remboursement, montant incohérent | intégration |
| Paramètres de session acceptés par l’API Stripe | intégration (stripe-mock) |
| Commande inchangée après modification du produit | intégration |
| Stock limité : réservation, refus de survente, remise en stock unique | unitaire + intégration |
| Message de contact enregistré ; envoi trop rapide (robot) refusé | bout en bout |
| Newsletter : consentement, email de confirmation, confirmation, désinscription | bout en bout (Mailpit) |
| Mot de passe oublié (lien email réel) et lien à jeton | bout en bout (Mailpit) |
| Absence de débordement horizontal à 390 × 844 (site et administration) | bout en bout |

Captures de validation : `docs/captures/` (20 pages en 1440 px et en 390 × 844).

## Non vérifiable ici (à tester avec vos comptes)

- **Stripe réel** : page de paiement Stripe, cartes de test, Apple/Google Pay, envoi réel des webhooks par Stripe (testés ici avec un faux serveur et des signatures locales).
- **Emails réels** (Resend ou SMTP) : délivrabilité et affichage dans Gmail / Outlook (testés ici avec un serveur local).
- **Supabase en ligne** et **déploiement Vercel** (aucun déploiement public effectué, comme demandé).
- **Cloudflare Turnstile** (facultatif, non activé).
- Import de photos **HEIC** depuis un iPhone : Safari convertit normalement en JPEG ; sinon un message demande un JPEG.
- Vrais téléphones : vérifié en émulation 390 × 844 uniquement.

## Paramètres à renseigner

Détail pas à pas : [MISE-EN-LIGNE.md](MISE-EN-LIGNE.md).

- Variables d’environnement (Supabase, Stripe, emails, `FORM_SECRET`) dans Vercel.
- Webhook Stripe (5 événements) et passage en clés réelles.
- Domaine (Vercel + DNS) et domaine d’envoi des emails (SPF/DKIM).
- Comptes administrateurs d’Axel et Ophélie (`npm run admin:create`).
- Dans l’administration : informations légales (SIRET, adresse, TVA, hébergeur, médiateur), relecture des pages légales, email de contact, réseaux sociaux, délai de fabrication, frais et délais de livraison (4,90 € = valeur indicative), dimensions du Cœur ovale.

## Choix et harmonisations

- Nom écrit **Mademoizelle Jane** partout (un « Mademoiselle » subsiste dans le nom du dépôt GitHub, pas sur le site).
- Coordonnées des maquettes (contact@…, @mademoizellejane) non reprises car non confirmées : champs vides, masqués sur le site tant qu’ils ne sont pas remplis.
- Noms et prix harmonisés : les suggestions de la maquette (« Cœur à cœur 20 € », « Élégance ovale 20 € ») sont remplacées par les vrais produits. Finitions nommées « Dorée » / « Argentée » partout.
- Une seule mise en page de fiche produit pour tous les produits, basée sur la maquette « Fleur d’amour », la plus complète : fil d’Ariane, bandeau « Les petits détails », suggestions. Un même en-tête sur toutes les pages.
- L’icône « compte » mène au **suivi de commande** (numéro + email) : la boutique n’a pas de comptes clients.
- Les clients choisissent le pays dans le panier ; l’adresse est saisie sur la page sécurisée de Stripe.

## Blocages et points d’attention

- **Photos originales non reçues** : seules 5 maquettes sont arrivées (la 6e, probablement Contact, manquait ; la page a été dessinée dans le même style). Les photos des médailles sont des **visuels provisoires extraits des maquettes** (badges retirés), marqués « Provisoire » dans l’administration. Remplacez-les par les originaux : produit → photo → « Remplacer ».
- Les pages légales contiennent une structure et des mentions « à compléter » : à faire valider avant l’ouverture.
- L’ancienne branche `claude/dog-medals-ecommerce-v1-7reo8x` existe toujours sur GitHub (suppression refusée depuis cette session).
