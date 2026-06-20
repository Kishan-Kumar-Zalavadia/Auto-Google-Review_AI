-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  plan text default 'trial' check (plan in ('trial','starter','growth','pro','agency')),
  trial_ends_at timestamptz default (now() + interval '30 days'),
  razorpay_sub_id text,
  created_at timestamptz default now()
);

-- Businesses table
create table businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  type text not null,
  city text not null,
  tone text default 'friendly' check (tone in ('friendly','professional','casual')),
  reply_language text default 'english' check (reply_language in ('english','hindi')),
  specialty text,
  contact_email text,
  notification_email text not null,
  auto_post_5star boolean default false,
  gbp_account_name text,
  gbp_location_name text,
  gbp_access_token text,
  gbp_refresh_token text,
  gbp_token_expiry timestamptz,
  created_at timestamptz default now()
);

-- Reviews table
create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  google_review_id text unique not null,
  reviewer_name text,
  star_rating integer check (star_rating between 1 and 5),
  comment text,
  review_time timestamptz,
  status text default 'pending' check (status in ('pending','approved','posted','skipped','flagged')),
  ai_draft text,
  final_reply text,
  posted_at timestamptz,
  created_at timestamptz default now() not null
);

-- RLS: enable on all tables
alter table users enable row level security;
alter table businesses enable row level security;
alter table reviews enable row level security;

-- RLS policies
create policy "users: own row only" on users
  for all using (auth.uid() = id);

create policy "businesses: own rows only" on businesses
  for all using (auth.uid() = user_id);

create policy "reviews: own business reviews only" on reviews
  for all using (
    business_id in (select id from businesses where user_id = auth.uid())
  );
