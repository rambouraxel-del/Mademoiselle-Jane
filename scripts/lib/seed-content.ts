/**
 * Contenus initiaux (FAQ, pages d'informations, catalogue).
 * Aucune information commerciale n'est inventée : les éléments manquants
 * sont des jetons {{…}} remplis depuis « Informations commerciales et légales »,
 * ou signalés « à compléter ».
 */

export const SEED_PAGES = [
  {
    slug: "livraison",
    title: "Livraison",
    sort_order: 1,
    seo_description: "Zones desservies, frais et délais de livraison des médailles Mademoizelle Jane.",
    body: `## Zones et frais de livraison

{{shipping_zones}}

Les frais de livraison sont calculés automatiquement dans le panier selon le pays choisi.

## Délais

Chaque médaille est réalisée à la main après votre commande. Le délai de fabrication indicatif est précisé sur chaque fiche produit : {{default_fabrication_delay}}

**À compléter :** transporteur utilisé, délai d’acheminement indicatif après expédition, modalités de suivi du colis.

## Suivi de commande

Dès l’expédition, vous recevez un email avec, le cas échéant, le numéro de suivi de votre colis. Vous pouvez aussi consulter l’état de votre commande depuis la page [Suivre ma commande](/commande/suivi).`,
  },
  {
    slug: "entretien",
    title: "Entretien",
    sort_order: 2,
    seo_description: "Conseils pour entretenir votre médaille Mademoizelle Jane.",
    body: `## Prendre soin de sa médaille

**À valider par Ophélie :** les conseils ci-dessous sont une proposition de départ.

- Nettoyez la médaille avec un chiffon doux, légèrement humide si besoin, puis séchez-la.
- Évitez les produits ménagers, solvants et parfums.
- Retirez la médaille du collier pour le bain, la mer ou la piscine.
- Vérifiez régulièrement l’anneau d’attache pour ne pas perdre la médaille.

Pour toute question, n’hésitez pas à nous [écrire](/contact).`,
  },
  {
    slug: "confidentialite",
    title: "Politique de confidentialité",
    sort_order: 3,
    seo_description: "Comment Mademoizelle Jane traite vos données personnelles.",
    body: `## Responsable du traitement

{{business_name}} — {{address}}
Contact : {{contact_email}}

## Données collectées

- **Commandes** : nom, adresse email, téléphone, adresse de livraison, contenu de la commande et personnalisation (prénom de l’animal, numéro gravé au dos). Ces données servent à fabriquer, expédier et facturer votre commande.
- **Paiement** : il est réalisé sur la page sécurisée de Stripe. Aucune donnée de carte bancaire n’est reçue ni conservée par ce site.
- **Formulaire de contact** : nom, email et message, pour vous répondre.
- **Newsletter** : adresse email, uniquement avec votre consentement explicite. Chaque email contient un lien de désinscription.

## Durée de conservation

**À compléter :** durées de conservation (ex. obligations comptables pour les commandes, durée de conservation des messages).

## Destinataires

Vos données sont accessibles uniquement aux personnes gérant la boutique et aux prestataires techniques nécessaires (hébergement, paiement Stripe, envoi d’emails, transporteur).

## Vos droits

Vous pouvez demander l’accès, la rectification ou la suppression de vos données en écrivant à {{contact_email}}. Vous pouvez également introduire une réclamation auprès de la CNIL.

## Cookies

Ce site n’utilise pas de cookies publicitaires ni de mesure d’audience. Le panier est conservé dans votre navigateur. Un cookie technique est utilisé uniquement pour la connexion à l’espace d’administration.`,
  },
  {
    slug: "mentions-legales",
    title: "Mentions légales",
    sort_order: 4,
    seo_description: "Mentions légales du site Mademoizelle Jane.",
    body: `## Éditeur du site

- Nom : {{business_name}}
- Statut : {{legal_status}}
- SIRET : {{siret}}
- Adresse : {{address}}
- Email : {{contact_email}}
- Téléphone : {{phone}}
- TVA : {{vat_mention}}
- Directeur·rice de la publication : {{publication_director}}

## Hébergement

{{host_info}}

## Propriété intellectuelle

Les textes, photographies, logo et créations présentés sur ce site sont protégés. Toute reproduction sans autorisation est interdite.`,
  },
  {
    slug: "cgv",
    title: "Conditions générales de vente",
    sort_order: 5,
    seo_description: "Conditions générales de vente des médailles Mademoizelle Jane.",
    body: `**Document à compléter et à faire valider** avant l’ouverture de la boutique. La structure ci-dessous sert de point de départ.

## 1. Vendeur

{{business_name}}, {{legal_status}}, SIRET {{siret}}, {{address}}. Contact : {{contact_email}}.

## 2. Produits

Médailles pour chiens réalisées à la main et personnalisées selon les informations saisies par le client. Les photos sont aussi fidèles que possible ; de légères variations font le charme d’une pièce faite main.

## 3. Prix

Les prix sont indiqués en euros, toutes taxes applicables comprises. {{vat_mention}}. Les frais de livraison sont indiqués avant le paiement.

## 4. Commande et paiement

Le paiement s’effectue en ligne par l’intermédiaire de Stripe. La commande est confirmée après validation du paiement par Stripe.

## 5. Personnalisation

Le client est responsable de l’exactitude du prénom et du numéro de téléphone saisis. Merci de vérifier le récapitulatif avant de valider.

## 6. Fabrication et livraison

Délai de fabrication indicatif : {{default_fabrication_delay}}. Voir la page [Livraison](/infos/livraison).

## 7. Droit de rétractation

**À faire valider :** les biens confectionnés selon les spécifications du consommateur ou nettement personnalisés peuvent être exclus du droit de rétractation (article L221-28 du Code de la consommation). Préciser ici la politique retenue.

## 8. Garanties

**À compléter :** garantie légale de conformité et garantie des vices cachés.

## 9. Médiation

{{mediator}}

## 10. Données personnelles

Voir la [politique de confidentialité](/infos/confidentialite).`,
  },
];

