# CrowdAid: Emergency Response Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/crowdaid/ci.yml?branch=main)](https://github.com/yourusername/crowdaid/actions)
[![codecov](https://codecov.io/gh/yourusername/crowdaid/branch/main/graph/badge.svg?token=YOUR-TOKEN)](https://codecov.io/gh/yourusername/crowdaid)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/crowdaid?style=social)](https://github.com/yourusername/crowdaid/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/crowdaid)](https://github.com/yourusername/crowdaid/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/crowdaid)](https://github.com/yourusername/crowdaid/pulls)

<div align="center">
  <img src="./screenshots/dashboard-preview.png" alt="CrowdAid Dashboard" width="800"/>
  <p><em>CrowdAid Dashboard - View and manage help requests in real-time</em></p>
</div>

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Code of Conduct](#-code-of-conduct)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)
- [Contact](#-contact)

## 🌟 Overview

CrowdAid is a comprehensive emergency response platform designed to connect individuals in need with volunteers who can provide assistance. The platform serves as a bridge between those requiring help during emergencies (natural disasters, medical situations, or community support needs) and volunteers willing to offer their time, skills, and resources.

### Problem Statement

During emergencies, timely assistance can be the difference between life and death. Traditional emergency response systems often face challenges in:
- Rapidly mobilizing local volunteers
- Efficiently matching help requests with available resources
- Providing real-time updates on emergency situations
- Ensuring effective communication between all stakeholders

### Solution

CrowdAid addresses these challenges by providing:
- A real-time platform for submitting and tracking help requests
- Intelligent matching of requests with nearby, qualified volunteers
- Secure communication channels between requesters and volunteers
- Real-time status updates and notifications
- Comprehensive dashboard for monitoring and managing emergencies

## ✨ Key Features

### 🆘 Help Request Management
- **Request Creation**: Users can create detailed help requests with title, description, category, and priority level
- **Request Tracking**: Real-time status updates (Draft → Pending → In Progress → Completed/Cancelled)
- **Rich Media Support**: Upload and view images to better understand the situation
- **Location-Based Services**: Precise geolocation with address autocomplete and map visualization
- **Request Filtering**: Filter requests by status, category, distance, and urgency

### 🤝 Volunteer Coordination
- **Volunteer Registration**: Detailed profiles with skills, availability, and verification status
- **Smart Matching**: Algorithm to match requests with the most suitable volunteers based on:
  - Proximity to the emergency
  - Required skills and certifications
  - Availability and response time
  - Past performance and ratings
- **Task Assignment**: Coordinators can assign specific volunteers to requests

### 💬 Communication
- **Real-time Chat**: Secure messaging between requesters and volunteers
- **Push Notifications**: Instant alerts for new messages, status updates, and assignments
- **Announcements**: Broadcast important updates to all relevant parties

### 🔐 Security & Privacy
- **End-to-End Encryption**: For all sensitive communications
- **Role-Based Access Control**: Different permission levels for requesters, volunteers, and administrators
- **Data Protection**: Compliance with GDPR and other privacy regulations
- **Secure File Storage**: Encrypted storage for all uploaded media

### 📊 Dashboard & Analytics
- **Real-time Metrics**: Track active requests, response times, and volunteer availability
- **Performance Reports**: Generate reports on response effectiveness and volunteer contributions
- **Audit Logs**: Comprehensive logging of all system activities

### 📱 Cross-Platform Support
- **Responsive Web App**: Optimized for all device sizes
- **Progressive Web App (PWA)**: Installable on mobile devices for offline access
- **Dark/Light Mode**: User preference for better accessibility

## 🛠 Tech Stack

### Backend
- **Core Framework**: Spring Boot 3.2.x
- **Language**: Java 17 (LTS)
- **Database**: 
  - **Primary**: MySQL 8.0 (Relational data)
  - **Cache**: Redis 7.0 (Session management, rate limiting)
  - **Search**: Elasticsearch 8.5 (Full-text search)
- **Authentication & Authorization**:
  - JWT (JSON Web Tokens)
  - OAuth 2.0 & OpenID Connect
  - Role-Based Access Control (RBAC)
- **API**:
  - RESTful API design
  - GraphQL for complex queries
  - WebSockets for real-time updates
  - Server-Sent Events (SSE) for notifications
- **Documentation**:
  - OpenAPI 3.0 (Swagger)
  - Spring REST Docs
- **Build & Dependency Management**:
  - Maven
  - JUnit 5, Mockito, TestContainers
- **Containerization & Orchestration**:
  - Docker
  - Docker Compose for local development
  - Kubernetes manifests for production

### Frontend
- **Core**:
  - React 18.2 with TypeScript 5.0
  - React Router 6.8 for navigation
- **State Management**:
  - React Context API
  - React Query for server state
  - Zustand for client state
- **UI Components & Styling**:
  - Material-UI (MUI) v5
  - Styled Components
  - Tailwind CSS for custom styling
  - Framer Motion for animations
- **Maps & Location**:
  - Leaflet with React-Leaflet
  - Mapbox GL JS for advanced mapping
  - GeoJSON support
- **Forms & Validation**:
  - Formik with Yup validation
  - React Hook Form for complex forms
- **Data Fetching**:
  - Axios for HTTP requests
  - React Query for data synchronization
- **Internationalization**:
  - i18next with react-i18next
- **Build Tools**:
  - Vite 4.0
  - TypeScript compiler
  - ESLint + Prettier
  - Husky + lint-staged for git hooks

### DevOps & Infrastructure
- **Version Control**: Git with GitHub Flow
- **CI/CD**:
  - GitHub Actions for CI/CD pipelines
  - Automated testing and deployment
  - Semantic Release for versioning
- **Container Orchestration**:
  - Docker Compose for local development
  - Kubernetes for production
  - Helm charts for package management
- **Cloud Services (AWS)**:
  - ECS/EKS for container orchestration
  - RDS for managed MySQL
  - ElastiCache for Redis
  - OpenSearch (Elasticsearch)
  - S3 for file storage
  - CloudFront CDN
  - Route 53 for DNS
  - ACM for SSL certificates
- **Monitoring & Logging**:
  - AWS CloudWatch
  - Prometheus + Grafana
  - ELK Stack (Elasticsearch, Logstash, Kibana)
  - Sentry for error tracking
- **Security**:
  - AWS WAF
  - Rate limiting
  - DDoS protection
  - Regular security audits

## 📋 Prerequisites

### Development Environment

#### Backend
- **Java Development Kit (JDK) 17**
  - [Adoptium Temurin JDK 17](https://adoptium.net/)
  - Set `JAVA_HOME` environment variable
  ```bash
  # Verify installation
  java -version
  javac -version
  ```

- **Apache Maven 3.8+**
  ```bash
  # Verify installation
  mvn -v
  ```

- **MySQL 8.0+**
  - Server and client tools
  - [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
  ```bash
  # Verify installation
  mysql --version
  ```

- **Redis 7.0+** (for caching and session management)
  ```bash
  # Verify installation
  redis-cli --version
  ```

#### Frontend
- **Node.js 18+ LTS**
  - Includes npm 9+
  - [Official Node.js Downloads](https://nodejs.org/)
  ```bash
  # Verify installation
  node --version
  npm --version
  ```

- **Yarn (Optional but recommended)**
  ```bash
  npm install -g yarn
  yarn --version
  ```

#### Containerization
- **Docker 20.10+**
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/) or
  - [Docker Engine](https://docs.docker.com/engine/install/)
  ```bash
  # Verify installation
  docker --version
  docker-compose version
  ```

#### Recommended Tools
- **Git** for version control
- **Postman** or **Insomnia** for API testing
- **DBeaver** or **MySQL Workbench** for database management
- **IntelliJ IDEA** or **VS Code** as code editors

#### System Requirements
- **Minimum**:
  - 4GB RAM
  - 10GB free disk space
  - Dual-core processor
- **Recommended**:
  - 8GB+ RAM
  - 20GB+ free disk space (for Docker images and dependencies)
  - Quad-core processor
  - SSD storage for better performance

#### Browser Support
- **Desktop**: Latest versions of Chrome, Firefox, Safari, Edge
- **Mobile**: Chrome and Safari on latest iOS/Android
- **Not supported**: IE 11 and below

## 🚀 Installation

### Option 1: Development Setup (Recommended for Developers)

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/crowdaid.git
cd crowdaid
```

#### 2. Set Up Backend

##### Database Setup
1. Start MySQL server
2. Create a new database and user:
```sql
CREATE DATABASE crowdaid CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crowdaid_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON crowdaid.* TO 'crowdaid_user'@'localhost';
FLUSH PRIVILEGES;
```

##### Configuration
1. Copy the example configuration:
```bash
cp backend/src/main/resources/application-example.yml backend/src/main/resources/application.yml
```

2. Update the configuration with your database credentials and other settings.

##### Build and Run
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend API will be available at `http://localhost:8080`

#### 3. Set Up Frontend

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
# or with yarn
# yarn install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
# API Configuration
VITE_API_URL=http://localhost:8080/api

# Map Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_MAPBOX_STYLE=mapbox://styles/mapbox/streets-v11

# Authentication
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=your-audience

# Feature Flags
VITE_FEATURE_CHAT_ENABLED=true
VITE_FEATURE_OFFLINE_MODE=true

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXX-Y
VITE_SENTRY_DSN=your-sentry-dsn
```

5. Start the development server:
```bash
npm run dev
# or with yarn
# yarn dev
```

The frontend will be available at `http://localhost:3000`

### Option 2: Docker Setup (Quick Start)

#### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- At least 4GB of free memory

#### Steps
1. Clone the repository:
```bash
git clone https://github.com/yourusername/crowdaid.git
cd crowdaid
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration (see above).

4. Start all services:
```bash
docker-compose up --build
```

This will start:
- Backend API on `http://localhost:8080`
- Frontend on `http://localhost:3000`
- MySQL database
- Redis cache
- phpMyAdmin (optional) on `http://localhost:8081`

5. To run in detached mode:
```bash
docker-compose up -d
```

6. View logs:
```bash
docker-compose logs -f
```

### Option 3: Production Deployment

#### Prerequisites
- AWS Account
- AWS CLI configured with appropriate permissions
- Terraform 1.0+
- kubectl
- Helm 3.0+

#### Deployment Steps
1. Set up infrastructure with Terraform:
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

2. Deploy Kubernetes manifests:
```bash
kubectl apply -f kubernetes/
```

3. Set up ingress and DNS:
```bash
kubectl apply -f kubernetes/ingress/
```

4. Verify deployment:
```bash
kubectl get all
```

## 📚 API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### End-to-End Tests
```bash
cd frontend
npm run test:e2e
```

## 🏗️ Project Structure

```
crowdaid/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/crowdaid/
│   │   │   │   ├── config/        # Configuration classes
│   │   │   │   ├── controller/    # REST controllers
│   │   │   │   ├── dto/           # Data Transfer Objects
│   │   │   │   ├── exception/     # Exception handling
│   │   │   │   ├── model/         # JPA entities
│   │   │   │   ├── repository/    # Data access layer
│   │   │   │   ├── security/      # Security configuration
│   │   │   │   ├── service/       # Business logic
│   │   │   │   └── CrowdAidApplication.java
│   │   │   └── resources/         # Configuration files, static content
│   │   └── test/                  # Test files
│   └── pom.xml
│
├── frontend/                # React frontend
│   ├── public/              # Static files
│   ├── src/
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── features/        # Feature modules
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Page layouts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── theme/           # MUI theme configuration
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main App component
│   │   └── main.tsx         # Application entry point
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── vite.config.ts
│
├── docker/                  # Docker configuration files
├── .github/                 # GitHub Actions workflows
├── docker-compose.yml       # Docker Compose configuration
└── README.md               # This file
```

## 🤝 Contributing

We welcome contributions from the community! Whether you're a developer, designer, tester, or documentation writer, there are many ways to contribute to CrowdAid.

### How to Contribute

1. **Fork the repository** and create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Set up the development environment** as described in the [Installation](#-installation) section

3. **Make your changes** following the project's code style and conventions

4. **Write tests** for your changes (if applicable)

5. **Run the test suite** to ensure everything works as expected:
   ```bash
   # Backend tests
   cd backend
   mvn test
   
   # Frontend tests
   cd ../frontend
   npm test
   ```

6. **Commit your changes** with a descriptive commit message:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
   
   We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

7. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

8. **Open a Pull Request** with a clear title and description

### Reporting Issues

Found a bug or have a feature request? Please open an issue on our [GitHub Issues](https://github.com/yourusername/crowdaid/issues) page with:

- A clear title and description
- Steps to reproduce the issue (if applicable)
- Expected vs actual behavior
- Screenshots or logs (if applicable)
- Your environment details

### Code Style

- **Backend**: Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- **Frontend**: Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused on a single responsibility

### Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build
2. Update the README.md with details of changes to the interface, including new environment variables, exposed ports, useful file locations, and container parameters
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent
4. Your pull request will be reviewed by the maintainers and may require changes before being merged

## 📜 Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to make participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or electronic address, without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, or to ban temporarily or permanently any contributor for other behaviors that they deem inappropriate, threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces when an individual is representing the project or its community. Examples of representing a project or community include using an official project e-mail address, posting via an official social media account, or acting as an appointed representative at an online or offline event.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at [your-email@example.com]. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances. The project team is obligated to maintain confidentiality with regard to the reporter of an incident. Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good faith may face temporary or permanent repercussions as determined by other members of the project's leadership.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2023 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

We would like to thank the following open-source projects and communities that made this project possible:

### Backend
- [Spring Boot](https://spring.io/projects/spring-boot) - The web framework used
- [Spring Security](https://spring.io/projects/spring-security) - Authentication and authorization
- [Hibernate](https://hibernate.org/) - ORM framework
- [Flyway](https://flywaydb.org/) - Database migrations
- [Lombok](https://projectlombok.org/) - Reducing boilerplate code
- [MapStruct](https://mapstruct.org/) - Java bean mappings
- [JUnit 5](https://junit.org/junit5/) - Testing framework

### Frontend
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Material-UI (MUI)](https://mui.com/) - React UI component library
- [React Router](https://reactrouter.com/) - Client-side routing
- [React Query](https://tanstack.com/query) - Data synchronization
- [Formik](https://formik.org/) - Form handling
- [Yup](https://github.com/jquense/yup) - Form validation
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [i18next](https://www.i18next.com/) - Internationalization

### DevOps
- [Docker](https://www.docker.com/) - Containerization
- [Kubernetes](https://kubernetes.io/) - Container orchestration
- [GitHub Actions](https://github.com/features/actions) - CI/CD
- [Terraform](https://www.terraform.io/) - Infrastructure as Code
- [AWS](https://aws.amazon.com/) - Cloud services
- [Prometheus](https://prometheus.io/) - Monitoring
- [Grafana](https://grafana.com/) - Visualization & monitoring
- [Sentry](https://sentry.io/) - Error tracking

### Special Thanks
- All the contributors who have helped improve this project
- The open-source community for their invaluable tools and libraries
- Early adopters and beta testers for their feedback

## 📧 Contact

### Core Team
- **Project Lead**: [Your Name] - [@yourtwitter](https://twitter.com/yourtwitter) - your.email@example.com
- **Backend Lead**: [Team Member Name] - team.member@example.com
- **Frontend Lead**: [Team Member Name] - frontend@example.com
- **DevOps Lead**: [Team Member Name] - devops@example.com

### Community
- **GitHub Issues**: [https://github.com/yourusername/crowdaid/issues](https://github.com/yourusername/crowdaid/issues)
- **Discussion Forum**: [https://github.com/yourusername/crowdaid/discussions](https://github.com/yourusername/crowdaid/discussions)
- **Twitter**: [@CrowdAidApp](https://twitter.com/CrowdAidApp) (example)
- **Slack**: [Join our Slack community](https://join.slack.com/t/crowdaid/...) (example)

## 🌟 Show Your Support

If you find this project useful, please consider giving it a ⭐️ on [GitHub](https://github.com/yourusername/crowdaid) and sharing it with others who might benefit from it.

## 🤝 Contributing Organizations

[![Organization 1](https://via.placeholder.com/200x100?text=Organization+1)](https://example.com)
[![Organization 2](https://via.placeholder.com/200x100?text=Organization+2)](https://example.com)
[![Organization 3](https://via.placeholder.com/200x100?text=Organization+3)](https://example.com)

## 📖 Related Projects

- [CrowdAid Mobile App](https://github.com/yourusername/crowdaid-mobile) - Native mobile applications for iOS and Android
- [CrowdAid Admin](https://github.com/yourusername/crowdaid-admin) - Administrative dashboard for managing the platform
- [CrowdAid API](https://github.com/yourusername/crowdaid-api) - Public API documentation and client libraries
