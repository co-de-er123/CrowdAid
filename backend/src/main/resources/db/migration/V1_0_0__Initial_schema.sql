-- Create the roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_available BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create the user_roles join table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role_id FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create the help_requests table
CREATE TABLE IF NOT EXISTS help_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    requester_id BIGINT NOT NULL,
    volunteer_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_help_requests_requester_id FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_help_requests_volunteer_id FOREIGN KEY (volunteer_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create the messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sender_id BIGINT NOT NULL,
    help_request_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_sender_id FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_help_request_id FOREIGN KEY (help_request_id) REFERENCES help_requests (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better query performance
CREATE INDEX idx_help_requests_status ON help_requests(status);
CREATE INDEX idx_help_requests_requester_id ON help_requests(requester_id);
CREATE INDEX idx_help_requests_volunteer_id ON help_requests(volunteer_id);
CREATE INDEX idx_messages_help_request_id ON messages(help_request_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Create a spatial index for location-based queries (requires MySQL 5.7.6+)
-- ALTER TABLE help_requests ADD SPATIAL INDEX idx_help_requests_location (latitude, longitude);

-- Insert default roles
INSERT IGNORE INTO roles (name) VALUES ('ROLE_USER');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_VOLUNTEER');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN');

-- Create a function to calculate distance between two points (in kilometers)
DELIMITER //
CREATE FUNCTION calculate_distance(lat1 DECIMAL(10,8), lon1 DECIMAL(11,8), 
                                 lat2 DECIMAL(10,8), lon2 DECIMAL(11,8))
RETURNS DECIMAL(10,2) DETERMINISTIC
BEGIN
    DECLARE R INT DEFAULT 6371; -- Earth's radius in km
    DECLARE dLat DECIMAL(10,8);
    DECLARE dLon DECIMAL(11,8);
    DECLARE a DECIMAL(20,15);
    DECLARE c DECIMAL(20,15);
    DECLARE d DECIMAL(20,15);
    
    SET dLat = RADIANS(lat2 - lat1);
    SET dLon = RADIANS(lon2 - lon1);
    SET a = SIN(dLat / 2) * SIN(dLat / 2) +
            COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
            SIN(dLon / 2) * SIN(dLon / 2);
    SET c = 2 * ATAN2(SQRT(a), SQRT(1 - a));
    SET d = R * c;
    
    RETURN d;
END //
DELIMITER ;

-- Create a view for nearby help requests
CREATE OR REPLACE VIEW vw_nearby_help_requests AS
SELECT 
    hr.*,
    u.name AS requester_name,
    u.phone AS requester_phone
FROM 
    help_requests hr
JOIN 
    users u ON hr.requester_id = u.id
WHERE 
    hr.status = 'PENDING';

-- Create a stored procedure to find nearby help requests
DELIMITER //
CREATE PROCEDURE sp_find_nearby_help_requests(
    IN p_latitude DECIMAL(10,8),
    IN p_longitude DECIMAL(11,8),
    IN p_radius_km DECIMAL(10,2)
)
BEGIN
    DECLARE v_earth_radius_km DECIMAL(10,2) DEFAULT 6371.0;
    DECLARE v_lat_degree DECIMAL(10,8);
    DECLARE v_lng_degree DECIMAL(10,8);
    
    -- Calculate the approximate degrees for the given radius (simplified)
    SET v_lat_degree = (p_radius_km / 111.32);
    SET v_lng_degree = (p_radius_km / (111.32 * COS(RADIANS(p_latitude))));
    
    -- Find help requests within the bounding box first (for performance)
    SELECT 
        hr.*,
        calculate_distance(p_latitude, p_longitude, hr.latitude, hr.longitude) AS distance_km,
        u.name AS requester_name,
        u.phone AS requester_phone
    FROM 
        help_requests hr
    JOIN 
        users u ON hr.requester_id = u.id
    WHERE 
        hr.status = 'PENDING'
        AND hr.latitude BETWEEN (p_latitude - v_lat_degree) AND (p_latitude + v_lat_degree)
        AND hr.longitude BETWEEN (p_longitude - v_lng_degree) AND (p_longitude + v_lng_degree)
    HAVING 
        distance_km <= p_radius_km
    ORDER BY 
        distance_km ASC;
END //
DELIMITER ;
