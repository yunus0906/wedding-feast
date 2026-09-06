-- wedding-feast Supabase schema
-- 在 Supabase SQL Editor 中执行本文件即可创建 MVP 所需数据表、约束、索引和注释。

create extension if not exists "pgcrypto";

create table if not exists public.weddings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.weddings is '婚礼主表，保存一个婚礼项目的基础信息。';
comment on column public.weddings.id is '婚礼 ID，作为所有宾客、桌子、布局数据的归属主键。';
comment on column public.weddings.name is '婚礼名称。';
comment on column public.weddings.created_at is '婚礼记录创建时间。';
comment on column public.weddings.updated_at is '婚礼记录最后更新时间。';

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  category text not null,
  side text not null,
  phone text,
  companions text not null default '',
  children_count integer not null default 0,
  relation_tag text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guests_category_check check (category in ('亲戚', '好友', '同学')),
  constraint guests_side_check check (side in ('groom', 'bride')),
  constraint guests_children_count_check check (children_count >= 0)
);

comment on table public.guests is '宾客名单表，保存婚礼宾客基础资料。';
comment on column public.guests.id is '宾客 ID。';
comment on column public.guests.wedding_id is '所属婚礼 ID。';
comment on column public.guests.name is '宾客姓名。';
comment on column public.guests.category is '宾客分类，下拉选项：亲戚、好友、同学。';
comment on column public.guests.side is '宾客所属方，groom 表示男方，bride 表示女方。';
comment on column public.guests.phone is '联系电话，可为空。';
comment on column public.guests.companions is '同行人姓名列表，使用英文逗号分隔。';
comment on column public.guests.children_count is '儿童人数。';
comment on column public.guests.relation_tag is '关系标签，用于宾客聚类，使用英文逗号分隔。';
comment on column public.guests.note is '宾客备注。';
comment on column public.guests.created_at is '宾客记录创建时间。';
comment on column public.guests.updated_at is '宾客记录最后更新时间。';

create table if not exists public.wedding_tables (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  capacity integer not null default 10,
  x numeric not null default 180,
  y numeric not null default 180,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wedding_tables_capacity_check check (capacity between 6 and 12)
);

comment on table public.wedding_tables is '婚宴桌子表，保存每张桌子的名称、容量和画布位置。';
comment on column public.wedding_tables.id is '桌子 ID。';
comment on column public.wedding_tables.wedding_id is '所属婚礼 ID。';
comment on column public.wedding_tables.name is '桌子名称，例如 1号桌。';
comment on column public.wedding_tables.capacity is '桌子容量，MVP 限制为 6 至 12 人。';
comment on column public.wedding_tables.x is '桌子在画布中的 X 坐标。';
comment on column public.wedding_tables.y is '桌子在画布中的 Y 坐标。';
comment on column public.wedding_tables.created_at is '桌子记录创建时间。';
comment on column public.wedding_tables.updated_at is '桌子记录最后更新时间。';

create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  table_id uuid not null references public.wedding_tables(id) on delete cascade,
  seat_index integer not null,
  role text not null default 'regular',
  created_at timestamptz not null default now(),
  constraint seats_role_check check (role in ('regular', 'host', 'cohost')),
  constraint seats_seat_index_check check (seat_index >= 0),
  constraint seats_guest_unique unique (guest_id),
  constraint seats_table_index_unique unique (table_id, seat_index)
);

comment on table public.seats is '座位分配表，保存宾客所在桌、座位序号和主陪/副陪身份。';
comment on column public.seats.id is '座位分配 ID。';
comment on column public.seats.guest_id is '已入座宾客 ID，一个宾客最多只有一个座位。';
comment on column public.seats.table_id is '所在桌子 ID。';
comment on column public.seats.seat_index is '座位序号，从 0 开始。';
comment on column public.seats.role is '座位身份：regular 普通，host 主陪，cohost 副陪。';
comment on column public.seats.created_at is '座位分配创建时间。';

create table if not exists public.layout_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  type text not null,
  x numeric not null default 0,
  y numeric not null default 0,
  width numeric not null default 160,
  height numeric not null default 80,
  rotation numeric not null default 0,
  config jsonb not null default '{}'::jsonb,
  constraint layout_items_type_check check (type in ('stage', 't_stage'))
);

comment on table public.layout_items is '婚宴现场布局元素表，保存舞台和 T 型台等非桌子元素。';
comment on column public.layout_items.id is '布局元素 ID。';
comment on column public.layout_items.wedding_id is '所属婚礼 ID。';
comment on column public.layout_items.type is '布局元素类型：stage 舞台，t_stage T 型台。';
comment on column public.layout_items.x is '布局元素在画布中的 X 坐标。';
comment on column public.layout_items.y is '布局元素在画布中的 Y 坐标。';
comment on column public.layout_items.width is '布局元素宽度。';
comment on column public.layout_items.height is '布局元素高度。';
comment on column public.layout_items.rotation is '布局元素旋转角度。';
comment on column public.layout_items.config is '布局元素扩展配置，预留给后续样式和行为参数。';

create index if not exists guests_wedding_id_idx on public.guests(wedding_id);
create index if not exists wedding_tables_wedding_id_idx on public.wedding_tables(wedding_id);
create index if not exists seats_guest_id_idx on public.seats(guest_id);
create index if not exists seats_table_id_idx on public.seats(table_id);
create unique index if not exists seats_one_host_per_table_idx on public.seats(table_id) where role = 'host';
create unique index if not exists seats_one_cohost_per_table_idx on public.seats(table_id) where role = 'cohost';
create index if not exists layout_items_wedding_id_idx on public.layout_items(wedding_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is '通用更新时间触发器函数，在记录更新时自动刷新 updated_at。';

drop trigger if exists weddings_set_updated_at on public.weddings;
create trigger weddings_set_updated_at
before update on public.weddings
for each row execute function public.set_updated_at();

drop trigger if exists guests_set_updated_at on public.guests;
create trigger guests_set_updated_at
before update on public.guests
for each row execute function public.set_updated_at();

drop trigger if exists wedding_tables_set_updated_at on public.wedding_tables;
create trigger wedding_tables_set_updated_at
before update on public.wedding_tables
for each row execute function public.set_updated_at();

insert into public.weddings (id, name)
values ('00000000-0000-4000-8000-000000000001', 'Wedding Feast')
on conflict (id) do nothing;
