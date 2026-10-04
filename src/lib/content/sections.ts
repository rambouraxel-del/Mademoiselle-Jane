/**
 * Description des contenus éditables du site.
 * Chaque section correspond à une ligne de la table `site_settings`.
 * Les valeurs par défaut reprennent les textes des maquettes ; elles sont
 * copiées en base par le script de données initiales, puis modifiables
 * depuis l'administration (Contenus du site).
 */

export type FieldType = "text" | "textarea" | "image" | "link" | "boolean" | "icon" | "email" | "url";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  max?: number;
  /** Champ à compléter avant l'ouverture (affiché en alerte s'il est vide). */
  required?: boolean;
};

export type FieldGroup = { title: string; fields: FieldDef[] };

export type SectionDef = {
  key: SettingsKey;
  title: string;
  description: string;
  groups: FieldGroup[];
  isPublic: boolean;
};

export const ICONS = ["heart", "pencil", "rings", "hands", "paw", "sparkle", "gift", "leaf"] as const;
export type IconName = (typeof ICONS)[number];
export const ICON_LABELS: Record<IconName, string> = {
  heart: "Cœur",
  pencil: "Crayon",
  rings: "Anneaux",
  hands: "Mains et cœur",
  paw: "Patte",
  sparkle: "Étincelle",
  gift: "Cadeau",
  leaf: "Feuille",
};

export const DEFAULTS = {
  general: {
    announcement_enabled: true,
    announcement_text: "De petites médailles, beaucoup d’amour",
    logo_media_id: "",
    logo_alt: "Mademoizelle Jane",
    footer_tagline: "Des médailles uniques pour des compagnons exceptionnels.",
    contact_email: "",
    instagram_url: "",
    pinterest_url: "",
    facebook_url: "",
    newsletter_enabled: true,
    newsletter_title: "Rejoignez l’univers Mademoizelle Jane",
    newsletter_text: "Recevez nos nouveautés en avant-première.",
  },
  home: {
    hero_eyebrow: "Médailles personnalisées pour chiens",
    hero_title: "Un petit bijou\npour votre\ngrand amour.",
    hero_text: "Des médailles en résine imaginées et réalisées à la main par Ophélie.",
    hero_cta_label: "Découvrir les médailles",
    hero_cta_href: "/medailles",
    hero_image: "",
    featured_title: "Les petits coups de cœur",
    features_title: "Une médaille\nà son image",
    feature1_icon: "heart",
    feature1_title: "Choisissez sa forme",
    feature1_text: "Ronde, en fleur ou ovale.",
    feature2_icon: "pencil",
    feature2_title: "Ajoutez son prénom",
    feature2_text: "Une médaille unique, comme lui.",
    feature3_icon: "rings",
    feature3_title: "Doré ou argenté",
    feature3_text: "Deux finitions élégantes et intemporelles.",
    story_title: "Une histoire de mains\net de pattes",
    story_text:
      "Chaque médaille est imaginée et réalisée à la main avec amour, dans mon atelier. Parce que nos chiens méritent eux aussi un petit bijou unique.",
    story_cta_label: "Découvrir notre histoire",
    story_cta_href: "/notre-histoire",
    story_image: "",
  },
  story: {
    hero_script: "Tout commence avec Jane…",
    hero_title: "Une histoire\nde mains et de pattes.",
    hero_text:
      "Derrière Mademoizelle Jane, il y a Ophélie, l’amour des chiens et l’envie de créer des médailles qui leur ressemblent.",
    hero_image: "",
    section_title: "Imaginées avec amour, réalisées à la main.",
    section_text:
      "Chaque médaille prend vie dans notre atelier, avec soin et patience. Nous choisissons la forme, plaçons un à un les petits cœurs, puis personnalisons le nom de votre compagnon.",
    section_text2:
      "Des médailles uniques, pensées pour accompagner toutes les belles aventures du quotidien.",
    section_image: "",
    value1_icon: "heart",
    value1_title: "La douceur",
    value1_text: "Des médailles tendres et pleines de caractère pour nos compagnons.",
    value2_icon: "hands",
    value2_title: "Le fait main",
    value2_text: "Chaque médaille est réalisée à la main, avec soin, dans notre atelier.",
    value3_icon: "paw",
    value3_title: "La personnalisation",
    value3_text: "Le nom de votre chien, au cœur d’une médaille unique qui lui ressemble.",
    cta_label: "Trouver sa médaille",
    cta_href: "/medailles",
  },
  shop: {
    title: "Les médailles",
    subtitle: "Six façons de lui dire je t’aime.",
    quote_enabled: true,
    quote: "Un prénom, une médaille,\nune belle histoire.",
  },
  product_page: {
    details_title: "Les petits détails font les grandes histoires",
    details_text:
      "Une médaille raffinée, pensée pour accompagner votre compagnon au quotidien. Chaque détail est soigneusement travaillé, pour allier élégance et douceur.",
    details_image: "",
    related_title: "Vous aimerez aussi",
    personalization_notice:
      "Le prénom est reproduit tel que vous le saisissez. Aucun aperçu n’est généré : vérifiez bien le récapitulatif avant d’ajouter au panier.",
  },
  contact: {
    title: "Contact",
    intro:
      "Une question sur une médaille, une personnalisation ou une commande ? Écrivez-nous grâce au formulaire ci-dessous.",
    response_time: "",
    faq_title: "Questions fréquentes",
  },
  commerce: {
    business_name: "",
    legal_status: "",
    siret: "",
    address: "",
    phone: "",
    vat_mention: "",
    publication_director: "",
    host_info: "",
    mediator: "",
    default_fabrication_delay: "",
  },
} as const;

