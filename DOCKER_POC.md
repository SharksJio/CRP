# Docker POC - Quick Start Guide

## Overview
This is a Proof of Concept (POC) implementation of the CRP PreSchool Management System running on Docker. This setup allows you to test the system locally before migrating to production cloud infrastructure.

## What's Included

### Services:
- ✅ **PostgreSQL Database** - Pre-initialized with schema and sample data
- ✅ **Redis Cache** - For session management and caching
- ✅ **Auth Service** - User authentication and authorization (Port 3004)
- ✅ **Communication Service** - Notifications and announcements (Port 3001)
- ✅ **Prometheus** - Metrics collection (Port 9090)
- ✅ **Grafana** - Monitoring dashboards (Port 3005)
- ⚙️ **pgAdmin** - Database management UI (Port 5050) - Dev profile only
- ⚙️ **Redis Commander** - Redis management UI (Port 8081) - Dev profile only

### Sample Data:
- Default School: "Demo PreSchool"
- Admin User: `admin@demopreschool.com` / `Admin@123`

## Prerequisites

- **Docker Desktop** (v20.10+) - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2.0+) - Usually included with Docker Desktop
- **Git** - [Install Git](https://git-scm.com/downloads)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/SharksJio/CRP.git
cd CRP
```

### 2. Setup Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# For POC, you can use the defaults or customize as needed
# Edit .env if you want to change any settings
```

### 3. Start the POC Services

#### Start Core Services Only (Recommended for first test):
```bash
# Start database and cache
docker-compose up -d postgres redis

# Wait 10 seconds for database to initialize
sleep 10

# Start application services
docker-compose up -d auth-service communication-service

# Check service status
docker-compose ps
```

#### Start All Services (Including Monitoring):
```bash
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Start with Development Tools:
```bash
# Includes pgAdmin and Redis Commander
docker-compose --profile dev up -d
```

### 4. Verify Services are Running

Check service health:
```bash
# Auth Service
curl http://localhost:3004/health

# Communication Service
curl http://localhost:3001/health

# Check all services
docker-compose ps
```

Expected output for each health check:
```json
{
  "service": "auth-service",
  "status": "healthy",
  "timestamp": "2025-12-30T17:45:00.000Z"
}
```

## Testing the POC

### Test 1: User Registration
```bash
curl -X POST http://localhost:3004/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@demo.com",
    "password": "Test@123",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "teacher"
  }'
```

### Test 2: User Login
```bash
curl -X POST http://localhost:3004/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demopreschool.com",
    "password": "Admin@123"
  }'
```

Save the `token` from the response for authenticated requests.

### Test 3: Get User Profile (Authenticated)
```bash
# Replace YOUR_TOKEN with the token from login
curl http://localhost:3004/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 4: Create a Notification
```bash
curl -X POST http://localhost:3001/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "00000000-0000-0000-0000-000000000001",
    "userId": "00000000-0000-0000-0000-000000000002",
    "type": "alert",
    "title": "Welcome to CRP!",
    "message": "Your school management system is ready.",
    "priority": "high"
  }'
```

### Test 5: Get Notifications
```bash
curl "http://localhost:3001/api/v1/notifications?schoolId=00000000-0000-0000-0000-000000000001&limit=10"
```

### Test 6: Create an Announcement
```bash
curl -X POST http://localhost:3001/api/v1/announcements \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "00000000-0000-0000-0000-000000000001",
    "createdBy": "00000000-0000-0000-0000-000000000002",
    "title": "School Holiday Notice",
    "content": "School will be closed on January 1st for New Year.",
    "targetAudience": "all",
    "isPublished": true
  }'
```

## Access Web Interfaces

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3005 (admin/admin)
- **pgAdmin** (dev profile): http://localhost:5050 (admin@crp.local/admin)
- **Redis Commander** (dev profile): http://localhost:8081

## Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service

# Last 100 lines
docker-compose logs --tail=100 auth-service
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart auth-service
```

### Stop Services
```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything (including volumes/data)
docker-compose down -v
```

### Database Access
```bash
# Connect to PostgreSQL
docker exec -it crp_postgres psql -U postgres -d crp_preschool

# Common SQL commands
\dt                    # List all tables
\d users              # Describe users table
SELECT * FROM users;  # Query users
\q                    # Exit
```

### Redis Access
```bash
# Connect to Redis
docker exec -it crp_redis redis-cli

# Common commands
KEYS *               # List all keys
GET key             # Get value
PING                # Test connection
exit                # Exit
```

## Troubleshooting

### Issue: Port Already in Use
```bash
# Check what's using the port
lsof -i :3004  # On Mac/Linux
netstat -ano | findstr :3004  # On Windows

# Change port in docker-compose.yml or stop the conflicting service
```

### Issue: Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Issue: Service Won't Start
```bash
# Check logs for errors
docker-compose logs <service-name>

# Rebuild the service
docker-compose build --no-cache <service-name>
docker-compose up -d <service-name>
```

### Issue: Out of Disk Space
```bash
# Clean up unused Docker resources
docker system prune -a

# Remove all stopped containers
docker container prune

# Remove unused volumes
docker volume prune
```

## Reset Everything

If you want to start fresh:
```bash
# Stop and remove everything
docker-compose down -v

# Remove Docker images
docker-compose down --rmi all

# Start fresh
docker-compose up -d
```

## Performance Notes

For POC/Development:
- Database: Single instance (not HA)
- No horizontal scaling
- Local storage (Docker volumes)
- Suitable for 1-10 concurrent users

For Production:
- See `CLOUD_MIGRATION.md` for cloud deployment
- Use managed services (RDS, ElastiCache)
- Implement load balancing and auto-scaling
- Use S3/Cloudinary for media storage

## Next Steps

1. ✅ Test all API endpoints
2. ✅ Verify data persistence (restart containers)
3. ✅ Review logs for any errors
4. 📝 Review `CLOUD_MIGRATION.md` for production deployment
5. 🚀 Plan migration to AWS/GCP/Azure

## API Documentation

Once services are running, API documentation will be available at:
- Auth Service: http://localhost:3004/
- Communication Service: http://localhost:3001/

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review documentation in the repo
- Create an issue on GitHub

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │              │  │              │  │              │ │
│  │ Auth Service │  │ Comm Service │  │   Future     │ │
│  │   :3004      │  │   :3001      │  │   Services   │ │
│  │              │  │              │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │          │
│         └────────┬────────┴────────┬────────┘          │
│                  │                 │                   │
│         ┌────────▼─────┐  ┌────────▼─────┐            │
│         │              │  │              │            │
│         │  PostgreSQL  │  │    Redis     │            │
│         │    :5432     │  │    :6379     │            │
│         │              │  │              │            │
│         └──────────────┘  └──────────────┘            │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │              │  │              │                  │
│  │  Prometheus  │  │   Grafana    │                  │
│  │    :9090     │  │    :3005     │                  │
│  │              │  │              │                  │
│  └──────────────┘  └──────────────┘                  │
│                                                        │
└─────────────────────────────────────────────────────────┘
```

---

**Document Version**: 1.0  
**Last Updated**: December 30, 2025  
**Status**: Ready for Testing
