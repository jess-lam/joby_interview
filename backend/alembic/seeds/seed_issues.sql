-- Seed script to populate the issues table with dummy data

INSERT INTO issues (title, description, status, created_at, updated_at)
WITH issue_data AS (
    SELECT 
        -- Title from array of templates (20 options)
        (ARRAY[
            'Fix bug in authentication flow',
            'Add user profile feature',
            'Update API documentation',
            'Improve error handling',
            'Refactor database queries',
            'Implement search functionality',
            'Fix memory leak in service',
            'Add unit tests for module',
            'Optimize database indexes',
            'Update dependencies',
            'Fix CORS configuration',
            'Add logging middleware',
            'Implement rate limiting',
            'Fix date formatting issue',
            'Add input validation',
            'Improve error messages',
            'Update UI components',
            'Fix pagination bug',
            'Add caching layer',
            'Implement file upload'
        ])[floor(random() * 20 + 1)] AS title,
        
        -- Description from array of templates (10 options)
        (ARRAY[
            'This issue requires attention to fix a critical bug that affects user experience.',
            'We need to implement a new feature that will improve the overall functionality of the application.',
            'The current implementation has some performance issues that need to be addressed.',
            'This is a maintenance task to update and improve existing code.',
            'We need to add better error handling and validation for this component.',
            'The UI needs to be updated to match the new design requirements.',
            'This issue involves refactoring code to improve maintainability and readability.',
            'We need to add comprehensive tests to ensure code quality and reliability.',
            'This is a bug fix that addresses a specific issue reported by users.',
            'We need to optimize the database queries to improve response times.'
        ])[floor(random() * 10 + 1)] AS description,
        
        -- Status: 70% open, 30% closed
        (CASE WHEN random() < 0.7 THEN 'open' ELSE 'closed' END)::issue_status AS status,
        
        -- Created_at: random timestamp in past 60 days
        EXTRACT(EPOCH FROM (NOW() - (random() * interval '60 days')))::INTEGER AS created_at
        
    FROM generate_series(1, 100)
)
SELECT 
    title,
    description,
    status::issue_status,
    created_at,
    CASE 
        WHEN status = 'open' THEN 
            -- Open issue: updated_at is same or slightly after created_at (0-5 days)
            created_at + floor(random() * 5 * 24 * 60 * 60)::INTEGER
        ELSE 
            -- Closed issue: updated_at is 1-30 days after created_at
            created_at + floor((1 + random() * 29) * 24 * 60 * 60)::INTEGER
    END AS updated_at
FROM issue_data;
