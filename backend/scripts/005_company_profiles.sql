-- Create Company Info table
create table if not exists company_info (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  tagline text,
  description text,
  about text,
  industry text,
  business_category text,
  business_type text,
  intelligence_summary text,
  contacts jsonb default '{}',
  social_links jsonb default '{}',
  services text[] default '{}',
  products text[] default '{}',
  technologies text[] default '{}',
  branch_locations text[] default '{}',
  registration_numbers text[] default '{}',
  value_propositions text[] default '{}',
  target_customers text[] default '{}',
  company_positioning text[] default '{}',
  operational_capabilities text[] default '{}',
  automation_capabilities text[] default '{}',
  integrations text[] default '{}',
  keywords text[] default '{}',
  team text[] default '{}',
  digital_presence jsonb default '{}',
  og_data jsonb default '{}',
  schema_org jsonb default '{}',
  year_founded text,
  company_size text,
  headquarters text,
  raw_data jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add unique constraint on website to avoid duplicates
alter table company_info drop constraint if exists unique_website_info;
alter table company_info add constraint unique_website_info unique (website);

-- Create index for performance
create index if not exists idx_company_info_name on company_info(name);
create index if not exists idx_company_info_industry on company_info(industry);
create index if not exists idx_company_info_website on company_info(website);
