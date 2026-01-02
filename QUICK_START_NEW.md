# Quick Start Guide - Kitties powered by Droidminnds Management System

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available for Docker
- Ports 3001-3004, 5432, 6379, 8080 available

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone and Navigate

```bash
cd /path/to/CRP
```

### Step 2: Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker compose up -d postgres redis

# Wait for database to initialize (30 seconds)
sleep 30

# Verify database is ready
docker compose logs postgres | grep "database system is ready"
```

### Step 3: Start Backend Services

```bash
# Build and start all backend services
docker compose up -d --build auth-service communication-service expense-service fee-service

# Wait for services to start
sleep 20

# Check service health
curl http://localhost:3004/health  # Auth Service
curl http://localhost:3001/health  # Communication Service
curl http://localhost:3002/health  # Expense Service
curl http://localhost:3003/health  # Fee Service
```

### Step 4: Start Web Admin

```bash
# Build and start web admin
docker compose up -d --build web-admin

# Wait for Next.js to build
sleep 30

# Open in browser
open http://localhost:8080
```

### Step 5: Login

Use these demo credentials:
- **Email**: `admin@demopreschool.com`
- **Password**: `Admin@123`

## 📊 What You Get

After login, you'll have access to:

1. **Dashboard** - Overview of your preschool management system
2. **Communication** - Send notifications and announcements
3. **Expenses** - Track and manage school expenses
4. **Fee Management** - Create invoices and record payments

## 🧪 Testing the Application

### 1. Test Communication Module

```bash
# Navigate to Communication in the web app
# OR test via API:

curl -X POST http://localhost:3001/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "00000000-0000-0000-0000-000000000001",
    "userId": "00000000-0000-0000-0000-000000000002",
    "type": "general",
    "title": "Welcome Message",
    "message": "Welcome to Kitties powered by Droidminnds Management System!",
    "priority": "normal"
  }'
```

### 2. Test Expense Module

```bash
# Get expense categories
curl "http://localhost:3002/api/v1/expense-categories?schoolId=00000000-0000-0000-0000-000000000001"

# Create an expense
curl -X POST http://localhost:3002/api/v1/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "00000000-0000-0000-0000-000000000001",
    "categoryId": "<use-id-from-above>",
    "amount": 250.50,
    "description": "Office supplies purchase",
    "expenseDate": "2025-12-30"
  }'
```

### 3. Test Fee Module

First, create a student (you'll need this for invoices):

```bash
# Create a student
docker exec crp_postgres psql -U postgres -d crp_preschool -c "
INSERT INTO students (school_id, parent_id, first_name, last_name, date_of_birth, enrollment_date)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'John',
  'Doe',
  '2020-01-15',
  '2025-01-01'
) RETURNING id;"
```

Then create an invoice and payment:

```bash
# Create invoice (use student ID from above)
curl -X POST http://localhost:3003/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "00000000-0000-0000-0000-000000000001",
    "studentId": "<student-id>",
    "amount": 500.00,
    "dueDate": "2025-01-31",
    "notes": "Monthly tuition fee"
  }'

# Record payment (use invoice ID from above)
curl -X POST http://localhost:3003/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "<invoice-id>",
    "amount": 500.00,
    "paymentMethod": "card",
    "transactionId": "TXN123456"
  }'
```

## 🛠️ Development Mode

For local development without Docker:

### Backend Services

```bash
# Terminal 1 - Auth Service
cd backend/auth-service
npm install
npm run start:dev

# Terminal 2 - Communication Service
cd backend/communication-service
npm install
npm run start:dev

# Terminal 3 - Expense Service
cd backend/expense-service
npm install
npm run start:dev

# Terminal 4 - Fee Service
cd backend/fee-service
npm install
npm run start:dev
```

### Web Admin

```bash
# Terminal 5 - Web Admin
cd web-admin
npm install
npm run dev
```

Update your local `.env` file to point to `localhost` instead of Docker service names:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crp_preschool
REDIS_URL=redis://localhost:6379
```

## 📋 Available Commands

### Docker Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f [service-name]

# Restart a service
docker compose restart [service-name]

# Rebuild a service
docker compose up -d --build [service-name]

# View running containers
docker compose ps

# Access database
docker exec -it crp_postgres psql -U postgres -d crp_preschool
```

### Service URLs

- **Web Admin**: http://localhost:8080
- **Auth Service**: http://localhost:3004
- **Communication Service**: http://localhost:3001
- **Expense Service**: http://localhost:3002
- **Fee Service**: http://localhost:3003
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🐛 Troubleshooting

### Services won't start

```bash
# Check if ports are available
lsof -i :8080  # Web Admin
lsof -i :3001-3004  # Backend Services
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Stop conflicting services or change ports in docker-compose.yml
```

### Database connection errors

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres

# Verify database exists
docker exec crp_postgres psql -U postgres -l
```

### Service build errors

```bash
# Clean build
docker compose down -v
docker system prune -f
docker compose build --no-cache
docker compose up -d
```

### Web Admin won't load

```bash
# Check build logs
docker compose logs web-admin

# Rebuild web admin
docker compose up -d --build web-admin

# Check if it's accessible
curl http://localhost:8080
```

## 📝 Next Steps

1. **Explore the Application**: Try creating notifications, expenses, and invoices through the web interface
2. **Review Documentation**: Read `IMPLEMENTATION_COMPLETE.md` for detailed information
3. **Customize**: Update configurations in `.env` file
4. **Develop**: Add new features or customize existing ones
5. **Deploy**: Follow `CLOUD_MIGRATION.md` for production deployment

## 🔒 Security Reminders

⚠️ **Before going to production**:

1. Change the default admin password
2. Generate new JWT secrets (use `openssl rand -base64 32`)
3. Set up proper CORS origins
4. Enable HTTPS
5. Review `SECURITY.md`

## 🎓 Learning Resources

- **Next.js**: https://nextjs.org/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Docker**: https://docs.docker.com/
- **TypeScript**: https://www.typescriptlang.org/docs/

## 📞 Support

- Documentation: See `docs/` folder
- API Reference: `IMPLEMENTATION_COMPLETE.md`
- Security: `SECURITY.md`
- Cloud Migration: `CLOUD_MIGRATION.md`

---

**Happy Coding! 🚀**

For questions or issues, check the logs and documentation first.
