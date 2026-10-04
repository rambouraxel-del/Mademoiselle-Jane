-- =====================================================================
-- Fonctions d'administration : enregistrement et duplication de produit
-- en une seule transaction (tout ou rien).
-- Exécutées avec les droits de l'appelant (RLS) ET un contrôle explicite
-- du rôle administrateur.
-- =====================================================================

create or replace function public.admin_save_product(p jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid := nullif(p->>'id', '')::uuid;
  v_status public.product_status := (p->>'status')::public.product_status;
  v_map jsonb := '{}'::jsonb;
  v_keep uuid[] := '{}';
  v_vid uuid;
  v_old_coll jsonb;
  r jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  if v_id is null then
    insert into public.products (slug, name, status, base_price_cents)
    values (p->>'slug', p->>'name', v_status, (p->>'base_price_cents')::int)
    returning id into v_id;
  end if;

  update public.products set
    slug = p->>'slug',
    name = p->>'name',
    short_description = coalesce(p->>'short_description', ''),
    description = coalesce(p->>'description', ''),
    status = v_status,
    base_price_cents = (p->>'base_price_cents')::int,
    shape = coalesce(p->>'shape', ''),
    size_label = coalesce(p->>'size_label', ''),
    material = coalesce(p->>'material', ''),
    dimensions = coalesce(p->>'dimensions', ''),
    care_info = coalesce(p->>'care_info', ''),
    personalization_info = coalesce(p->>'personalization_info', ''),
    fabrication_delay = coalesce(p->>'fabrication_delay', ''),
    stock_mode = (p->>'stock_mode')::public.stock_mode,
    is_available = (p->>'is_available')::boolean,
    sort_order = (p->>'sort_order')::int,
    is_featured = (p->>'is_featured')::boolean,
    featured_order = (p->>'featured_order')::int,
    name_enabled = (p->>'name_enabled')::boolean,
    name_required = (p->>'name_required')::boolean,
    name_max_length = (p->>'name_max_length')::int,
    phone_enabled = (p->>'phone_enabled')::boolean,
    phone_required = (p->>'phone_required')::boolean,
    phone_max_length = (p->>'phone_max_length')::int,
    story_title = coalesce(p->>'story_title', ''),
    story_text = coalesce(p->>'story_text', ''),
    story_image_id = nullif(p->>'story_image_id', '')::uuid,
    seo_title = coalesce(p->>'seo_title', ''),
    seo_description = coalesce(p->>'seo_description', ''),
    published_at = case when v_status = 'published' then coalesce(published_at, now()) else published_at end
  where id = v_id;
  if not found then
    raise exception 'not_found';
  end if;

  -- Variantes (finitions)
  for r in select value from jsonb_array_elements(coalesce(p->'variants', '[]'::jsonb)) loop
    v_vid := null;
    if nullif(r->>'id', '') is not null then
      update public.product_variants set
        name = r->>'name',
        finish = coalesce(r->>'finish', ''),
        swatch = coalesce(r->>'swatch', ''),
        price_cents = nullif(r->>'price_cents', '')::int,
        stock_quantity = nullif(r->>'stock_quantity', '')::int,
        sku = coalesce(r->>'sku', ''),
        is_active = (r->>'is_active')::boolean,
        sort_order = (r->>'sort_order')::int
      where id = (r->>'id')::uuid and product_id = v_id
      returning id into v_vid;
      if v_vid is null then
        raise exception 'variant_not_found';
      end if;
    else
      insert into public.product_variants (product_id, name, finish, swatch, price_cents, stock_quantity, sku, is_active, sort_order)
      values (
        v_id, r->>'name', coalesce(r->>'finish', ''), coalesce(r->>'swatch', ''),
        nullif(r->>'price_cents', '')::int, nullif(r->>'stock_quantity', '')::int,
        coalesce(r->>'sku', ''), (r->>'is_active')::boolean, (r->>'sort_order')::int
      ) returning id into v_vid;
    end if;
    v_keep := v_keep || v_vid;
    v_map := v_map || jsonb_build_object(r->>'ref', v_vid::text);
  end loop;
  delete from public.product_variants where product_id = v_id and not (id = any (v_keep));

  -- Photos (ordre = ordre du tableau)
  delete from public.product_images where product_id = v_id;
  insert into public.product_images (product_id, media_id, variant_id, sort_order, alt_override)
  select v_id,
    (i.value->>'media_id')::uuid,
    nullif(v_map->>coalesce(i.value->>'variant_ref', ''), '')::uuid,
    (i.ord - 1)::int,
    coalesce(i.value->>'alt_override', '')
  from jsonb_array_elements(coalesce(p->'images', '[]'::jsonb)) with ordinality as i(value, ord);

  -- Collections (on conserve l'ordre déjà défini dans chaque collection)
  select coalesce(jsonb_object_agg(collection_id::text, sort_order), '{}'::jsonb)
    into v_old_coll from public.product_collections where product_id = v_id;
  delete from public.product_collections where product_id = v_id;
  insert into public.product_collections (product_id, collection_id, sort_order)
  select v_id, c.value::uuid,
    coalesce((v_old_coll->>c.value)::int,
      (select coalesce(max(pc.sort_order), 0) + 1 from public.product_collections pc where pc.collection_id = c.value::uuid))
  from jsonb_array_elements_text(coalesce(p->'collections', '[]'::jsonb)) as c(value);

  return v_id;
end;
$$;

create or replace function public.admin_duplicate_product(p_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_src public.products%rowtype;
  v_new uuid;
  v_slug text;
  v_n integer := 1;
  v_map jsonb := '{}'::jsonb;
  v_vid uuid;
  r record;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  select * into v_src from public.products where id = p_id;
  if not found then
    raise exception 'not_found';
  end if;

  v_slug := left(v_src.slug, 70) || '-copie';
  while exists (select 1 from public.products where slug = v_slug) loop
    v_n := v_n + 1;
    v_slug := left(v_src.slug, 70) || '-copie-' || v_n;
  end loop;

  insert into public.products (
    slug, name, short_description, description, status, base_price_cents, shape, size_label, material,
    dimensions, care_info, personalization_info, fabrication_delay, stock_mode, is_available, sort_order,
    is_featured, featured_order, name_enabled, name_required, name_max_length, phone_enabled, phone_required,
    phone_max_length, story_title, story_text, story_image_id, seo_title, seo_description
  ) values (
    v_slug, left(v_src.name || ' (copie)', 120), v_src.short_description, v_src.description, 'draft',
    v_src.base_price_cents, v_src.shape, v_src.size_label, v_src.material, v_src.dimensions, v_src.care_info,
    v_src.personalization_info, v_src.fabrication_delay, v_src.stock_mode, v_src.is_available,
    v_src.sort_order + 1, false, 0, v_src.name_enabled, v_src.name_required, v_src.name_max_length,
    v_src.phone_enabled, v_src.phone_required, v_src.phone_max_length, v_src.story_title, v_src.story_text,
    v_src.story_image_id, '', ''
  ) returning id into v_new;

  for r in select * from public.product_variants where product_id = p_id order by sort_order loop
    insert into public.product_variants (product_id, name, finish, swatch, price_cents, stock_quantity, sku, is_active, sort_order)
    values (v_new, r.name, r.finish, r.swatch, r.price_cents, r.stock_quantity, '', r.is_active, r.sort_order)
    returning id into v_vid;
    v_map := v_map || jsonb_build_object(r.id::text, v_vid::text);
  end loop;

  insert into public.product_images (product_id, media_id, variant_id, sort_order, alt_override)
  select v_new, media_id, nullif(v_map->>coalesce(variant_id::text, ''), '')::uuid, sort_order, alt_override
  from public.product_images where product_id = p_id;

  insert into public.product_collections (product_id, collection_id, sort_order)
  select v_new, collection_id, sort_order + 1 from public.product_collections where product_id = p_id;

  return v_new;
end;
$$;

revoke execute on function public.admin_save_product(jsonb) from public, anon;
revoke execute on function public.admin_duplicate_product(uuid) from public, anon;
grant execute on function public.admin_save_product(jsonb) to authenticated;
grant execute on function public.admin_duplicate_product(uuid) to authenticated;
