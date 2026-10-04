-- =====================================================================
-- Mademoizelle Jane — schéma principal
-- Catalogue, contenus, commandes, messages, newsletter.
-- Les règles de sécurité (RLS) sont dans la migration suivante.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------
create type public.product_status as enum ('draft', 'published', 'archived');
create type public.stock_mode as enum ('made_to_order', 'limited');
create type public.payment_status as enum (
  'pending',      -- session Stripe créée, paiement non confirmé
  'processing',   -- paiement différé en cours (virement, etc.)
  'paid',         -- confirmé par un événement Stripe signé
  'failed',       -- paiement différé échoué
  'expired',      -- session Stripe expirée sans paiement
  'cancelled',    -- session non créée / abandon technique
  'refunded',     -- remboursé (constaté via Stripe)
  'review'        -- incohérence détectée (montant) : à vérifier
);
create type public.fulfillment_status as enum (
  'new',           -- à traiter
  'in_production', -- en fabrication
  'ready',         -- prête à expédier
  'shipped',       -- expédiée
  'delivered',     -- livrée
  'cancelled'      -- annulée
);
create type public.message_status as enum ('new', 'read', 'archived');
create type public.subscriber_status as enum ('pending', 'confirmed', 'unsubscribed');

-- ---------------------------------------------------------------------
-- Utilitaire : updated_at automatique
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Administrateurs
-- Un utilisateur Supabase Auth n'est administrateur que s'il figure ici.
-- Cette table n'est modifiable qu'avec la clé secrète (script documenté).
-- ---------------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------
-- Médias (photos stockées dans le bucket « media »)
-- ---------------------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media',
  path text not null unique,
  mime_type text not null,
  size_bytes integer not null check (size_bytes > 0),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  alt text not null default '' check (char_length(alt) <= 300),
  -- Cadrage : point focal en pourcentage (object-position)
  focal_x real not null default 50 check (focal_x between 0 and 100),
  focal_y real not null default 50 check (focal_y between 0 and 100),
  original_filename text,
  -- Visuel provisoire extrait des maquettes, à remplacer par une photo originale
  is_placeholder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);
create trigger media_updated_at before update on public.media
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Collections
-- ---------------------------------------------------------------------
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  image_id uuid references public.media (id) on delete restrict,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  seo_title text not null default '',
  seo_description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger collections_updated_at before update on public.collections
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Produits
-- ---------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 120),
  short_description text not null default '' check (char_length(short_description) <= 400),
  description text not null default '' check (char_length(description) <= 8000),
  status public.product_status not null default 'draft',
  base_price_cents integer not null check (base_price_cents >= 0 and base_price_cents <= 1000000),
  -- Forme (filtre boutique) : « Ronde », « Fleur », « Ovale »…
  shape text not null default '' check (char_length(shape) <= 40),
  size_label text not null default '' check (char_length(size_label) <= 40),
  material text not null default '' check (char_length(material) <= 120),
  dimensions text not null default '' check (char_length(dimensions) <= 200),
  care_info text not null default '' check (char_length(care_info) <= 4000),
  personalization_info text not null default '' check (char_length(personalization_info) <= 4000),
  fabrication_delay text not null default '' check (char_length(fabrication_delay) <= 200),
  stock_mode public.stock_mode not null default 'made_to_order',
  is_available boolean not null default true,
  -- Ordre d'affichage en boutique
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  featured_order integer not null default 0,
  -- Personnalisation : prénom
  name_enabled boolean not null default true,
  name_required boolean not null default true,
  name_max_length integer not null default 12 check (name_max_length between 1 and 60),
  -- Personnalisation : téléphone au dos
  phone_enabled boolean not null default true,
  phone_required boolean not null default false,
  phone_max_length integer not null default 20 check (phone_max_length between 6 and 30),
  -- Bandeau éditorial « Les petits détails… » propre au produit (facultatif)
  story_title text not null default '',
  story_text text not null default '',
  story_image_id uuid references public.media (id) on delete restrict,
  seo_title text not null default '',
  seo_description text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_status_idx on public.products (status);
create index products_featured_idx on public.products (is_featured, featured_order);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),        -- « Dorée »
  finish text not null default '' check (char_length(finish) <= 40),     -- clé de filtre : « doree »
  swatch text not null default '' check (char_length(swatch) <= 120),    -- couleur CSS de la pastille
  price_cents integer check (price_cents is null or (price_cents >= 0 and price_cents <= 1000000)),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  sku text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_variants_product_idx on public.product_variants (product_id, sort_order);
