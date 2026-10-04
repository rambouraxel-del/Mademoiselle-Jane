-- =====================================================================
-- Fonctions métier : commandes, stock, paiement, emails, anti-abus.
-- Elles sont exécutables uniquement avec la clé secrète (service_role),
-- jamais depuis le navigateur.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Création atomique d'une commande + réservation du stock limité
-- p_order : { subtotal_cents, shipping_cents, total_cents, shipping_zone_id,
--             shipping_zone_name, shipping_country }
-- p_items : [{ product_id, variant_id, product_name, product_slug, variant_name,
--              size_label, unit_price_cents, quantity, line_total_cents,
--              personalization, image_path, stock_limited }]
-- ---------------------------------------------------------------------
create or replace function public.create_order(p_order jsonb, p_items jsonb)
returns table (order_id uuid, public_token text, order_number text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_token text := encode(extensions.gen_random_bytes(24), 'hex');
  v_number text := 'MJ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
  v_reserved boolean := false;
  r record;
  v_updated integer;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_order';
  end if;

  insert into public.orders (
    order_number, public_token, subtotal_cents, shipping_cents, total_cents,
    shipping_zone_id, shipping_zone_name, shipping_country
  ) values (
    v_number, v_token,
    (p_order->>'subtotal_cents')::int,
    (p_order->>'shipping_cents')::int,
    (p_order->>'total_cents')::int,
    nullif(p_order->>'shipping_zone_id', '')::uuid,
    coalesce(p_order->>'shipping_zone_name', ''),
    coalesce(p_order->>'shipping_country', '')
  ) returning id into v_id;

  insert into public.order_items (
    order_id, product_id, variant_id, product_name, product_slug, variant_name, size_label,
    unit_price_cents, quantity, line_total_cents, personalization, image_path, stock_limited
  )
  select v_id,
    (i->>'product_id')::uuid,
    nullif(i->>'variant_id', '')::uuid,
    i->>'product_name',
    coalesce(i->>'product_slug', ''),
    coalesce(i->>'variant_name', ''),
    coalesce(i->>'size_label', ''),
    (i->>'unit_price_cents')::int,
    (i->>'quantity')::int,
    (i->>'line_total_cents')::int,
    coalesce(i->'personalization', '{}'::jsonb),
    i->>'image_path',
    coalesce((i->>'stock_limited')::boolean, false)
  from jsonb_array_elements(p_items) as i;

  -- Réservation du stock (quantités cumulées par variante)
  for r in
    select variant_id, sum(quantity)::int as qty
    from public.order_items
    where order_items.order_id = v_id and stock_limited and variant_id is not null
    group by variant_id
  loop
    update public.product_variants
      set stock_quantity = stock_quantity - r.qty
      where id = r.variant_id and stock_quantity is not null and stock_quantity >= r.qty;
    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'insufficient_stock:%', r.variant_id;
    end if;
    v_reserved := true;
  end loop;

  if v_reserved then
    update public.orders set stock_reserved = true where id = v_id;
  end if;

  return query select v_id, v_token, v_number;
end;
$$;

-- ---------------------------------------------------------------------
-- Remise en stock (une seule fois par commande)
-- ---------------------------------------------------------------------
create or replace function public.release_order_stock(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_claimed integer;
  r record;
begin
  update public.orders
    set stock_released = true
    where id = p_order_id and stock_reserved and not stock_released;
  get diagnostics v_claimed = row_count;
  if v_claimed = 0 then
    return false;
  end if;

  for r in
    select variant_id, sum(quantity)::int as qty
    from public.order_items
    where order_id = p_order_id and stock_limited and variant_id is not null
    group by variant_id
  loop
    update public.product_variants
      set stock_quantity = coalesce(stock_quantity, 0) + r.qty
      where id = r.variant_id;
  end loop;
  return true;
end;
$$;

-- ---------------------------------------------------------------------
-- Transitions de paiement (déclenchées uniquement par des événements
-- Stripe dont la signature a été vérifiée). Chaque fonction est
-- idempotente : rejouer un événement ne change rien.
-- ---------------------------------------------------------------------
create or replace function public.payment_checkout_completed(
  p_session_id text,
  p_payment_intent text,
  p_amount_total integer,
  p_is_paid boolean,
  p_customer jsonb
)
returns table (order_id uuid, payment_status public.payment_status, changed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_new public.payment_status;
begin
  select * into v_order from public.orders o where o.stripe_session_id = p_session_id for update;
  if not found then
    raise exception 'order_not_found';
  end if;

  if v_order.payment_status not in ('pending', 'processing') then
    return query select v_order.id, v_order.payment_status, false;
    return;
  end if;

  if p_is_paid then
    v_new := case when p_amount_total = v_order.total_cents then 'paid'::public.payment_status
                  else 'review'::public.payment_status end;
  else
    v_new := 'processing';
  end if;

  update public.orders o set
    payment_status = v_new,
    stripe_payment_intent_id = coalesce(p_payment_intent, o.stripe_payment_intent_id),
    amount_received_cents = case when p_is_paid then p_amount_total else o.amount_received_cents end,
    paid_at = case when v_new = 'paid' then now() else o.paid_at end,
    customer_email = coalesce(p_customer->>'email', o.customer_email),
    customer_name = coalesce(p_customer->>'name', o.customer_name),
    customer_phone = coalesce(p_customer->>'phone', o.customer_phone),
    shipping_address = coalesce(p_customer->'address', o.shipping_address),
    internal_note = case when v_new = 'review'
      then trim(o.internal_note || E'\n[Système] Montant reçu différent du total attendu : à vérifier dans Stripe.')
      else o.internal_note end
  where o.id = v_order.id;

  return query select v_order.id, v_new, true;
end;
$$;

create or replace function public.payment_async_succeeded(p_session_id text, p_amount_total integer)
returns table (order_id uuid, payment_status public.payment_status, changed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_new public.payment_status;
begin
  select * into v_order from public.orders o where o.stripe_session_id = p_session_id for update;
  if not found then
    raise exception 'order_not_found';
  end if;
  if v_order.payment_status not in ('pending', 'processing') then
    return query select v_order.id, v_order.payment_status, false;
    return;
  end if;
  v_new := case when p_amount_total = v_order.total_cents then 'paid'::public.payment_status
                else 'review'::public.payment_status end;
  update public.orders o set
    payment_status = v_new,
    amount_received_cents = p_amount_total,
    paid_at = case when v_new = 'paid' then now() else o.paid_at end
  where o.id = v_order.id;
  return query select v_order.id, v_new, true;
end;
$$;

-- Échec (paiement différé refusé) ou expiration : la commande est close
-- et le stock réservé est remis en vente.
create or replace function public.payment_closed(p_session_id text, p_status public.payment_status)
returns table (order_id uuid, payment_status public.payment_status, changed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  if p_status not in ('failed', 'expired', 'cancelled') then
    raise exception 'invalid_status';
  end if;
  select * into v_order from public.orders o where o.stripe_session_id = p_session_id for update;
  if not found then
    raise exception 'order_not_found';
  end if;
  if v_order.payment_status not in ('pending', 'processing') then
    return query select v_order.id, v_order.payment_status, false;
    return;
  end if;
  update public.orders o set payment_status = p_status where o.id = v_order.id;
  perform public.release_order_stock(v_order.id);
  return query select v_order.id, p_status, true;
end;
$$;

-- Session Stripe impossible à créer : on annule et on libère le stock
create or replace function public.cancel_unpaid_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.orders set payment_status = 'cancelled'
    where id = p_order_id and payment_status = 'pending';
  perform public.release_order_stock(p_order_id);
end;
$$;

create or replace function public.payment_refunded(p_payment_intent text, p_fully boolean)
returns table (order_id uuid, payment_status public.payment_status, changed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders o where o.stripe_payment_intent_id = p_payment_intent for update;
  if not found then
    return;
  end if;
  if not p_fully then
    update public.orders o set internal_note = trim(o.internal_note || E'\n[Système] Remboursement partiel constaté dans Stripe.')
      where o.id = v_order.id and position('Remboursement partiel' in o.internal_note) = 0;
    return query select v_order.id, v_order.payment_status, false;
    return;
  end if;
  if v_order.payment_status = 'refunded' then
    return query select v_order.id, v_order.payment_status, false;
    return;
  end if;
  update public.orders o set payment_status = 'refunded' where o.id = v_order.id;
  return query select v_order.id, 'refunded'::public.payment_status, true;
end;
$$;

-- ---------------------------------------------------------------------
-- Emails transactionnels : réservation d'envoi (anti-doublon)
-- Retourne true si l'appelant doit envoyer l'email.
-- Une réservation non confirmée expire après 10 minutes (nouvel essai).
-- ---------------------------------------------------------------------
create or replace function public.claim_order_email(p_order_id uuid, p_kind text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_kind = 'confirmation' then
    update public.orders set confirmation_email_claimed_at = now()
      where id = p_order_id
        and payment_status = 'paid'
        and customer_email is not null
        and confirmation_email_sent_at is null
        and (confirmation_email_claimed_at is null or confirmation_email_claimed_at < now() - interval '10 minutes');
  elsif p_kind = 'shipping' then
    update public.orders set shipping_email_claimed_at = now()
      where id = p_order_id
        and payment_status = 'paid'
        and fulfillment_status = 'shipped'
        and customer_email is not null
        and shipping_email_sent_at is null
        and (shipping_email_claimed_at is null or shipping_email_claimed_at < now() - interval '10 minutes');
  else
    raise exception 'invalid_kind';
  end if;
  get diagnostics v_count = row_count;
  return v_count = 1;
end;
$$;

create or replace function public.finish_order_email(p_order_id uuid, p_kind text, p_error text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_kind = 'confirmation' then
    if p_error is null then
      update public.orders set confirmation_email_sent_at = now(), last_email_error = null where id = p_order_id;
    else
      update public.orders set confirmation_email_claimed_at = null, last_email_error = left(p_error, 500) where id = p_order_id;
    end if;
  elsif p_kind = 'shipping' then
    if p_error is null then
      update public.orders set shipping_email_sent_at = now(), last_email_error = null where id = p_order_id;
    else
      update public.orders set shipping_email_claimed_at = null, last_email_error = left(p_error, 500) where id = p_order_id;
    end if;
  else
    raise exception 'invalid_kind';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- Limitation des tentatives : true = autorisé
-- ---------------------------------------------------------------------
create or replace function public.rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hits integer;
begin
  insert into public.rate_limits as rl (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case when rl.window_start < now() - make_interval(secs => p_window_seconds) then 1 else rl.hits + 1 end,
    window_start = case when rl.window_start < now() - make_interval(secs => p_window_seconds) then now() else rl.window_start end
  returning hits into v_hits;

  -- Nettoyage opportuniste des anciennes entrées
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return v_hits <= p_limit;
end;
$$;

-- ---------------------------------------------------------------------
-- Utilisation d'un média (empêche la suppression d'une image utilisée)
-- Exécutée avec les droits de l'appelant : réservée de fait aux admins.
-- ---------------------------------------------------------------------
create or replace function public.media_usage(p_media_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'products', (select count(distinct pi.product_id) from public.product_images pi where pi.media_id = p_media_id),
    'product_stories', (select count(*) from public.products p where p.story_image_id = p_media_id),
    'collections', (select count(*) from public.collections c where c.image_id = p_media_id),
    'settings', (select coalesce(jsonb_agg(s.key), '[]'::jsonb) from public.site_settings s where strpos(s.value::text, p_media_id::text) > 0)
  );
$$;

-- ---------------------------------------------------------------------
-- Droits d'exécution
-- ---------------------------------------------------------------------
revoke execute on function public.create_order(jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.release_order_stock(uuid) from public, anon, authenticated;
revoke execute on function public.payment_checkout_completed(text, text, integer, boolean, jsonb) from public, anon, authenticated;
revoke execute on function public.payment_async_succeeded(text, integer) from public, anon, authenticated;
revoke execute on function public.payment_closed(text, public.payment_status) from public, anon, authenticated;
revoke execute on function public.cancel_unpaid_order(uuid) from public, anon, authenticated;
revoke execute on function public.payment_refunded(text, boolean) from public, anon, authenticated;
revoke execute on function public.claim_order_email(uuid, text) from public, anon, authenticated;
revoke execute on function public.finish_order_email(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.media_usage(uuid) from public, anon;

grant execute on function public.create_order(jsonb, jsonb) to service_role;
grant execute on function public.release_order_stock(uuid) to service_role;
grant execute on function public.payment_checkout_completed(text, text, integer, boolean, jsonb) to service_role;
grant execute on function public.payment_async_succeeded(text, integer) to service_role;
grant execute on function public.payment_closed(text, public.payment_status) to service_role;
grant execute on function public.cancel_unpaid_order(uuid) to service_role;
grant execute on function public.payment_refunded(text, boolean) to service_role;
grant execute on function public.claim_order_email(uuid, text) to service_role;
grant execute on function public.finish_order_email(uuid, text, text) to service_role;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
grant execute on function public.media_usage(uuid) to authenticated, service_role;
