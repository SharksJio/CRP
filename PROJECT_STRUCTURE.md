# Kitties powered by Droidminnds Management System - Project Structure

## Directory Structure

```
crp-preschool/
├── README.md
├── ARCHITECTURE.md
├── TECH_EVALUATION.md
├── docker-compose.yml
├── .gitignore
├── .env.example
│
├── backend/
│   ├── api-gateway/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── communication-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── notifications/
│   │   │   │   ├── notifications.module.ts
│   │   │   │   ├── notifications.controller.ts
│   │   │   │   ├── notifications.service.ts
│   │   │   │   └── dto/
│   │   │   ├── announcements/
│   │   │   ├── homework/
│   │   │   ├── media/
│   │   │   ├── calendar/
│   │   │   └── shared/
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── expense-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── expenses/
│   │   │   │   ├── expenses.module.ts
│   │   │   │   ├── expenses.controller.ts
│   │   │   │   ├── expenses.service.ts
│   │   │   │   └── dto/
│   │   │   ├── categories/
│   │   │   ├── remittances/
│   │   │   ├── reports/
│   │   │   └── shared/
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── fee-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── invoices/
│   │   │   │   ├── invoices.module.ts
│   │   │   │   ├── invoices.controller.ts
│   │   │   │   ├── invoices.service.ts
│   │   │   │   └── dto/
│   │   │   ├── payments/
│   │   │   ├── reminders/
│   │   │   ├── receipts/
│   │   │   ├── payment-gateways/
│   │   │   │   ├── stripe.adapter.ts
│   │   │   │   └── razorpay.adapter.ts
│   │   │   └── shared/
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── auth-service/
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── shared/
│       └── database/
│           ├── migrations/
│           └── seeds/
│
├── mobile/
│   ├── android/
│   ├── ios/
│   ├── lib/
│   │   ├── main.dart
│   │   ├── app.dart
│   │   ├── core/
│   │   │   ├── constants/
│   │   │   ├── theme/
│   │   │   │   ├── app_theme.dart
│   │   │   │   └── colors.dart
│   │   │   ├── utils/
│   │   │   └── config/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── data/
│   │   │   │   ├── domain/
│   │   │   │   └── presentation/
│   │   │   ├── communication/
│   │   │   │   ├── data/
│   │   │   │   ├── domain/
│   │   │   │   └── presentation/
│   │   │   │       ├── screens/
│   │   │   │       │   ├── notifications_screen.dart
│   │   │   │       │   ├── announcements_screen.dart
│   │   │   │       │   ├── homework_screen.dart
│   │   │   │       │   ├── media_gallery_screen.dart
│   │   │   │       │   └── calendar_screen.dart
│   │   │   │       └── widgets/
│   │   │   ├── expense/
│   │   │   │   ├── data/
│   │   │   │   ├── domain/
│   │   │   │   └── presentation/
│   │   │   │       ├── screens/
│   │   │   │       │   ├── expense_list_screen.dart
│   │   │   │       │   ├── add_expense_screen.dart
│   │   │   │       │   └── expense_reports_screen.dart
│   │   │   │       └── widgets/
│   │   │   ├── fee/
│   │   │   │   ├── data/
│   │   │   │   ├── domain/
│   │   │   │   └── presentation/
│   │   │   │       ├── screens/
│   │   │   │       │   ├── invoices_screen.dart
│   │   │   │       │   ├── payment_screen.dart
│   │   │   │       │   └── receipts_screen.dart
│   │   │   │       └── widgets/
│   │   │   └── home/
│   │   │       ├── data/
│   │   │       ├── domain/
│   │   │       └── presentation/
│   │   ├── shared/
│   │   │   ├── widgets/
│   │   │   ├── models/
│   │   │   └── services/
│   │   │       ├── api_service.dart
│   │   │       ├── notification_service.dart
│   │   │       └── storage_service.dart
│   │   └── routes/
│   │       └── app_router.dart
│   ├── test/
│   ├── pubspec.yaml
│   ├── analysis_options.yaml
│   └── README.md
│
├── web-admin/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── store/
│   │   ├── services/
│   │   └── theme/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
├── infrastructure/
│   ├── kubernetes/
│   │   ├── api-gateway/
│   │   ├── communication-service/
│   │   ├── expense-service/
│   │   └── fee-service/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── monitoring/
│       ├── prometheus/
│       └── grafana/
│
└── docs/
    ├── api/
    │   ├── communication-api.md
    │   ├── expense-api.md
    │   └── fee-api.md
    ├── deployment/
    │   ├── docker-setup.md
    │   ├── kubernetes-setup.md
    │   └── cloud-deployment.md
    ├── development/
    │   ├── getting-started.md
    │   ├── coding-standards.md
    │   └── testing-guide.md
    └── user-guide/
        ├── admin-guide.md
        ├── teacher-guide.md
        └── parent-guide.md
```

## Module Breakdown

### 1. Communication Service