export const SEED_FAQ = [
  {
    question: "Comment personnaliser ma médaille ?",
    answer:
      "Sur la fiche produit, choisissez la finition puis indiquez le prénom de votre animal. Vous pouvez aussi ajouter un numéro de téléphone au dos lorsque l’option est proposée. Un récapitulatif s’affiche avant l’ajout au panier.",
  },
  {
    question: "Quel est le délai de fabrication ?",
    answer:
      "Chaque médaille est réalisée à la main après la commande. Le délai indicatif est précisé sur chaque fiche produit et sur la page Livraison.",
  },
  {
    question: "Puis-je commander plusieurs médailles avec des prénoms différents ?",
    answer:
      "Oui. Chaque personnalisation est ajoutée au panier comme un article distinct : vous pouvez commander le même modèle pour plusieurs compagnons.",
  },
  {
    question: "Le paiement est-il sécurisé ?",
    answer:
      "Le paiement se fait sur la page sécurisée de Stripe. Aucune donnée de carte bancaire n’est conservée par la boutique.",
  },
  {
    question: "Comment entretenir ma médaille ?",
    answer: "Retrouvez nos conseils sur la page Entretien.",
  },
];

export type SeedImage = { file: string; alt: string };

export const SEED_MEDIA: Record<string, SeedImage> = {
  "coeur-rond-dore": { file: "coeur-rond-dore.jpg", alt: "Médaille Cœur rond dorée, blanc laiteux et petits cœurs rouges, prénom JANE" },
  "coeur-rond-argente": { file: "coeur-rond-argente-grille.jpg", alt: "Médaille Cœur rond argentée, blanc laiteux et petits cœurs rouges, prénom JANE" },
  "coeur-rond-dore-grille": { file: "coeur-rond-dore-grille.jpg", alt: "Médaille Cœur rond dorée posée sur un tissu en lin" },
  "fleur-amour-argentee": { file: "fleur-amour-argentee.jpg", alt: "Médaille Fleur d’amour argentée, petits cœurs rouges, prénom JANE" },
  "fleur-amour-doree": { file: "fleur-amour-doree-grille.jpg", alt: "Médaille Fleur d’amour dorée, petits cœurs rouges, prénom JANE" },
  "fleur-amour-gros-plan": { file: "fleur-amour-gros-plan.jpg", alt: "Gros plan sur les petits cœurs rouges et les lettres dorées d’une médaille" },
  "coeur-ovale-dore": { file: "coeur-ovale-dore-grille.jpg", alt: "Médaille Cœur ovale dorée, petits cœurs rouges, prénom JANE" },
  "coeur-ovale-argente": { file: "coeur-ovale-argente-grille.jpg", alt: "Médaille Cœur ovale argentée, petits cœurs rouges, prénom JANE" },
  "accueil-hero": { file: "accueil-hero.jpg", alt: "Médaille ronde dorée aux petits cœurs rouges posée sur un tissu en lin, fleurs séchées" },
  "accueil-atelier": { file: "accueil-atelier.jpg", alt: "Médaille en cours de fabrication à l’atelier, petits cœurs rouges et pince" },
  "histoire-hero": { file: "histoire-hero.jpg", alt: "Médaille JANE accrochée à un collier en tissu beige" },
  "histoire-mains": { file: "histoire-mains.jpg", alt: "Mains posant un à un les petits cœurs rouges sur une médaille" },
};

