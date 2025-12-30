# Quick Test Instructions for Docker POC

## What's Working Right Now

✅ **Database (PostgreSQL)**: Running and initialized with full schema + sample data
✅ **Cache (Redis)**: Running and healthy
✅ **Test Script**: Available for automated testing

## Current Status

The POC infrastructure (database and cache) is fully operational. The application services (Auth and Communication) are code-complete but require building with npm dependencies.

## To Test Database and Schema

### 1. Check Running Services
```bash
docker compose ps
```

You should see:
- `crp_postgres` - healthy
- `crp_redis` - healthy

### 2. Verify Database Tables
```bash
docker exec crp_postgres psql -U postgres -d crp_preschool -c "\dt"
```

Expected: 15 tables listed (schools, users, notifications, etc.)

### 3. Check Sample Data
```bash
# View default school
docker exec crp_postgres psql -U postgres -d crp_preschool -c "SELECT * FROM schools;"

# View default admin user
docker exec crp_postgres psql -U postgres -d crp_preschool -c "SELECT email, first_name, last_name, role FROM users;"
```

Default credentials:
- **Email**: admin@demopreschool.com
- **Password**: Admin@123 (hash stored in DB)
- **School ID**: 00000000-0000-0000-0000-000000000001

### 4. Test Redis
```bash
docker exec crp_redis redis-cli PING
```

Expected output: `PONG`

## To Build and Run Application Services

The Auth and Communication services are ready to build. To run them:

### Option 1: Build Locally (Requires Node.js)
```bash
# Auth Service
cd backend/auth-service
npm install
npm run build
npm start

# Communication Service
cd backend/communication-service
npm install
npm run build
npm start
```

### Option 2: Build with Docker
```bash
# This will build the Docker images and start all services
docker compose up -d --build auth-service communication-service
```

Note: Building may take a few minutes as it downloads Node.js dependencies.

## API Endpoints (Once Services are Running)

### Auth Service (Port 3004)
- `GET /health` - Health check
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile` - Get profile (requires token)

### Communication Service (Port 3001)
- `GET /health` - Health check
- `GET /api/v1/notifications` - List notifications
- `POST /api/v1/notifications` - Create notification
- `GET /api/v1/announcements` - List announcements
- `POST /api/v1/announcements` - Create announcement

## Database Schema Highlights

### Core Tables:
- **schools**: Preschool organizations
- **users**: Admin, teachers, parents (with roles)
- **students**: Student records linked to parents

### Communication Module:
- **notifications**: Push/email notifications
- **announcements**: School-wide announcements
- **homework**: Homework assignments
- **media_gallery**: Photos and videos
- **calendar_events**: School calendar

### Expense Module:
- **expenses**: Daily expenses
- **expense_categories**: Custom categories
- **remittances**: Bank transfers

### Fee Module:
- **invoices**: Fee invoices
- **payments**: Payment transactions
- **payment_receipts**: Receipt generation
- **payment_reminders**: Automated reminders

## Cleanup

To stop and remove all services:
```bash
docker compose down
```

To remove everything including volumes (database data):
```bash
docker compose down -v
```

## Next Steps

1. ✅ Database and cache infrastructure is ready
2. 🔨 Build application services (requires npm install)
3. 🧪 Run automated tests with `./test-poc.sh`
4. 📱 Begin Flutter mobile app development
5. ☁️ Plan cloud migration using `CLOUD_MIGRATION.md`

## Documentation References

- **DOCKER_POC.md** - Complete POC setup guide
- **CLOUD_MIGRATION.md** - AWS/Cloud migration strategy
- **IMPLEMENTATION_GUIDE.md** - What's been implemented
- **DATABASE_SCHEMA.md** - Complete database documentation
- **ARCHITECTURE.md** - System architecture

## Technical Details

### Technologies:
- **Database**: PostgreSQL 15 with UUID support
- **Cache**: Redis 7 with persistence
- **Backend**: Node.js 18 + TypeScript + Express
- **Authentication**: JWT + bcrypt

### Sample Data Included:
- 1 School (Demo PreSchool)
- 1 Admin user (admin@demopreschool.com)
- 4 Expense categories (Utilities, Supplies, Salaries, Maintenance)

### Database Features:
- UUID primary keys
- Foreign key relationships
- Indexes for performance
- Timestamps on all tables
- Role-based user types

---

**Status**: Infrastructure ✅ | Application Services 🔨 | Testing 🧪  
**Last Updated**: December 30, 2025
