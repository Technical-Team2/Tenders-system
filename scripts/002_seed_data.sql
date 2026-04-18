-- Seed tender sources
INSERT INTO tender_sources (name, base_url, type, is_active) VALUES
('SAM.gov', 'https://sam.gov', 'api', true),
('TED Europa', 'https://ted.europa.eu', 'html', true),
('GeBIZ Singapore', 'https://www.gebiz.gov.sg', 'html', true),
('Contracts Finder UK', 'https://www.contractsfinder.service.gov.uk', 'html', true),
('AusTender', 'https://www.tenders.gov.au', 'html', true),
('MyGov Kenya', 'https://tenders.go.ke', 'html', true);

-- Seed tenders
INSERT INTO tenders (title, description, organization, sector, location, deadline, budget, currency, source_id, source_url, status) VALUES
('Cloud Infrastructure Modernization Services', 'The Department of Defense seeks qualified contractors to provide comprehensive cloud infrastructure modernization services including migration, security implementation, and ongoing managed services for critical defense systems.', 'Department of Defense', 'IT Services', 'Washington, DC', '2024-03-15 17:00:00+00', 15000000.00, 'USD', (SELECT id FROM tender_sources WHERE name = 'SAM.gov'), 'https://sam.gov/opp/abc123', 'new'),
('Cybersecurity Assessment and Remediation', 'Comprehensive cybersecurity assessment services including vulnerability scanning, penetration testing, and remediation planning for federal agency networks.', 'Department of Homeland Security', 'Cybersecurity', 'Arlington, VA', '2024-04-01 17:00:00+00', 8500000.00, 'USD', (SELECT id FROM tender_sources WHERE name = 'SAM.gov'), 'https://sam.gov/opp/def456', 'reviewed'),
('Smart City IoT Platform Development', 'Design and implementation of a city-wide IoT platform for traffic management, environmental monitoring, and public safety systems integration.', 'City of Amsterdam', 'Smart Cities', 'Amsterdam, Netherlands', '2024-02-28 12:00:00+00', 12000000.00, 'EUR', (SELECT id FROM tender_sources WHERE name = 'TED Europa'), 'https://ted.europa.eu/udl?uri=xyz', 'new'),
('Healthcare Data Analytics Platform', 'Development of an AI-powered healthcare analytics platform for predictive patient care and resource optimization across regional hospitals.', 'NHS Digital', 'Healthcare IT', 'London, UK', '2024-03-20 16:00:00+00', 9500000.00, 'GBP', (SELECT id FROM tender_sources WHERE name = 'TED Europa'), 'https://ted.europa.eu/udl?uri=abc', 'applied'),
('National Digital Identity Infrastructure', 'Implementation of next-generation digital identity verification and authentication infrastructure for government services.', 'GovTech Singapore', 'Digital Identity', 'Singapore', '2024-04-15 18:00:00+00', 25000000.00, 'SGD', (SELECT id FROM tender_sources WHERE name = 'GeBIZ Singapore'), 'https://www.gebiz.gov.sg/ptn/xyz', 'new'),
('AI-Powered Document Processing System', 'Procurement of an intelligent document processing solution utilizing machine learning for automated classification, extraction, and workflow management.', 'HM Revenue & Customs', 'AI/ML', 'Manchester, UK', '2024-02-25 23:59:00+00', 4200000.00, 'GBP', (SELECT id FROM tender_sources WHERE name = 'Contracts Finder UK'), 'https://www.contractsfinder.service.gov.uk/abc', 'reviewed'),
('Renewable Energy Management System', 'Development of a comprehensive renewable energy management and grid optimization platform for national energy infrastructure.', 'Department of Climate Change', 'Energy', 'Canberra, Australia', '2024-05-01 17:00:00+00', 18000000.00, 'AUD', (SELECT id FROM tender_sources WHERE name = 'AusTender'), 'https://www.tenders.gov.au/xyz', 'new'),
('Legacy System Migration Services', 'Migration of legacy mainframe applications to modern cloud-native architecture for improved scalability and maintainability.', 'Department of Veterans Affairs', 'IT Modernization', 'Washington, DC', '2024-01-15 17:00:00+00', 6800000.00, 'USD', (SELECT id FROM tender_sources WHERE name = 'SAM.gov'), 'https://sam.gov/opp/legacy', 'ignored'),
('Road Construction Project - Phase 2', 'Construction of 50km highway connecting Nairobi to Mombasa with modern infrastructure and toll systems.', 'Kenya National Highways Authority', 'Construction', 'Nairobi, Kenya', '2024-06-01 17:00:00+00', 850000000.00, 'KES', (SELECT id FROM tender_sources WHERE name = 'MyGov Kenya'), 'https://tenders.go.ke/road-2024', 'new'),
('Supply of Medical Equipment', 'Procurement of advanced medical diagnostic equipment for county referral hospitals including MRI, CT scanners, and laboratory equipment.', 'Ministry of Health Kenya', 'Healthcare', 'Nairobi, Kenya', '2024-04-30 17:00:00+00', 120000000.00, 'KES', (SELECT id FROM tender_sources WHERE name = 'MyGov Kenya'), 'https://tenders.go.ke/medical-2024', 'new');

