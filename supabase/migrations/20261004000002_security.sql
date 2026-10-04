-- =====================================================================
-- Sécurité : privilèges, Row Level Security, stockage
-- Principe : lecture publique limitée aux contenus publiés ;
-- toute écriture passe par un administrateur authentifié (RLS + is_admin)
-- ou par le serveur avec la clé secrète (commandes, webhooks, formulaires).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Une image est publique si elle est utilisée par un contenu publié
-- ---------------------------------------------------------------------
create or replace function public.media_is_public(p_media_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1 from public.product_images pi
      join public.products p on p.id = pi.product_id
      where pi.media_id = p_media_id and p.status = 'published'
    )
    or exists (
      select 1 from public.products p
      where p.story_image_id = p_media_id and p.status = 'published'
    )
    or exists (
      select 1 from public.collections c
      where c.image_id = p_media_id and c.is_published
    )
    or exists (
      select 1 from public.site_settings s
      where s.is_public and strpos(s.value::text, p_media_id::text) > 0
    );
$$;

-- ---------------------------------------------------------------------
-- Privilèges de base : on repart de zéro pour anon / authenticated
-- ---------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.media_is_public(uuid) to anon, authenticated;

-- Lecture publique (filtrée par RLS)
grant select on public.media, public.collections, public.products,
  public.product_variants, public.product_images, public.product_collections,
  public.site_settings, public.pages, public.faq_items, public.shipping_zones
  to anon, authenticated;

-- Écriture réservée aux administrateurs (contrôlée par RLS)
grant insert, update, delete on public.media, public.collections, public.products,
  public.product_variants, public.product_images, public.product_collections,
  public.site_settings, public.pages, public.faq_items, public.shipping_zones
  to authenticated;

grant select on public.admins to authenticated;

-- Commandes : lecture admin ; seules les colonnes de préparation sont modifiables.
-- Le statut de paiement n'est jamais modifiable depuis l'administration.
grant select on public.orders, public.order_items to authenticated;
grant update (fulfillment_status, carrier, tracking_number, tracking_url, internal_note, shipped_at)
  on public.orders to authenticated;

grant select, delete on public.contact_messages to authenticated;
grant update (status) on public.contact_messages to authenticated;
grant select, delete on public.newsletter_subscribers to authenticated;

-- ---------------------------------------------------------------------
-- Activation RLS sur toutes les tables
-- ---------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.media enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_collections enable row level security;
alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.faq_items enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stripe_events enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.rate_limits enable row level security;

-- Admins
create policy "admins: lecture par un admin" on public.admins
  for select to authenticated using ((select public.is_admin()));

-- Médias
create policy "media: lecture publique si utilisée" on public.media
  for select to anon, authenticated
  using (public.media_is_public(id) or (select public.is_admin()));
create policy "media: écriture admin" on public.media
  for insert to authenticated with check ((select public.is_admin()));
create policy "media: modification admin" on public.media
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "media: suppression admin" on public.media
  for delete to authenticated using ((select public.is_admin()));

-- Collections
create policy "collections: lecture publiées" on public.collections
  for select to anon, authenticated using (is_published or (select public.is_admin()));
create policy "collections: insertion admin" on public.collections
  for insert to authenticated with check ((select public.is_admin()));
create policy "collections: modification admin" on public.collections
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "collections: suppression admin" on public.collections
  for delete to authenticated using ((select public.is_admin()));

-- Produits
create policy "products: lecture publiés" on public.products
  for select to anon, authenticated using (status = 'published' or (select public.is_admin()));
create policy "products: insertion admin" on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy "products: modification admin" on public.products
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "products: suppression admin" on public.products
  for delete to authenticated using ((select public.is_admin()));

-- Variantes
create policy "variants: lecture si produit publié" on public.product_variants
  for select to anon, authenticated using (
    (select public.is_admin()) or exists (
      select 1 from public.products p where p.id = product_id and p.status = 'published'
    )
  );
create policy "variants: insertion admin" on public.product_variants
  for insert to authenticated with check ((select public.is_admin()));
