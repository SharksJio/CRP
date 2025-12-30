#!/bin/bash

# CRP Docker POC Test Script
# This script tests all the services in the Docker POC

set -e

echo "🧪 CRP Docker POC Test Suite"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URLs
AUTH_URL="http://localhost:3004"
COMM_URL="http://localhost:3001"

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=${4:-}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "📋 Step 1: Testing Service Health Checks"
echo "----------------------------------------"
test_endpoint "Auth Service Health" "$AUTH_URL/health"
test_endpoint "Communication Service Health" "$COMM_URL/health"
echo ""

echo "📋 Step 2: Testing Authentication Endpoints"
echo "----------------------------------------"

# Test registration
REGISTER_DATA='{
  "email": "test_'$(date +%s)'@demo.com",
  "password": "Test@123",
  "firstName": "Test",
  "lastName": "User",
  "role": "parent"
}'

echo -n "Testing User Registration... "
response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$REGISTER_DATA" "$AUTH_URL/api/v1/auth/register" 2>/dev/null)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    PASSED=$((PASSED + 1))
    TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    FAILED=$((FAILED + 1))
    TOKEN=""
fi

# Test login with default admin
LOGIN_DATA='{
  "email": "admin@demopreschool.com",
  "password": "Admin@123"
}'

echo -n "Testing User Login (Admin)... "
response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$LOGIN_DATA" "$AUTH_URL/api/v1/auth/login" 2>/dev/null)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    PASSED=$((PASSED + 1))
    ADMIN_TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    FAILED=$((FAILED + 1))
    ADMIN_TOKEN=""
fi

# Test profile with token
if [ -n "$ADMIN_TOKEN" ]; then
    echo -n "Testing Get Profile (Authenticated)... "
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$AUTH_URL/api/v1/auth/profile" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        FAILED=$((FAILED + 1))
    fi
fi

echo ""

echo "📋 Step 3: Testing Communication Service"
echo "----------------------------------------"

# Test create notification
NOTIFICATION_DATA='{
  "schoolId": "00000000-0000-0000-0000-000000000001",
  "userId": "00000000-0000-0000-0000-000000000002",
  "type": "alert",
  "title": "POC Test Notification",
  "message": "This is a test notification from the POC test script.",
  "priority": "normal"
}'

test_endpoint "Create Notification" "$COMM_URL/api/v1/notifications" "POST" "$NOTIFICATION_DATA"
test_endpoint "Get Notifications" "$COMM_URL/api/v1/notifications?schoolId=00000000-0000-0000-0000-000000000001&limit=10"

# Test create announcement
ANNOUNCEMENT_DATA='{
  "schoolId": "00000000-0000-0000-0000-000000000001",
  "createdBy": "00000000-0000-0000-0000-000000000002",
  "title": "POC Test Announcement",
  "content": "This is a test announcement from the POC test script.",
  "targetAudience": "all",
  "isPublished": true
}'

test_endpoint "Create Announcement" "$COMM_URL/api/v1/announcements" "POST" "$ANNOUNCEMENT_DATA"
test_endpoint "Get Announcements" "$COMM_URL/api/v1/announcements?schoolId=00000000-0000-0000-0000-000000000001&limit=10"

echo ""

echo "📋 Step 4: Testing Database Connectivity"
echo "----------------------------------------"
echo -n "Testing PostgreSQL Connection... "
if docker exec crp_postgres psql -U postgres -d crp_preschool -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC}"
    FAILED=$((FAILED + 1))
fi

echo -n "Testing Redis Connection... "
if docker exec crp_redis redis-cli PING | grep -q PONG; then
    echo -e "${GREEN}✓ PASSED${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""

# Summary
echo "=============================="
echo "📊 Test Summary"
echo "=============================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! POC is working correctly.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the logs.${NC}"
    echo ""
    echo "Troubleshooting tips:"
    echo "1. Check if all services are running: docker-compose ps"
    echo "2. View service logs: docker-compose logs -f"
    echo "3. Restart services: docker-compose restart"
    exit 1
fi
