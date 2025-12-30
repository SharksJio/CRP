# Quick Start Guide for Developers

Welcome to the CRP PreSchool Management System! This guide will help you get started quickly.

## 📖 Documentation Overview

Before you begin coding, please read these documents in order:

### 1. Start Here
- **README.md** (original) - Feature list and requirements
- **IMPLEMENTATION_SUMMARY.md** - Executive summary of the entire project
- **README_NEW.md** - Complete project overview with getting started guide

### 2. Architecture & Design
- **ARCHITECTURE.md** - System architecture and technology stack
- **TECH_EVALUATION.md** - Why we chose each technology
- **PROJECT_STRUCTURE.md** - How the codebase is organized

### 3. Implementation Guides
- **DATABASE_SCHEMA.md** - Database design for all modules
- **FLUTTER_IMPLEMENTATION.md** - Mobile app development guide with code examples

### 4. Configuration
- **.env.example** - Environment variables template
- **docker-compose.yml** - Local development setup

---

## 🚀 Quick Setup (5 minutes)

### Prerequisites
```bash
# Install required tools
- Node.js 18+ (https://nodejs.org)
- Docker Desktop (https://docker.com/products/docker-desktop)
- Flutter SDK 3.16+ (https://flutter.dev/docs/get-started/install)
- Git
```

### 1. Clone Repository
```bash
git clone https://github.com/SharksJio/CRP.git
cd CRP
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your values (or use defaults for local dev)
```

### 3. Start Infrastructure (Database, Redis, etc.)
```bash
# Start all services with Docker
docker-compose up -d postgres redis

# Verify services are running
docker-compose ps
```

That's it for initial setup! 🎉

---

## 💻 Development Workflow

### Backend Development

#### Option 1: With Docker (Recommended for full stack)
```bash
# Start all backend services
docker-compose up -d

# View logs
docker-compose logs -f communication-service

# Stop services
docker-compose down
```

#### Option 2: Without Docker (for individual service development)
```bash
# Navigate to a service
cd backend/communication-service

# Install dependencies
npm install

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev

# Run tests
npm test

# Build for production
npm run build
```

### Mobile Development (Flutter)

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
flutter pub get

# Check Flutter setup
flutter doctor

# Run on connected device/emulator
flutter run

# Run on specific device
flutter devices
flutter run -d <device-id>

# Run tests
flutter test

# Build APK (Android)
flutter build apk --release

# Build iOS
flutter build ios --release
```

---

## 🗂️ Project Structure

```
CRP/
├── backend/                    # Backend microservices (to be created)
│   ├── api-gateway/           # API Gateway service
│   ├── communication-service/ # Communication module
│   ├── expense-service/       # Expense management module
│   ├── fee-service/           # Fee management module
│   └── auth-service/          # Authentication service
│
├── mobile/                     # Flutter mobile app (to be created)
│   ├── lib/
│   │   ├── features/          # Feature modules
│   │   ├── core/              # Core utilities
│   │   └── shared/            # Shared components
│   ├── android/
│   └── ios/
│
├── docs/                       # Additional documentation (to be created)
│
└── infrastructure/             # K8s, Terraform configs (to be created)
```

---

## 🎯 What to Build First

### Phase 1: Authentication Service (Week 1-2)
1. User registration and login
2. JWT token generation
3. Password reset functionality
4. Role-based access control

### Phase 2: Communication Module (Week 3-6)
1. Notifications API and screen
2. Announcements CRUD
3. Homework management
4. Media gallery
5. Calendar events

### Phase 3: Expense Module (Week 7-9)
1. Expense recording API
2. Category management
3. Receipt upload
4. Reports generation

### Phase 4: Fee Module (Week 10-14)
1. Invoice generation
2. Payment gateway integration (Stripe)
3. Payment processing
4. Receipt generation
5. Reminder system

---

## 🧪 Testing Strategy

### Backend Testing
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Mobile Testing
```bash
# Unit tests
flutter test