create trigger product_variants_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  media_id uuid not null references public.media (id) on delete restrict,
  -- Photo associée à une finition précise (facultatif)
  variant_id uuid references public.product_variants (id) on delete set null,
  sort_order integer not null default 0,
  alt_override text not null default '',
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);
create index product_images_media_idx on public.product_images (media_id);

create table public.product_collections (
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (product_id, collection_id)
);
create index product_collections_collection_idx on public.product_collections (collection_id, sort_order);

-- ---------------------------------------------------------------------
-- Contenus éditables
-- ---------------------------------------------------------------------
create table public.site_settings (
  key text primary key check (key ~ '^[a-z_]+$'),
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

create table public.pages (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 160),
  body text not null default '' check (char_length(body) <= 60000),
  -- false = contenu à compléter : un avertissement est affiché sur le site
  is_complete boolean not null default false,
  seo_description text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);
create trigger pages_updated_at before update on public.pages
  for each row execute function public.set_updated_at();

create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 1 and 300),
  answer text not null check (char_length(answer) between 1 and 4000),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger faq_items_updated_at before update on public.faq_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Livraison
-- ---------------------------------------------------------------------
create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  -- Codes pays ISO 3166-1 alpha-2 (FR, BE…)
  countries text[] not null check (cardinality(countries) > 0),
  price_cents integer not null check (price_cents >= 0 and price_cents <= 100000),
  free_from_cents integer check (free_from_cents is null or free_from_cents >= 0),
  delay_text text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger shipping_zones_updated_at before update on public.shipping_zones
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Commandes
-- ---------------------------------------------------------------------
create sequence public.order_number_seq start 1;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  -- Jeton non devinable pour la page de confirmation (jamais l'id)
  public_token text not null unique,
  payment_status public.payment_status not null default 'pending',
  fulfillment_status public.fulfillment_status not null default 'new',
  currency text not null default 'eur',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null check (shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  shipping_zone_id uuid references public.shipping_zones (id) on delete set null,
  shipping_zone_name text not null default '',
  shipping_country text not null default '',
  -- Coordonnées (renseignées par Stripe Checkout via webhook)
  customer_email text,
  customer_name text,
  customer_phone text,
  shipping_address jsonb,
  -- Stripe
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  amount_received_cents integer,
  paid_at timestamptz,
  -- Stock
  stock_reserved boolean not null default false,
  stock_released boolean not null default false,
  -- Préparation / expédition
  carrier text not null default '',
  tracking_number text not null default '',
  tracking_url text not null default '',
  internal_note text not null default '',
  shipped_at timestamptz,
  -- Emails (prévention des doubles envois)
  confirmation_email_claimed_at timestamptz,
  confirmation_email_sent_at timestamptz,
  shop_notification_sent_at timestamptz,
  shipping_email_claimed_at timestamptz,
  shipping_email_sent_at timestamptz,
  last_email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_created_idx on public.orders (created_at desc);
create index orders_payment_idx on public.orders (payment_status);
create index orders_fulfillment_idx on public.orders (fulfillment_status);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- Lignes : instantané figé au moment de la commande
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  product_slug text not null default '',
  variant_name text not null default '',
  size_label text not null default '',
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity between 1 and 20),
  line_total_cents integer not null check (line_total_cents >= 0),
  personalization jsonb not null default '{}'::jsonb,
  image_path text,
  stock_limited boolean not null default false,
  created_at timestamptz not null default now()
);
create index order_items_order_idx on public.order_items (order_id);

-- Idempotence des webhooks Stripe
create table public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  attempts integer not null default 0,
  last_error text
);

-- ---------------------------------------------------------------------
-- Messages de contact
-- ---------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  subject text not null default '' check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 5000),
  order_number text not null default '' check (char_length(order_number) <= 40),
  status public.message_status not null default 'new',
  notification_sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index contact_messages_created_idx on public.contact_messages (created_at desc);

-- ---------------------------------------------------------------------
-- Newsletter (double consentement)
-- ---------------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) between 3 and 254),
  status public.subscriber_status not null default 'pending',
  consent_text text not null,
  consent_at timestamptz not null default now(),
  confirm_token text not null unique,
  unsubscribe_token text not null unique,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Limitation des tentatives (clé = empreinte, jamais l'IP en clair)
-- ---------------------------------------------------------------------
create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);
