-- Tender Intelligence System Database Schema

-- 1. Tender Sources
create table if not exists tender_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_url text not null,
  type text default 'html', -- html | api | login
  is_active boolean default true,
  last_scraped_at timestamptz,
  created_at timestamptz default now()
);

-- 2. Tenders
create table if not exists tenders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  organization text,
  sector text,
  location text,
  deadline timestamptz,
  budget numeric,
  currency text default 'KES',
  source_id uuid references tender_sources(id),
  source_url text,
  status text default 'new', -- new | reviewed | applied | ignored
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(title, source_url)
);

-- 3. Tender Scores
create table if not exists tender_scores (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references tenders(id) on delete cascade,
  score numeric default 0,
  breakdown jsonb,
  created_at timestamptz default now()
);

-- 4. Extracted Details
create table if not exists extracted_details (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references tenders(id) on delete cascade,
  eligibility text,
  requirements text,
  submission_method text,
  contact_info jsonb,
  raw_text text
);

-- 5. Applications
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references tenders(id) on delete cascade,
  status text default 'draft', -- draft | submitted | rejected | awarded
  notes text,
  documents jsonb,
  submitted_at timestamptz,
  created_at timestamptz default now()
);

-- 6. Scrape Logs
create table if not exists scrape_logs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references tender_sources(id),
  run_time timestamptz default now(),
  records_found integer default 0,
  status text, -- success | failed
  error text
);

-- Create indexes for better performance
create index if not exists idx_tenders_status on tenders(status);
create index if not exists idx_tenders_sector on tenders(sector);
create index if not exists idx_tenders_deadline on tenders(deadline);
create index if not exists idx_tender_scores_tender_id on tender_scores(tender_id);
create index if not exists idx_applications_status on applications(status);
create index if not exists idx_scrape_logs_source_id on scrape_logs(source_id);
