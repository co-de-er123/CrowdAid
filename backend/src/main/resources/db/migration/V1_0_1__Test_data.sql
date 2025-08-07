-- Insert test users (passwords are hashed 'password123')
INSERT IGNORE INTO users (id, name, username, email, password, phone, address, latitude, longitude, is_available, created_at, updated_at) VALUES
(1, 'Admin User', 'admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1234567890', '123 Admin St, Admin City', 40.7128, -74.0060, TRUE, NOW(), NOW()),
(2, 'John Doe', 'johndoe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1234567891', '456 User St, User City', 40.7129, -74.0070, TRUE, NOW(), NOW()),
(3, 'Jane Smith', 'janesmith', 'jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1234567892', '789 Volunteer Ave, Volunteer City', 40.7130, -74.0080, TRUE, NOW(), NOW()),
(4, 'Bob Johnson', 'bobjohnson', 'bob@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1234567893', '321 Helper Blvd, Helper Town', 40.7131, -74.0090, FALSE, NOW(), NOW());

-- Assign roles to users
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES
(1, 3), -- Admin user with ROLE_ADMIN
(2, 1), -- Regular user with ROLE_USER
(3, 2), -- Volunteer with ROLE_VOLUNTEER
(4, 1), -- Another regular user with ROLE_USER
(4, 2); -- Also a volunteer with ROLE_VOLUNTEER

-- Insert test help requests
INSERT IGNORE INTO help_requests (id, description, status, address, latitude, longitude, requester_id, volunteer_id, created_at, updated_at) VALUES
(1, 'Need help with groceries', 'PENDING', '123 Main St, New York, NY', 40.7130, -74.0060, 2, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 'Medical supplies needed', 'ACCEPTED', '456 Park Ave, New York, NY', 40.7140, -74.0070, 2, 3, DATE_SUB(NOW(), INTERVAL 1 HOUR), NOW()),
(3, 'Elderly care assistance', 'PENDING', '789 Broadway, New York, NY', 40.7150, -74.0080, 4, NULL, NOW(), NOW()),
(4, 'Food delivery needed', 'IN_PROGRESS', '321 5th Ave, New York, NY', 40.7160, -74.0090, 4, 3, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NOW());

-- Insert test messages
INSERT IGNORE INTO messages (content, is_read, sender_id, help_request_id, created_at, updated_at) VALUES
('Hello, I need help with groceries', TRUE, 2, 1, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('I can help with that!', TRUE, 3, 1, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('Great! When can you come?', FALSE, 2, 1, DATE_SUB(NOW(), INTERVAL 50 MINUTE), DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
('I need medical supplies urgently', TRUE, 2, 2, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('I can bring them to you', TRUE, 3, 2, DATE_SUB(NOW(), INTERVAL 55 MINUTE), DATE_SUB(NOW(), INTERVAL 55 MINUTE)),
('Thank you so much!', TRUE, 2, 2, DATE_SUB(NOW(), INTERVAL 50 MINUTE), DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
('I need help with my grandmother', FALSE, 4, 3, NOW(), NOW());

-- Create a view for active help requests
CREATE OR REPLACE VIEW vw_active_help_requests AS
SELECT 
    hr.*,
    u1.name AS requester_name,
    u1.phone AS requester_phone,
    u1.email AS requester_email,
    u2.name AS volunteer_name,
    u2.phone AS volunteer_phone,
    u2.email AS volunteer_email
FROM 
    help_requests hr
JOIN 
    users u1 ON hr.requester_id = u1.id
LEFT JOIN 
    users u2 ON hr.volunteer_id = u2.id
WHERE 
    hr.status IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS');

-- Create a view for user conversations
CREATE OR REPLACE VIEW vw_user_conversations AS
SELECT 
    m.help_request_id,
    hr.description AS help_request_description,
    hr.status AS help_request_status,
    m.sender_id,
    u1.name AS sender_name,
    m.content AS last_message,
    m.created_at AS last_message_at,
    m.is_read,
    CASE 
        WHEN hr.requester_id = m.sender_id THEN hr.volunteer_id
        ELSE hr.requester_id
    END AS other_user_id,
    CASE 
        WHEN hr.requester_id = m.sender_id THEN u2.name
        ELSE u3.name
    END AS other_user_name
FROM 
    messages m
JOIN 
    help_requests hr ON m.help_request_id = hr.id
JOIN 
    users u1 ON m.sender_id = u1.id
LEFT JOIN 
    users u2 ON hr.volunteer_id = u2.id
LEFT JOIN 
    users u3 ON hr.requester_id = u3.id AND hr.requester_id != m.sender_id
WHERE 
    m.id IN (
        SELECT MAX(id) 
        FROM messages 
        GROUP BY help_request_id
    )
ORDER BY 
    m.created_at DESC;