# Widget tests
flutter test test/widget_test.dart

# Integration tests
flutter test integration_test
```

---

## 📝 Coding Standards

### Backend (TypeScript/NestJS)
- Use TypeScript strict mode
- Follow NestJS best practices
- Use DTOs for validation
- Implement repository pattern
- Write unit tests for services
- Document APIs with Swagger decorators

### Mobile (Dart/Flutter)
- Follow Dart style guide
- Use const constructors
- Implement Clean Architecture
- Use Riverpod for state management
- Write widget tests
- Follow Material Design guidelines

---

## 🔧 Common Commands

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose ps                 # List running services
docker-compose logs -f <service>  # View logs
docker-compose restart <service>  # Restart a service
```

### Git
```bash
git checkout -b feature/my-feature    # Create feature branch
git add .                             # Stage changes
git commit -m "Description"           # Commit changes
git push origin feature/my-feature    # Push to remote
```

### Database
```bash
# Access PostgreSQL
docker exec -it crp_postgres psql -U postgres -d crp_preschool

# Common SQL commands
\dt              # List tables
\d table_name    # Describe table
SELECT * FROM users LIMIT 10;
```

---

## 🐛 Troubleshooting

### Docker Issues
```bash
# Reset everything
docker-compose down -v
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Flutter Issues
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run

# Fix Doctor issues
flutter doctor --android-licenses
```

### Database Issues
```bash
# Reset database
docker-compose down -v postgres
docker-compose up -d postgres

# Run migrations again
npm run migration:run
```

---

## 📚 Learning Resources

### NestJS
- Official Docs: https://docs.nestjs.com
- Video Course: https://www.udemy.com/course/nestjs-zero-to-hero/

### Flutter
- Official Docs: https://docs.flutter.dev
- Codelabs: https://docs.flutter.dev/codelabs
- Widget Catalog: https://docs.flutter.dev/development/ui/widgets

### Material Design 3
- Guidelines: https://m3.material.io
- Flutter Implementation: https://docs.flutter.dev/ui/design/material

### PostgreSQL
- Tutorial: https://www.postgresqltutorial.com
- Best Practices: https://wiki.postgresql.org/wiki/Don't_Do_This

---

## 🤝 Getting Help

### Development Questions
1. Check the documentation first
2. Search existing issues on GitHub
3. Ask in team chat/Discord
4. Create a GitHub issue if it's a bug

### Code Review Process
1. Create a feature branch
2. Make your changes
3. Write tests
4. Create a Pull Request
5. Request review from team
6. Address feedback
7. Merge after approval

---

## 🎓 Best Practices

### Do's ✅
- Write clean, readable code
- Add comments for complex logic
- Write tests for new features
- Follow the established architecture
- Use meaningful variable names
- Keep functions small and focused
- Commit frequently with clear messages
- Review your own code before PR

### Don'ts ❌
- Don't commit sensitive data (.env files)
- Don't skip tests
- Don't push directly to main
- Don't ignore linting errors
- Don't hardcode configuration
- Don't commit large files
- Don't leave console.log statements
- Don't ignore security warnings

---

## 🎉 You're Ready!

You now have everything you need to start developing the CRP PreSchool Management System.

### Next Steps:
1. ✅ Read IMPLEMENTATION_SUMMARY.md for project overview
2. ✅ Set up your local development environment
3. ✅ Read ARCHITECTURE.md to understand the system design
4. ✅ Read FLUTTER_IMPLEMENTATION.md if working on mobile
5. ✅ Pick a task from the roadmap and start coding!

### Important Files to Reference
- **ARCHITECTURE.md** - When making design decisions
- **DATABASE_SCHEMA.md** - When working with database
- **FLUTTER_IMPLEMENTATION.md** - When building mobile screens
- **TECH_EVALUATION.md** - To understand technology choices

---

**Happy Coding! 🚀**

For questions, reach out to the team lead or create a GitHub issue.

---

*Last Updated: December 30, 2025*
