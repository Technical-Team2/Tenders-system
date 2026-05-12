-- Migration: Update tenders table to support full tender data model
-- This migration adds missing fields to support the scraping pipeline

-- Add new columns to tenders table
ALTER TABLE tenders 
ADD COLUMN IF NOT EXISTS categories TEXT[],
ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS requirements TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reference TEXT,
ADD COLUMN IF NOT EXISTS source_name TEXT,
ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS score NUMERIC DEFAULT 0.5;

-- Update scrape_logs table to match pipeline expectations
ALTER TABLE scrape_logs
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS source_name TEXT,
ADD COLUMN IF NOT EXISTS strategy_used TEXT,
ADD COLUMN IF NOT EXISTS processing_time BIGINT,
ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMPTZ DEFAULT now(),
DROP COLUMN IF EXISTS run_time;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_tenders_priority ON tenders(priority);
CREATE INDEX IF NOT EXISTS idx_tenders_score ON tenders(score);
CREATE INDEX IF NOT EXISTS idx_scrape_logs_source_url ON scrape_logs(source_url);

-- Add comments for documentation
COMMENT ON COLUMN tenders.categories IS 'Array of tender categories/tags';
COMMENT ON COLUMN tenders.contact_info IS 'Contact information as JSON object';
COMMENT ON COLUMN tenders.documents IS 'Array of tender document URLs/metadata';
COMMENT ON COLUMN tenders.requirements IS 'Text field for tender requirements';
COMMENT ON COLUMN tenders.metadata IS 'Additional metadata as JSON object';
COMMENT ON COLUMN tenders.reference IS 'Tender reference number';
COMMENT ON COLUMN tenders.source_name IS 'Name of the tender source';
COMMENT ON COLUMN tenders.scraped_at IS 'Timestamp when tender was scraped';
COMMENT ON COLUMN tenders.priority IS 'Priority level: high|medium|low';
COMMENT ON COLUMN tenders.score IS 'AI-calculated relevance score (0-1)';