#### Endpoints
```
POST   /api/v1/notifications          - Send notification
GET    /api/v1/notifications          - Get notifications
PUT    /api/v1/notifications/:id/read - Mark as read
DELETE /api/v1/notifications/:id      - Delete notification

POST   /api/v1/announcements          - Create announcement
GET    /api/v1/announcements          - List announcements
GET    /api/v1/announcements/:id      - Get announcement details
PUT    /api/v1/announcements/:id      - Update announcement
DELETE /api/v1/announcements/:id      - Delete announcement

POST   /api/v1/homework               - Create homework
GET    /api/v1/homework               - List homework
GET    /api/v1/homework/:id           - Get homework details
PUT    /api/v1/homework/:id           - Update homework
DELETE /api/v1/homework/:id           - Delete homework

POST   /api/v1/media                  - Upload media
GET    /api/v1/media                  - List media
GET    /api/v1/media/:id              - Get media details
DELETE /api/v1/media/:id              - Delete media

POST   /api/v1/calendar-events        - Create event
GET    /api/v1/calendar-events        - List events
GET    /api/v1/calendar-events/:id    - Get event details
PUT    /api/v1/calendar-events/:id    - Update event
DELETE /api/v1/calendar-events/:id    - Delete event
```

#### Database Tables
- `notifications`
- `announcements`
- `homework`
- `homework_attachments`
- `media_gallery`
- `calendar_events`

### 2. Expense Service

#### Endpoints
```
POST   /api/v1/expenses               - Create expense
GET    /api/v1/expenses               - List expenses
GET    /api/v1/expenses/:id           - Get expense details
PUT    /api/v1/expenses/:id           - Update expense
DELETE /api/v1/expenses/:id           - Delete expense

GET    /api/v1/expense-categories     - List categories
POST   /api/v1/expense-categories     - Create custom category

POST   /api/v1/remittances            - Record remittance
GET    /api/v1/remittances            - List remittances

GET    /api/v1/reports/expenses       - Get expense reports
GET    /api/v1/reports/summary        - Get summary report
```

#### Database Tables
- `expenses`
- `expense_categories`
- `expense_receipts`
- `remittances`

### 3. Fee Service

#### Endpoints
```
POST   /api/v1/invoices               - Create invoice
GET    /api/v1/invoices               - List invoices
GET    /api/v1/invoices/:id           - Get invoice details
PUT    /api/v1/invoices/:id           - Update invoice
DELETE /api/v1/invoices/:id           - Delete invoice

POST   /api/v1/payments               - Process payment
GET    /api/v1/payments               - List payments
GET    /api/v1/payments/:id           - Get payment details

POST   /api/v1/payments/webhook       - Payment gateway webhook

GET    /api/v1/receipts               - List receipts
GET    /api/v1/receipts/:id           - Download receipt PDF

GET    /api/v1/reports/fee-collection - Fee collection report
GET    /api/v1/reports/pending-fees   - Pending fees report
```

#### Database Tables
- `students`
- `fee_structures`
- `invoices`
- `invoice_items`
- `payments`
- `payment_transactions`
- `receipts`
- `payment_reminders`

### 4. Auth Service

#### Endpoints
```
POST   /api/v1/auth/register          - Register user
POST   /api/v1/auth/login             - Login
POST   /api/v1/auth/logout            - Logout
POST   /api/v1/auth/refresh           - Refresh token
POST   /api/v1/auth/forgot-password   - Forgot password
POST   /api/v1/auth/reset-password    - Reset password
GET    /api/v1/auth/profile           - Get user profile
PUT    /api/v1/auth/profile           - Update user profile
```

#### Database Tables
- `users`
- `roles`
- `permissions`
- `user_roles`
- `sessions`

## Development Workflow

### Initial Setup
1. Clone repository
2. Install dependencies
3. Setup environment variables
4. Run Docker Compose
5. Run migrations
6. Seed database
7. Start development servers

### Development
1. Create feature branch
2. Develop and test locally
3. Write unit tests
4. Write integration tests
5. Create pull request
6. Code review
7. Merge to main
8. Auto-deploy to staging

### Testing
```bash
# Backend
cd backend/communication-service
npm test                    # Unit tests
npm run test:e2e           # Integration tests
npm run test:cov           # Coverage

# Mobile (Flutter)
cd mobile
flutter test                    # Unit tests
flutter test integration_test   # Integration tests
```

### Deployment
```bash
# Build Docker images
docker-compose build

# Push to registry
docker-compose push

# Deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/
```

## Environment Variables

### Backend Services
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/crp_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d

# Communication Service
FCM_SERVER_KEY=your-fcm-key
SENDGRID_API_KEY=your-sendgrid-key
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Fee Service
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

### Mobile App
```env
API_BASE_URL=https://api.crp.school
FCM_SENDER_ID=your-sender-id
GOOGLE_MAPS_API_KEY=your-maps-key
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Run linting
      - Run tests
      - Generate coverage report

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - Build Docker images
      - Push to registry

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - Deploy to staging
      - Run smoke tests
      - Deploy to production (manual approval)
```

## Monitoring and Logging

### Metrics to Track
- API response times
- Error rates
- Database query performance
- Cache hit rates
- Payment success rates
- User engagement
- Mobile app crashes

### Alerts
- API downtime
- High error rates
- Failed payments
- Database connection issues
- Low disk space
- High CPU/Memory usage

## Security Checklist

- [ ] HTTPS/TLS enabled
- [ ] JWT tokens with short expiry
- [ ] Rate limiting on APIs
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure password hashing (bcrypt)
- [ ] MFA for admin accounts
- [ ] PCI DSS compliance for payments
- [ ] GDPR compliance for data
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Environment variables secured
- [ ] Database backups automated

## Next Steps

1. ✅ Create project structure
2. ⬜ Initialize backend services
3. ⬜ Setup database schemas
4. ⬜ Implement authentication service
5. ⬜ Implement communication service
6. ⬜ Implement expense service
7. ⬜ Implement fee service
8. ⬜ Create mobile app foundation
9. ⬜ Integrate services with mobile app
10. ⬜ Testing and refinement
