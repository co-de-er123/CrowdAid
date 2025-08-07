# CrowdAid Emergency Response Platform - Backend

This is the backend service for the CrowdAid Emergency Response Platform, built with Spring Boot 3.2.0 and Java 17.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (USER, VOLUNTEER, ADMIN)
  - Secure password hashing with BCrypt

- **Help Request Management**
  - Create and manage help requests
  - Location-based search for nearby requests
  - Real-time status updates

- **Real-time Messaging**
  - WebSocket-based chat between requesters and volunteers
  - Read receipts and typing indicators
  - Push notifications

- **API Documentation**
  - Interactive OpenAPI 3.0 documentation
  - Available at `/swagger-ui.html` when running locally

## Prerequisites

- Java 17 or higher
- Maven 3.6.3 or higher
- MySQL 8.0 or higher (or Docker with MySQL)
- Node.js 16+ (for frontend development)

## Getting Started

### 1. Database Setup

#### Using Docker (Recommended)

```bash
docker run --name crowdaid-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=crowdaid -p 3306:3306 -d mysql:8.0
```

#### Manual Setup

1. Install MySQL 8.0+
2. Create a new database:
   ```sql
   CREATE DATABASE crowdaid CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Create a user with privileges:
   ```sql
   CREATE USER 'crowdaid'@'%' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON crowdaid.* TO 'crowdaid'@'%';
   FLUSH PRIVILEGES;
   ```

### 2. Configuration

Copy the `application.yml` file to `application-dev.yml` and update the database configuration if needed:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/crowdaid?useSSL=false&serverTimezone=UTC
    username: root
    password: root
```

### 3. Build and Run

#### Using Maven

```bash
# Build the application
mvn clean install

# Run with development profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Using Docker

```bash
# Build the Docker image
docker build -t crowdaid/backend .

# Run the container
docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod crowdaid/backend
```

### 4. Access the Application

- **API Documentation**: http://localhost:8080/api/swagger-ui.html
- **H2 Console**: http://localhost:8080/api/h2-console
  - JDBC URL: `jdbc:h2:mem:testdb`
  - Username: `sa`
  - Password: (leave empty)

## API Endpoints

### Authentication

- `POST /api/auth/signin` - Authenticate user and get JWT token
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signout` - Invalidate JWT token

### Users

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/me/help-requests` - Get current user's help requests

### Help Requests

- `GET /api/help-requests` - Get all help requests (filtered by status/location)
- `POST /api/help-requests` - Create a new help request
- `GET /api/help-requests/{id}` - Get help request by ID
- `PUT /api/help-requests/{id}` - Update help request
- `DELETE /api/help-requests/{id}` - Delete help request
- `POST /api/help-requests/{id}/accept` - Accept a help request (volunteer only)
- `PUT /api/help-requests/{id}/status` - Update help request status

### Messages

- `GET /api/messages/{helpRequestId}` - Get messages for a help request
- `POST /api/messages` - Send a new message
- `GET /api/messages/{helpRequestId}/unread-count` - Get unread message count
- `POST /api/messages/{helpRequestId}/mark-as-read` - Mark messages as read

## WebSocket Endpoints

- `/ws` - WebSocket endpoint
- `/topic/chat/{helpRequestId}` - Subscribe to chat messages
- `/queue/messages/{userId}` - Private message queue for a user
- `/topic/user/{userId}/status` - User online/offline status

## Development

### Code Style

This project uses Google Java Format for code style. To format your code:

```bash
mvn spotless:apply
```

### Testing

```bash
# Run all tests
mvn test

# Run tests with coverage
mvn jacoco:report
```

### Database Migrations

Database migrations are managed using Flyway. Migration scripts are located in `src/main/resources/db/migration`.

To create a new migration:

1. Create a new SQL file following the naming convention: `V{version}__{description}.sql`
2. Place it in the `src/main/resources/db/migration` directory

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `dev` |
| `DB_URL` | Database URL | `jdbc:mysql://localhost:3306/crowdaid` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `root` |
| `JWT_SECRET` | JWT signing key | Random UUID |
| `JWT_EXPIRATION_MS` | JWT expiration time in milliseconds | `86400000` (24h) |

## Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: crowdaid-db
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-root}
      MYSQL_DATABASE: crowdaid
      MYSQL_USER: ${DB_USER:-crowdaid}
      MYSQL_PASSWORD: ${DB_PASSWORD:-password}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - crowdaid-network

  backend:
    build: .
    container_name: crowdaid-backend
    depends_on:
      - db
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_URL: jdbc:mysql://db:3306/crowdaid?useSSL=false&serverTimezone=UTC
      DB_USERNAME: ${DB_USER:-crowdaid}
      DB_PASSWORD: ${DB_PASSWORD:-password}
      JWT_SECRET: ${JWT_SECRET:-your-jwt-secret}
    ports:
      - "8080:8080"
    networks:
      - crowdaid-network

networks:
  crowdaid-network:
    driver: bridge

volumes:
  mysql_data:
```

### Kubernetes

For Kubernetes deployment, see the `k8s/` directory for example manifests.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