create policy "variants: modification admin" on public.product_variants
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "variants: suppression admin" on public.product_variants
  for delete to authenticated using ((select public.is_admin()));

-- Photos produit
create policy "product_images: lecture si produit publié" on public.product_images
  for select to anon, authenticated using (
    (select public.is_admin()) or exists (
      select 1 from public.products p where p.id = product_id and p.status = 'published'
    )
  );
create policy "product_images: insertion admin" on public.product_images
  for insert to authenticated with check ((select public.is_admin()));
create policy "product_images: modification admin" on public.product_images
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "product_images: suppression admin" on public.product_images
  for delete to authenticated using ((select public.is_admin()));

-- Produits ↔ collections
create policy "product_collections: lecture si publiés" on public.product_collections
  for select to anon, authenticated using (
    (select public.is_admin()) or exists (
      select 1 from public.products p where p.id = product_id and p.status = 'published'
    )
  );
create policy "product_collections: insertion admin" on public.product_collections
  for insert to authenticated with check ((select public.is_admin()));
create policy "product_collections: modification admin" on public.product_collections
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "product_collections: suppression admin" on public.product_collections
  for delete to authenticated using ((select public.is_admin()));

-- Réglages / contenus
create policy "site_settings: lecture publique des clés publiques" on public.site_settings
  for select to anon, authenticated using (is_public or (select public.is_admin()));
create policy "site_settings: insertion admin" on public.site_settings
  for insert to authenticated with check ((select public.is_admin()));
create policy "site_settings: modification admin" on public.site_settings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "site_settings: suppression admin" on public.site_settings
  for delete to authenticated using ((select public.is_admin()));

create policy "pages: lecture publique" on public.pages
  for select to anon, authenticated using (true);
create policy "pages: insertion admin" on public.pages
  for insert to authenticated with check ((select public.is_admin()));
create policy "pages: modification admin" on public.pages
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "pages: suppression admin" on public.pages
  for delete to authenticated using ((select public.is_admin()));

create policy "faq: lecture publiées" on public.faq_items
  for select to anon, authenticated using (is_published or (select public.is_admin()));
create policy "faq: insertion admin" on public.faq_items
  for insert to authenticated with check ((select public.is_admin()));
create policy "faq: modification admin" on public.faq_items
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "faq: suppression admin" on public.faq_items
  for delete to authenticated using ((select public.is_admin()));

create policy "shipping: lecture zones actives" on public.shipping_zones
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "shipping: insertion admin" on public.shipping_zones
  for insert to authenticated with check ((select public.is_admin()));
create policy "shipping: modification admin" on public.shipping_zones
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "shipping: suppression admin" on public.shipping_zones
  for delete to authenticated using ((select public.is_admin()));

-- Commandes : réservées aux administrateurs (création par le serveur uniquement)
create policy "orders: lecture admin" on public.orders
  for select to authenticated using ((select public.is_admin()));
create policy "orders: préparation admin" on public.orders
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "order_items: lecture admin" on public.order_items
  for select to authenticated using ((select public.is_admin()));

-- Messages et newsletter : lecture admin (création par le serveur)
create policy "messages: lecture admin" on public.contact_messages
  for select to authenticated using ((select public.is_admin()));
create policy "messages: modification admin" on public.contact_messages
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "messages: suppression admin" on public.contact_messages
  for delete to authenticated using ((select public.is_admin()));
create policy "newsletter: lecture admin" on public.newsletter_subscribers
  for select to authenticated using ((select public.is_admin()));
create policy "newsletter: suppression admin" on public.newsletter_subscribers
  for delete to authenticated using ((select public.is_admin()));

-- stripe_events et rate_limits : aucune politique => inaccessibles hors clé secrète.

-- ---------------------------------------------------------------------
-- Stockage des photos
-- Bucket public en lecture (URL directes), écriture réservée aux admins.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "media bucket: liste admin" on storage.objects
  for select to authenticated using (bucket_id = 'media' and (select public.is_admin()));
create policy "media bucket: envoi admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media bucket: modification admin" on storage.objects
  for update to authenticated using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media bucket: suppression admin" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select public.is_admin()));
