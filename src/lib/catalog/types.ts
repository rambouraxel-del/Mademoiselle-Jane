export type MediaRef = {
  id: string;
  path: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  focalX: number;
  focalY: number;
  isPlaceholder: boolean;
};

export type PersonalizationField = {
  enabled: boolean;
  required: boolean;
  maxLength: number;
};

export type Variant = {
  id: string;
  name: string;
  finish: string;
  swatch: string;
  priceCents: number;
  stockQuantity: number | null;
  isActive: boolean;
  sortOrder: number;
  sku: string;
  available: boolean;
};

export type ProductImage = {
  id: string;
  media: MediaRef;
  variantId: string | null;
  alt: string;
  sortOrder: number;
};

export type ProductStatus = "draft" | "published" | "archived";
export type StockMode = "made_to_order" | "limited";

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  basePriceCents: number;
  shape: string;
  sizeLabel: string;
  material: string;
  dimensions: string;
  careInfo: string;
  personalizationInfo: string;
  fabricationDelay: string;
  stockMode: StockMode;
  isAvailable: boolean;
  sortOrder: number;
  isFeatured: boolean;
  featuredOrder: number;
  personalization: { name: PersonalizationField; phone: PersonalizationField };
  storyTitle: string;
  storyText: string;
  storyImage: MediaRef | null;
  seoTitle: string;
  seoDescription: string;
  variants: Variant[];
  images: ProductImage[];
  collections: { id: string; slug: string; name: string; sortOrder: number }[];
  updatedAt: string;
};

/** Une carte de la boutique : un produit dans une finition donnée. */
export type ShopCard = {
  key: string;
  product: Product;
  variant: Variant | null;
  title: string;
  priceCents: number;
  image: ProductImage | null;
  href: string;
  available: boolean;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: MediaRef | null;
  sortOrder: number;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
};