export type SettingsKey = keyof typeof DEFAULTS;
type Widen<T> = { -readonly [K in keyof T]: T[K] extends boolean ? boolean : string };
export type SettingsValue<K extends SettingsKey> = Widen<(typeof DEFAULTS)[K]>;
export type AllSettings = { [K in SettingsKey]: SettingsValue<K> };

const iconHelp = "Pictogramme affiché au-dessus du titre.";

export const SECTIONS: SectionDef[] = [
  {
    key: "general",
    title: "Général : bandeau, logo, pied de page",
    description: "Éléments communs à toutes les pages.",
    isPublic: true,
    groups: [
      {
        title: "Bandeau d’annonce",
        fields: [
          { key: "announcement_enabled", label: "Afficher le bandeau", type: "boolean" },
          { key: "announcement_text", label: "Texte du bandeau", type: "text", max: 120 },
        ],
      },
      {
        title: "Logo",
        fields: [
          {
            key: "logo_media_id",
            label: "Logo personnalisé (facultatif)",
            type: "image",
            help: "Laissez vide pour conserver le logo manuscrit d’origine. Utilisez une image PNG à fond transparent.",
          },
          { key: "logo_alt", label: "Texte alternatif du logo", type: "text", max: 80 },
        ],
      },
      {
        title: "Pied de page et coordonnées",
        fields: [
          { key: "footer_tagline", label: "Phrase sous le logo", type: "text", max: 160 },
          {
            key: "contact_email",
            label: "Adresse email de contact affichée",
            type: "email",
            required: true,
            help: "Affichée dans le pied de page et la page Contact. Laissez vide pour la masquer.",
          },
          { key: "instagram_url", label: "Lien Instagram", type: "url", help: "Adresse complète (https://…). Vide = icône masquée." },
          { key: "pinterest_url", label: "Lien Pinterest", type: "url" },
          { key: "facebook_url", label: "Lien Facebook", type: "url" },
        ],
      },
      {
        title: "Newsletter",
        fields: [
          {
            key: "newsletter_enabled",
            label: "Afficher l’inscription à la newsletter",
            type: "boolean",
            help: "L’inscription demande un consentement explicite et une confirmation par email.",
          },
          { key: "newsletter_title", label: "Titre", type: "text", max: 80 },
          { key: "newsletter_text", label: "Texte", type: "text", max: 200 },
        ],
      },
    ],
  },
  {
    key: "home",
    title: "Accueil",
    description: "Textes, images et liens de la page d’accueil.",
    isPublic: true,
    groups: [
      {
        title: "Grande image d’ouverture",
        fields: [
          { key: "hero_eyebrow", label: "Petit titre", type: "text", max: 80 },
          { key: "hero_title", label: "Titre principal", type: "textarea", max: 120 },
          { key: "hero_text", label: "Texte", type: "textarea", max: 300 },
          { key: "hero_cta_label", label: "Texte du bouton", type: "text", max: 40 },
          { key: "hero_cta_href", label: "Lien du bouton", type: "link" },
          { key: "hero_image", label: "Image principale", type: "image" },
        ],
      },
      {
        title: "Produits mis en avant",
        fields: [{ key: "featured_title", label: "Titre de la section", type: "text", max: 80 }],
      },
      {
        title: "Bandeau « Une médaille à son image »",
        fields: [
          { key: "features_title", label: "Titre", type: "text", max: 60 },
          { key: "feature1_icon", label: "Pictogramme 1", type: "icon", help: iconHelp },
          { key: "feature1_title", label: "Titre 1", type: "text", max: 40 },
          { key: "feature1_text", label: "Texte 1", type: "text", max: 120 },
          { key: "feature2_icon", label: "Pictogramme 2", type: "icon" },
          { key: "feature2_title", label: "Titre 2", type: "text", max: 40 },
          { key: "feature2_text", label: "Texte 2", type: "text", max: 120 },
          { key: "feature3_icon", label: "Pictogramme 3", type: "icon" },
          { key: "feature3_title", label: "Titre 3", type: "text", max: 40 },
          { key: "feature3_text", label: "Texte 3", type: "text", max: 120 },
        ],
      },
      {
        title: "Bloc histoire",
        fields: [
          { key: "story_title", label: "Titre", type: "text", max: 80 },
          { key: "story_text", label: "Texte", type: "textarea", max: 500 },
          { key: "story_cta_label", label: "Texte du bouton", type: "text", max: 40 },
          { key: "story_cta_href", label: "Lien du bouton", type: "link" },
          { key: "story_image", label: "Photo", type: "image" },
        ],
      },
    ],
  },
  {
    key: "story",
    title: "Notre histoire",
    description: "Page « Notre histoire ».",
    isPublic: true,
    groups: [
      {
        title: "Ouverture",
        fields: [
          { key: "hero_script", label: "Accroche manuscrite", type: "text", max: 60 },
          { key: "hero_title", label: "Titre", type: "textarea", max: 120 },
          { key: "hero_text", label: "Texte", type: "textarea", max: 400 },
          { key: "hero_image", label: "Image", type: "image" },
        ],
      },
      {
        title: "Atelier",
        fields: [
          { key: "section_title", label: "Titre", type: "textarea", max: 120 },
          { key: "section_text", label: "Paragraphe 1", type: "textarea", max: 800 },
          { key: "section_text2", label: "Paragraphe 2", type: "textarea", max: 800 },
          { key: "section_image", label: "Photo", type: "image" },
        ],
      },
      {
        title: "Valeurs",
        fields: [
          { key: "value1_icon", label: "Pictogramme 1", type: "icon", help: iconHelp },
          { key: "value1_title", label: "Titre 1", type: "text", max: 40 },
          { key: "value1_text", label: "Texte 1", type: "textarea", max: 160 },
          { key: "value2_icon", label: "Pictogramme 2", type: "icon" },
          { key: "value2_title", label: "Titre 2", type: "text", max: 40 },
          { key: "value2_text", label: "Texte 2", type: "textarea", max: 160 },
          { key: "value3_icon", label: "Pictogramme 3", type: "icon" },
          { key: "value3_title", label: "Titre 3", type: "text", max: 40 },
          { key: "value3_text", label: "Texte 3", type: "textarea", max: 160 },
          { key: "cta_label", label: "Texte du bouton", type: "text", max: 40 },
          { key: "cta_href", label: "Lien du bouton", type: "link" },
        ],
      },
    ],
  },
  {
    key: "shop",
    title: "Boutique",
    description: "En-tête et citation de la page « Les médailles ».",
    isPublic: true,
    groups: [
      {
        title: "En-tête",
        fields: [
          { key: "title", label: "Titre", type: "text", max: 60 },
          { key: "subtitle", label: "Sous-titre", type: "text", max: 120 },
        ],
      },
      {
        title: "Citation",
        fields: [
          { key: "quote_enabled", label: "Afficher la citation", type: "boolean" },
          { key: "quote", label: "Citation", type: "textarea", max: 160 },
        ],
      },
    ],
  },
  {
    key: "product_page",
    title: "Fiches produits",
    description: "Textes communs à toutes les fiches produits.",
    isPublic: true,
    groups: [
      {
        title: "Bandeau détails",
        fields: [
          { key: "details_title", label: "Titre", type: "text", max: 100 },
          { key: "details_text", label: "Texte", type: "textarea", max: 600 },
          {
            key: "details_image",
            label: "Image par défaut",
            type: "image",
            help: "Utilisée si le produit n’a pas sa propre image de détail.",
          },
        ],
      },
      {
        title: "Divers",
        fields: [
          { key: "related_title", label: "Titre des suggestions", type: "text", max: 60 },
          { key: "personalization_notice", label: "Note sous la personnalisation", type: "textarea", max: 400 },
        ],
      },
    ],
  },
  {
    key: "contact",
    title: "Contact et FAQ",
    description: "Textes de la page Contact. Les questions se gèrent dans « FAQ ».",
    isPublic: true,
    groups: [
      {
        title: "Page Contact",
        fields: [
          { key: "title", label: "Titre", type: "text", max: 60 },
          { key: "intro", label: "Introduction", type: "textarea", max: 600 },
          {
            key: "response_time",
            label: "Délai de réponse indicatif",
            type: "text",
            max: 80,
            help: "Ex. « sous 48 heures ouvrées ». Laissez vide pour ne rien promettre.",
          },
          { key: "faq_title", label: "Titre de la FAQ", type: "text", max: 60 },
        ],
      },
    ],
  },
  {
    key: "commerce",
    title: "Informations commerciales et légales",
    description:
      "Ces informations alimentent les mentions légales, les CGV et les emails. Elles ne sont jamais inventées : complétez-les avant l’ouverture.",
    isPublic: true,
    groups: [
      {
        title: "Entreprise",
        fields: [
          { key: "business_name", label: "Nom ou raison sociale", type: "text", required: true, max: 120 },
          { key: "legal_status", label: "Statut juridique", type: "text", required: true, max: 120, help: "Ex. micro-entreprise." },
          { key: "siret", label: "Numéro SIRET", type: "text", required: true, max: 20 },
          { key: "address", label: "Adresse postale", type: "textarea", required: true, max: 300 },
          { key: "phone", label: "Téléphone (facultatif)", type: "text", max: 30 },
          { key: "vat_mention", label: "Mention TVA", type: "text", required: true, max: 160 },
          { key: "publication_director", label: "Directeur·rice de la publication", type: "text", required: true, max: 120 },
          { key: "host_info", label: "Hébergeur (nom, adresse)", type: "textarea", required: true, max: 300 },
          { key: "mediator", label: "Médiateur de la consommation", type: "textarea", required: true, max: 300 },
        ],
      },
      {
        title: "Fabrication",
        fields: [
          {
            key: "default_fabrication_delay",
            label: "Délai de fabrication indicatif par défaut",
            type: "text",
            max: 120,
            help: "Affiché si le produit n’a pas de délai propre.",
          },
        ],
      },
    ],
  },
];

export function sectionByKey(key: string): SectionDef | undefined {
  return SECTIONS.find((s) => s.key === key);
}

export function isSettingsKey(key: string): key is SettingsKey {
  return Object.prototype.hasOwnProperty.call(DEFAULTS, key);
}

/** Fusionne une valeur stockée avec les valeurs par défaut (types préservés). */
export function mergeSettings<K extends SettingsKey>(key: K, stored: unknown): SettingsValue<K> {
  const defaults = DEFAULTS[key] as Record<string, string | boolean>;
  const out: Record<string, string | boolean> = { ...defaults };
  if (stored && typeof stored === "object") {
    for (const [k, v] of Object.entries(stored as Record<string, unknown>)) {
      if (!(k in defaults)) continue;
      const expected = typeof defaults[k];
      if (expected === "boolean" && typeof v === "boolean") out[k] = v;
      if (expected === "string" && typeof v === "string") out[k] = v;
    }
  }
  return out as SettingsValue<K>;
}