export const SEED_COLLECTION = {
  slug: "petits-coeurs",
  name: "Petits cœurs",
  description: "Des médailles blanc laiteux parsemées de petits cœurs rouges.",
  image: "coeur-rond-dore-grille",
};

const SWATCH_GOLD = "linear-gradient(135deg, #f3dc9b 0%, #c99a3e 55%, #e9c97a 100%)";
const SWATCH_SILVER = "linear-gradient(135deg, #f4f4f4 0%, #c3c5c8 55%, #e6e7e9 100%)";

const PERSONALIZATION_INFO =
  "Indiquez le prénom de votre compagnon tel qu’il doit apparaître sur la médaille. Le numéro de téléphone au dos est facultatif. Un récapitulatif de vos choix s’affiche avant l’ajout au panier.";

const CARE_INFO =
  "Nettoyez avec un chiffon doux. Évitez les produits ménagers et retirez la médaille pour le bain. Voir la page Entretien.";

export const SEED_PRODUCTS = [
  {
    slug: "coeur-rond",
    name: "Cœur rond",
    short_description: "Du blanc laiteux, de petits cœurs rouges et son prénom : une médaille pleine de tendresse.",
    description:
      "Une médaille ronde au fond blanc laiteux, parsemée de petits cœurs rouges posés un à un, avec le prénom de votre compagnon en lettres dorées. Réalisée à la main par Ophélie.",
    base_price_cents: 1800,
    shape: "Ronde",
    size_label: "2,5 cm",
    material: "Résine",
    dimensions: "Diamètre 2,5 cm",
    sort_order: 1,
    featured_order: 1,
    variants: [
      { name: "Dorée", finish: "doree", swatch: SWATCH_GOLD, images: ["coeur-rond-dore"] },
      { name: "Argentée", finish: "argentee", swatch: SWATCH_SILVER, images: ["coeur-rond-argente"] },
    ],
    story_image: null as string | null,
  },
  {
    slug: "fleur-d-amour",
    name: "Fleur d’amour",
    short_description: "Une fleur délicate, de petits cœurs et un prénom qui compte.",
    description:
      "Une médaille en forme de fleur, blanc laiteux, semée de petits cœurs rouges, avec le prénom de votre compagnon en lettres dorées. Réalisée à la main par Ophélie.",
    base_price_cents: 2000,
    shape: "Fleur",
    size_label: "2,5 cm",
    material: "Résine",
    dimensions: "Diamètre 2,5 cm",
    sort_order: 2,
    featured_order: 2,
    variants: [
      { name: "Dorée", finish: "doree", swatch: SWATCH_GOLD, images: ["fleur-amour-doree"] },
      { name: "Argentée", finish: "argentee", swatch: SWATCH_SILVER, images: ["fleur-amour-argentee"] },
    ],
    story_image: "fleur-amour-gros-plan",
  },
  {
    slug: "coeur-ovale",
    name: "Cœur ovale",
    short_description: "Un ovale tout en douceur, semé de petits cœurs rouges, pour un prénom qui fait fondre.",
    description:
      "Une médaille ovale blanc laiteux, où les petits cœurs rouges dessinent une jolie diagonale autour du prénom de votre compagnon, en lettres dorées. Réalisée à la main par Ophélie.",
    base_price_cents: 1800,
    shape: "Ovale",
    size_label: "",
    material: "Résine",
    dimensions: "",
    sort_order: 3,
    featured_order: 3,
    variants: [
      // L'accueil des maquettes présente la version argentée : sa photo est placée en premier.
      { name: "Dorée", finish: "doree", swatch: SWATCH_GOLD, images: ["coeur-ovale-dore"] },
      { name: "Argentée", finish: "argentee", swatch: SWATCH_SILVER, images: ["coeur-ovale-argente"], imageFirst: true },
    ],
    story_image: null as string | null,
  },
].map((p) => ({
  ...p,
  care_info: CARE_INFO,
  personalization_info: PERSONALIZATION_INFO,
}));

export const SEED_SHIPPING_ZONES = [
  {
    name: "France métropolitaine",
    countries: ["FR"],
    price_cents: 490,
    free_from_cents: null as number | null,
    delay_text: "",
    sort_order: 1,
  },
];
