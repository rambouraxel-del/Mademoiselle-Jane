# Guide de l’administration

Pour Ophélie et Axel. L’administration se trouve à l’adresse **`votre-site/admin`**. Elle fonctionne sur ordinateur et sur téléphone (menu ☰ en haut à gauche).

Chaque action affiche un message vert (réussi) ou rouge (problème). Les suppressions demandent toujours une confirmation. Ce qui est **publié** apparaît immédiatement sur le site, sans intervention technique.

## Se connecter

- Email et mot de passe personnels (un compte pour chacun).
- Mot de passe oublié : lien sous le formulaire, un email permet d’en choisir un nouveau.
- « Se déconnecter » en bas du menu.

## Le tableau de bord

- Les dernières commandes.
- La liste **« Avant l’ouverture »** : ce qu’il reste à compléter (informations légales, photos définitives, frais de livraison…). Un point orange = à faire.

## Produits

**Produits → + Nouveau produit**

1. **Informations** : nom (l’adresse de la page se crée toute seule), description courte (sous le nom), description détaillée.
2. **Prix et finitions** : prix de base, puis une ligne par finition (Dorée, Argentée…). Laissez le prix d’une finition vide pour reprendre le prix de base. La pastille colore le bouton de choix.
3. **Photos** : « + Ajouter des photos » → importez depuis le téléphone ou l’ordinateur, ou choisissez dans la bibliothèque. La première photo est la **principale**. Les flèches ↑ ↓ changent l’ordre. Associez une photo à une finition pour qu’elle s’affiche quand le client choisit cette finition. « Remplacer » change une photo sans perdre les réglages.
4. **Personnalisation** : prénom et téléphone au dos, activés ou non, obligatoires ou non, longueur maximale.
5. **Caractéristiques** : forme (sert au filtre de la boutique : Ronde, Fleur, Ovale…), diamètre, matière, délai de fabrication, entretien.
6. **Disponibilité et stock** : « Fabrication à la commande » (pas de limite) ou « Quantité limitée » (indiquez le stock de chaque finition ; il diminue à chaque commande et revient si le paiement n’aboutit pas).
7. **Mise en avant** : cochez pour afficher le produit dans « Les petits coups de cœur » de l’accueil.
8. **Collections**, **bandeau « Les petits détails »** et **référencement Google** : facultatifs.

Boutons en bas de l’écran :

| Bouton | Effet |
| --- | --- |
| Enregistrer le brouillon | sauvegarde, **invisible** sur le site |
| Aperçu privé | voir la fiche telle qu’elle apparaîtra (visible seulement par vous) |
| Publier | le produit apparaît dans la boutique |
| Enregistrer et mettre à jour le site | pour un produit déjà publié |
| Dépublier | retire le produit du site (redevient brouillon) |
| Archiver | retire le produit du site et le range |
| Dupliquer (en haut) | crée une copie en brouillon, pratique pour un nouveau modèle |

**Ordre d’affichage** (bouton sur la liste des produits) : ordre dans la boutique et ordre des coups de cœur, avec les flèches.

Les commandes déjà passées **ne changent jamais** quand vous modifiez un produit (nom, prix, finition, prénom sont figés dans la commande).

## Photos et médias

- Importez plusieurs photos d’un coup (glisser-déposer sur ordinateur, ou « Choisir des photos » sur téléphone, y compris l’appareil photo).
- Les photos sont redimensionnées automatiquement et les informations de localisation sont supprimées.
- Cliquez sur une photo pour :
  - écrire son **texte alternatif** (description pour les personnes malvoyantes et Google) ;
  - régler le **cadrage** : cliquez sur la partie importante de la photo ; les aperçus montrent le résultat dans les différents formats ;
  - la **supprimer** (impossible tant qu’elle est utilisée : remplacez-la d’abord).
- Les photos marquées **« Provisoire (maquette) »** viennent des maquettes : remplacez-les par les vraies photos des médailles.

## Collections

Groupes de médailles (ex. « Petits cœurs ») proposés dans le filtre de la boutique. Pour chaque collection : nom, description, image, visibilité, et l’ordre des produits (flèches).

## Contenus du site

**Contenus du site** regroupe tous les textes et images :

- **Général** : bandeau d’annonce rose, logo (remplaçable, sinon le logo manuscrit d’origine), phrase du pied de page, email de contact, liens Instagram / Pinterest / Facebook (masqués s’ils sont vides), newsletter.
- **Accueil**, **Notre histoire**, **Boutique**, **Fiches produits**, **Contact et FAQ** : textes, images, boutons et liens.
- **Informations commerciales et légales** : nom, SIRET, adresse, TVA, hébergeur… Ces informations remplissent automatiquement les mentions légales, les CGV et la confidentialité.
- **Questions fréquentes** : ajouter, modifier, masquer, réordonner.
- **Pages d’informations** (Livraison, Entretien, Confidentialité, Mentions légales, CGV) : texte avec aperçu en direct. Tant que la case « Page relue et validée » n’est pas cochée, un avertissement « en cours de rédaction » s’affiche sur le site.

Un retour à la ligne dans un champ de texte crée un retour à la ligne sur le site. Les couleurs et polices restent celles de la charte : la mise en page s’adapte seule.

## Commandes

**Commandes** affiche les commandes (les paniers jamais payés sont masqués par défaut).

- Recherche par numéro, nom ou email ; filtres par paiement et par préparation. Le filtre **« À traiter »** montre les commandes payées pas encore expédiées.
- Dans une commande : les médailles à réaliser avec le **prénom en grand** et le téléphone au dos, les coordonnées et l’adresse de livraison.
- **Deux statuts distincts** :
  - **Paiement** : fixé uniquement par Stripe (impossible à modifier à la main). « À vérifier » signifie que le montant reçu ne correspond pas : contrôlez dans Stripe avant de fabriquer.
  - **Préparation** : à traiter → en fabrication → prête → expédiée → livrée (ou annulée), que vous faites évoluer.
- À l’expédition : choisissez « Expédiée », indiquez transporteur et numéro de suivi, laissez cochée « Envoyer l’email d’expédition » → le client reçoit un email (une seule fois).
- **Note interne** : visible uniquement dans l’administration.
- **Exporter en CSV** : télécharge les commandes filtrées (ouvrable avec Excel ou LibreOffice).
- Remboursement : à faire dans le tableau de bord Stripe ; la commande passe automatiquement à « Remboursée ».

Le client peut suivre sa commande sur le site (icône personnage → « Suivre ma commande ») avec son numéro et son email.

## Messages

Les messages du formulaire de contact. « Répondre » se fait depuis votre messagerie (cliquez sur l’adresse email). Marquez comme lu, archivez ou supprimez.

## Newsletter

La liste des inscriptions. Seules les adresses **confirmées** (la personne a cliqué sur le lien reçu) ont donné leur consentement. « Exporter les confirmés » produit un fichier à importer dans un outil d’envoi (Brevo, Mailchimp…).

## Livraison et réglages

- **Zones de livraison** : nom, pays desservis (codes à 2 lettres : FR, BE, CH…), frais, livraison offerte à partir d’un montant (facultatif), délai affiché.
- Le pays choisi dans le panier détermine les frais ; un pays sans zone ne peut pas commander.
- L’état des services (paiement en test ou réel, emails) est rappelé en bas de page.
