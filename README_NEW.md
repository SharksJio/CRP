# Kitties powered by Droidminnds Management System

## Project Overview
This is a comprehensive PreSchool Management System designed to streamline operations for preschools, focusing on Communication, Expense Management, and Fee Management as the initial modules.

## Key Features

### 1. Communication Module
- **Instant Notifications**: Push notifications for alerts and important updates
- **Announcements**: School-wide or class-specific announcements
- **Homework Tracking**: Digital homework assignments with attachments
- **Media Gallery**: Share photos and videos of classroom activities
- **Calendar Events**: Manage school events, holidays, and PTMs

### 2. Expense Management Module
- **Daily Expense Recording**: Track all school expenses with categories
- **Receipt Management**: Upload and store receipts digitally
- **Expense Categories**: Predefined and custom expense categories
- **Remittance Tracking**: Monitor branch remittances
- **Reports & Analytics**: Comprehensive expense reports and insights

### 3. Fee Management Module
- **Invoice Generation**: Automated invoice creation
- **Payment Gateway Integration**: Stripe and Razorpay support
- **Automated Reminders**: Timely payment reminders
- **Receipt Generation**: Automatic PDF receipts
- **Reports & Analytics**: Fee collection insights and pending fee reports

## Technology Stack

### Backend
- **Framework**: Node.js with NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **API**: RESTful with OpenAPI/Swagger documentation
- **Real-time**: Socket.io for live updates

### Mobile Application
- **Framework**: Flutter 3.16+
- **Language**: Dart 3.2+
- **UI**: Material Design 3
- **State Management**: Riverpod
- **HTTP Client**: Dio
- **Platform**: iOS & Android

### Web Admin
- **Framework**: Next.js
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes / Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud**: AWS / Google Cloud / Azure

### Third-Party Services
- **Push Notifications**: Firebase Cloud Messaging
- **Email**: SendGrid / AWS SES
- **Media Storage**: Cloudinary / AWS S3
- **Payment**: Stripe / Razorpay
- **SMS**: Twilio (optional)

## Architecture

The system follows a **microservices architecture** with:
- API Gateway for unified access
- Independent services for Communication, Expense, and Fee Management
- Event-driven architecture for real-time updates
- Clean Architecture pattern in mobile app

## Project Structure

```
crp-preschool/
├── backend/
│   ├── api-gateway/
│   ├── communication-service/
│   ├── expense-service/
│   ├── fee-service/
│   └── auth-service/
├── mobile/                    # Flutter mobile app
├── web-admin/                 # Next.js web admin
├── infrastructure/
│   ├── kubernetes/
│   ├── terraform/
│   └── monitoring/
└── docs/
```

## Documentation

- [Architecture Overview](./ARCHITECTURE.md) - System architecture and design decisions
- [Technology Evaluation](./TECH_EVALUATION.md) - Detailed tech stack evaluation
- [Project Structure](./PROJECT_STRUCTURE.md) - Complete project organization
- [Database Schema](./DATABASE_SCHEMA.md) - Database design and relationships
- [Flutter Implementation](./FLUTTER_IMPLEMENTATION.md) - Mobile app development guide

## Getting Started

### Prerequisites

#### Backend Development
```bash
- Node.js 18+ (LTS)
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose
```

#### Mobile Development
```bash
- Flutter SDK 3.16+
- Android Studio / Xcode
- Android SDK / iOS SDK
```

### Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/SharksJio/CRP.git
cd CRP
```

#### 2. Setup Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

#### 3. Start Backend Services (Docker)
```bash
cd backend
docker-compose up -d
```

#### 4. Run Database Migrations
```bash
cd backend/communication-service
npm install
npm run migration:run
```

#### 5. Start Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

## Development Workflow

### Backend Development
```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Run tests
npm test

# Build for production
npm run build

# Run linting
npm run lint
```

### Mobile Development
```bash
# Get dependencies
flutter pub get

# Run on device/emulator
flutter run

# Run tests
flutter test

# Build APK (Android)
flutter build apk --release

# Build iOS
flutter build ios --release
```

## API Documentation

Once the backend services are running, API documentation is available at:
- Communication Service: http://localhost:3001/api/docs
- Expense Service: http://localhost:3002/api/docs
- Fee Service: http://localhost:3003/api/docs

## Security

- JWT-based authentication with refresh tokens
- Role-Based Access Control (RBAC)
- Data encryption at rest and in transit
- PCI DSS compliance for payment processing
- GDPR and COPPA compliance
- Regular security audits

## Testing

### Backend
- Unit tests with Jest
- Integration tests
- E2E tests
- Coverage target: >80%

### Mobile
- Unit tests with Flutter Test
- Widget tests
- Integration tests with Detox
- Coverage target: >80%

## Deployment

### Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Staging
```bash
kubectl apply -f infrastructure/kubernetes/staging/
```

### Production
```bash
kubectl apply -f infrastructure/kubernetes/production/
```

## Monitoring & Logging

- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Error Tracking**: Sentry
- **APM**: New Relic / DataDog

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Coding Standards

- Follow TypeScript/Dart style guides
- Write clean, maintainable code
- Add unit tests for new features
- Document public APIs
- Follow SOLID principles
- Use meaningful variable names

## Roadmap

### Phase 1 (Current) - Months 1-2
- [x] Architecture design
- [x] Technology stack selection
- [x] Database schema design
- [ ] Backend API development
- [ ] Mobile app foundation

### Phase 2 - Months 3-4
- [ ] Communication module completion
- [ ] Expense management module completion
- [ ] Fee management module completion
- [ ] Payment gateway integration

### Phase 3 - Months 5-6
- [ ] Testing and bug fixes
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Beta launch

### Phase 4 - Months 7-8
- [ ] Attendance module
- [ ] LMS module
- [ ] Transport module
- [ ] Production launch

### Future Phases
- [ ] CCTV integration
- [ ] Daycare management
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] White-label solutions

## Commercialization

### Pricing Tiers
- **Starter**: Up to 50 students - $99/month
- **Professional**: Up to 200 students - $299/month
- **Enterprise**: Unlimited students - $599/month
- **Custom**: White-label solutions - Contact sales

### Revenue Streams
- Monthly/yearly subscriptions
- Payment gateway transaction fees (optional)
- Premium features
- Support and training services
- Custom development

## Support

- **Documentation**: [docs.crpschool.com](https://docs.crpschool.com)
- **Email**: support@crpschool.com
- **Issues**: [GitHub Issues](https://github.com/SharksJio/CRP/issues)
- **Community**: [Discord Server](https://discord.gg/crpschool)

## License

This project is proprietary software. All rights reserved.
For licensing inquiries, contact: licensing@crpschool.com

## Team

- **Project Lead**: TBD
- **Backend Team**: TBD
- **Mobile Team**: TBD
- **UI/UX Designer**: TBD
- **DevOps Engineer**: TBD

## Acknowledgments

- Material Design 3 by Google
- Flutter framework
- NestJS framework
- Open-source community

---

**Built with ❤️ for PreSchools worldwide**
