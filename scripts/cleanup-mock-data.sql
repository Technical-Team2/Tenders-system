-- Clean up all mock data from database for production deployment

-- Delete mock tenders (those with example URLs or test data)
DELETE FROM tenders 
WHERE source_url LIKE '%example-%' 
   OR title LIKE '%Government Infrastructure Project%'
   OR title LIKE '%Healthcare IT Services%'
   OR description LIKE '%mock%'
   OR description LIKE '%test%'
   OR created_at < NOW() - INTERVAL '1 day';

-- Delete mock applications
DELETE FROM applications 
WHERE tender_id NOT IN (SELECT id FROM tenders)
   OR created_at < NOW() - INTERVAL '1 day';

-- Delete mock tender scores
DELETE FROM tender_scores 
WHERE tender_id NOT IN (SELECT id FROM tenders)
   OR created_at < NOW() - INTERVAL '1 day';

-- Delete mock extracted details
DELETE FROM extracted_details 
WHERE tender_id NOT IN (SELECT id FROM tenders)
   OR created_at < NOW() - INTERVAL '1 day';

-- Delete mock scrape logs
DELETE FROM scrape_logs 
WHERE source_url LIKE '%example-%'
   OR message LIKE '%mock%'
   OR message LIKE '%test%'
   OR created_at < NOW() - INTERVAL '7 days';

-- Delete mock tender sources
DELETE FROM tender_sources 
WHERE url LIKE '%example-%'
   OR name LIKE '%test%'
   OR created_at < NOW() - INTERVAL '1 day';

-- Reset auto-increment sequences
ALTER SEQUENCE tenders_id_seq RESTART WITH 1;
ALTER SEQUENCE applications_id_seq RESTART WITH 1;
ALTER SEQUENCE tender_scores_id_seq RESTART WITH 1;
ALTER SEQUENCE extracted_details_id_seq RESTART WITH 1;
ALTER SEQUENCE scrape_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE tender_sources_id_seq RESTART WITH 1;

-- Vacuum and analyze tables for performance
VACUUM FULL tenders;
VACUUM FULL applications;
VACUUM FULL tender_scores;
VACUUM FULL extracted_details;
VACUUM FULL scrape_logs;
VACUUM FULL tender_sources;

ANALYZE tenders;
ANALYZE applications;
ANALYZE tender_scores;
ANALYZE extracted_details;
ANALYZE scrape_logs;
ANALYZE tender_sources;

-- Insert initial production-ready tender sources (if needed)
INSERT INTO tender_sources (name, url, description, active, created_at, updated_at) VALUES
('Tanzania Public Procurement Portal', 'https://procurementportal.go.tz/', 'Official Tanzania Government Procurement Portal', true, NOW(), NOW()),
('Public Works Department', 'https://www.pw.go.tz/', 'Tanzania Public Works Department Tenders', true, NOW(), NOW()),
('Ministry of Health', 'https://www.moh.go.tz/', 'Tanzania Ministry of Health Tenders', true, NOW(), NOW())
ON CONFLICT (url) DO UPDATE SET
  active = EXCLUDED.active,
  updated_at = NOW();

COMMIT;