-- Add scores for tenders
INSERT INTO tender_scores (tender_id, score, breakdown) VALUES
((SELECT id FROM tenders WHERE title = 'Cloud Infrastructure Modernization Services'), 92, '{"relevance": 95, "budget_fit": 90, "timeline": 88, "competition": 75, "win_probability": 78}'),
((SELECT id FROM tenders WHERE title = 'Cybersecurity Assessment and Remediation'), 88, '{"relevance": 90, "budget_fit": 85, "timeline": 92, "competition": 70, "win_probability": 65}'),
((SELECT id FROM tenders WHERE title = 'Smart City IoT Platform Development'), 75, '{"relevance": 72, "budget_fit": 80, "timeline": 70, "competition": 60, "win_probability": 45}'),
((SELECT id FROM tenders WHERE title = 'Healthcare Data Analytics Platform'), 85, '{"relevance": 88, "budget_fit": 82, "timeline": 85, "competition": 72, "win_probability": 70}'),
((SELECT id FROM tenders WHERE title = 'National Digital Identity Infrastructure'), 70, '{"relevance": 68, "budget_fit": 75, "timeline": 65, "competition": 55, "win_probability": 40}'),
((SELECT id FROM tenders WHERE title = 'AI-Powered Document Processing System'), 95, '{"relevance": 98, "budget_fit": 95, "timeline": 90, "competition": 85, "win_probability": 82}'),
((SELECT id FROM tenders WHERE title = 'Renewable Energy Management System'), 65, '{"relevance": 60, "budget_fit": 70, "timeline": 68, "competition": 50, "win_probability": 35}'),
((SELECT id FROM tenders WHERE title = 'Road Construction Project - Phase 2'), 45, '{"relevance": 40, "budget_fit": 50, "timeline": 45, "competition": 30, "win_probability": 20}'),
((SELECT id FROM tenders WHERE title = 'Supply of Medical Equipment'), 78, '{"relevance": 80, "budget_fit": 75, "timeline": 82, "competition": 65, "win_probability": 55}');

-- Add extracted details for some tenders
INSERT INTO extracted_details (tender_id, eligibility, requirements, submission_method, contact_info, raw_text) VALUES
((SELECT id FROM tenders WHERE title = 'Cloud Infrastructure Modernization Services'), 
 'FedRAMP High authorization required. Minimum 5 years cloud migration experience. CMMC Level 3 certification.',
 'Active Top Secret facility clearance. Prior DoD contract experience. ISO 27001 certification. 24/7 support capability.',
 'Submit via SAM.gov portal. Technical Volume (50 pages max), Past Performance Volume, Price Volume required.',
 '{"name": "John Smith", "email": "john.smith@dod.gov", "phone": "+1-703-555-0123"}',
 'Full tender document text would be stored here...'),
((SELECT id FROM tenders WHERE title = 'AI-Powered Document Processing System'),
 'UK data residency capability required. Prior government AI implementations. G-Cloud framework supplier.',
 'Integration with existing HMRC systems. Processing 10M+ documents annually. 99.9% accuracy requirement. GDPR compliance.',
 'Submit via Digital Marketplace. Technical Proposal, Pricing Schedule, Case Studies (3 minimum) required.',
 '{"name": "Sarah Johnson", "email": "procurement@hmrc.gov.uk"}',
 'Full tender document text would be stored here...');

-- Add applications
INSERT INTO applications (tender_id, status, notes, documents, submitted_at) VALUES
((SELECT id FROM tenders WHERE title = 'Cloud Infrastructure Modernization Services'), 'draft', 'Technical approach draft complete. Awaiting SME review. Team assigned: David Chen (lead), Sarah Miller.', '["technical_approach_v2.docx", "past_performance_matrix.xlsx"]', NULL),
((SELECT id FROM tenders WHERE title = 'AI-Powered Document Processing System'), 'draft', 'Initial compliance matrix started. Need to schedule client demo. Deadline approaching fast.', '["compliance_matrix_draft.xlsx"]', NULL),
((SELECT id FROM tenders WHERE title = 'Healthcare Data Analytics Platform'), 'submitted', 'Submitted on 2024-02-01. Awaiting evaluation outcome. Strong proposal with NHS case studies.', '["final_proposal.pdf", "pricing.xlsx", "team_cvs.pdf"]', '2024-02-01 10:00:00+00'),
((SELECT id FROM tenders WHERE title = 'Legacy System Migration Services'), 'draft', 'Decided not to pursue - outside core competencies.', '[]', NULL);

-- Add scrape logs
INSERT INTO scrape_logs (source_id, run_time, records_found, status, error) VALUES
((SELECT id FROM tender_sources WHERE name = 'SAM.gov'), now() - interval '2 hours', 156, 'success', NULL),
((SELECT id FROM tender_sources WHERE name = 'TED Europa'), now() - interval '3 hours', 89, 'success', NULL),
((SELECT id FROM tender_sources WHERE name = 'GeBIZ Singapore'), now() - interval '4 hours', 34, 'success', NULL),
((SELECT id FROM tender_sources WHERE name = 'Contracts Finder UK'), now() - interval '5 hours', 0, 'failed', 'Connection timeout after 45 seconds'),
((SELECT id FROM tender_sources WHERE name = 'AusTender'), now() - interval '6 hours', 67, 'success', NULL),
((SELECT id FROM tender_sources WHERE name = 'MyGov Kenya'), now() - interval '1 hour', 42, 'success', NULL);
