-- DJDN accounts and orders. Run once in the Supabase dashboard:
-- SQL Editor > New query > paste this file > Run.
--
-- Customers sign in with Google or an email link (Supabase Auth). Guests can
-- check out too, so an order's user_id is optional; the email on the order is
-- what ties a guest order to an account later.
--
-- Customers can only READ their own orders. Everything that writes (creating
-- an order, marking it paid from the Flutterwave webhook, moving it from
-- processing to dispatched) happens on the server with the service-role key,
-- which bypasses row level security. Guest "Track order" lookups run on the
-- server the same way, matching order number and email.

create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type fulfilment_status as enum (
  'awaiting_payment', 'processing', 'dispatched', 'delivered', 'cancelled'
);

create sequence order_number_seq start 1001;

create table orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique
    default ('DJDN-' || nextval('order_number_seq')),
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  customer_name text not null,
  phone text,
  shipping_address jsonb not null,
  subtotal integer not null,        -- kobo (same as the catalogue prices)
  shipping_fee integer not null default 0,
  total integer not null,
  currency text not null default 'NGN',
  payment_status payment_status not null default 'pending',
  fulfilment_status fulfilment_status not null default 'awaiting_payment',
  flw_tx_ref text unique,           -- our reference sent to Flutterwave
  flw_transaction_id text,          -- Flutterwave's id, set by the webhook
  tracking_note text,               -- courier name / waybill, shown to the customer
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_slug text not null,
  name text not null,
  colour text not null,
  size text not null,
  unit_price integer not null,      -- kobo, as charged
  qty integer not null check (qty > 0)
);

-- One row per status change; this is the timeline the customer sees.
create table order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  label text not null,              -- "Payment received", "Dispatched", ...
  note text,
  created_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  line1 text not null,
  city text not null,
  state text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on orders (user_id);
create index orders_email_idx on orders (lower(email));
create index order_items_order_id_idx on order_items (order_id);
create index order_events_order_id_idx on order_events (order_id);
create index addresses_user_id_idx on addresses (user_id);

create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_events enable row level security;
alter table addresses enable row level security;

create policy "own orders" on orders
  for select using (user_id = auth.uid());

create policy "own order items" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

create policy "own order events" on order_events
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_events.order_id and orders.user_id = auth.uid()
    )
  );

create policy "own addresses" on addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
