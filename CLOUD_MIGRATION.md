# Cloud Migration Guide: Docker POC to Production

## Overview
This guide outlines the migration path from the Docker POC environment to production cloud infrastructure using AWS services (or equivalent cloud providers).

## Current Architecture (Docker POC)

### Services Running in Docker:
- **PostgreSQL**: Database (port 5432)
- **Redis**: Cache and session store (port 6379)
- **Auth Service**: Authentication & authorization (port 3004)
- **Communication Service**: Notifications & announcements (port 3001)
- **Prometheus**: Metrics collection (port 9090)
- **Grafana**: Monitoring dashboards (port 3005)

### File Storage:
- Currently using Docker volumes for data persistence
- Media files stored locally in containers

## Production Cloud Architecture

### Phase 1: Lift and Shift (Quick Migration)

#### Infrastructure Services:
1. **Database**: Migrate to managed database
   - **AWS**: Amazon RDS for PostgreSQL
   - **GCP**: Cloud SQL for PostgreSQL
   - **Azure**: Azure Database for PostgreSQL
   - Benefits: Automated backups, high availability, automatic scaling

2. **Cache**: Migrate to managed Redis
   - **AWS**: Amazon ElastiCache for Redis
   - **GCP**: Memorystore for Redis
   - **Azure**: Azure Cache for Redis
   - Benefits: Automatic failover, clustering, monitoring

3. **Container Orchestration**: Deploy to Kubernetes or ECS
   - **AWS**: Amazon ECS or EKS
   - **GCP**: Google Kubernetes Engine (GKE)
   - **Azure**: Azure Kubernetes Service (AKS)

4. **Load Balancer**:
   - **AWS**: Application Load Balancer (ALB)
   - **GCP**: Cloud Load Balancing
   - **Azure**: Azure Load Balancer

#### Media Storage Migration:

**AWS S3 Implementation:**
```typescript
// Install AWS SDK
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

// Configuration in .env
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=crp-preschool-media
AWS_S3_ACCESS_KEY_ID=your_access_key
AWS_S3_SECRET_ACCESS_KEY=your_secret_key

// Upload service
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

async function uploadToS3(file: Buffer, key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
  });
  
  return await s3Client.send(command);
}
```

**Alternative: Cloudinary (Easier for POC)**
```typescript
// Install Cloudinary
npm install cloudinary

// Configuration
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload
async function uploadToCloudinary(filePath: string) {
  return await cloudinary.uploader.upload(filePath, {
    folder: 'crp-preschool',
  });
}
```

### Phase 2: Cloud-Native Optimization

#### 1. Serverless Functions for Background Tasks
- **AWS Lambda**: For scheduled tasks (reminders, reports)
- **Event-driven processing**: S3 events, SQS queues

#### 2. Content Delivery Network (CDN)
- **AWS CloudFront** or **Cloudflare**
- Cache static assets and media
- Reduce latency for global users

#### 3. Managed Services Integration

**AWS Services Mapping:**
- **Media Storage**: S3 + CloudFront CDN
- **Database**: RDS PostgreSQL (Multi-AZ for HA)
- **Cache**: ElastiCache Redis (Cluster mode)
- **Container**: ECS Fargate or EKS
- **Secrets**: AWS Secrets Manager
- **Email**: Amazon SES
- **SMS**: Amazon SNS
- **Monitoring**: CloudWatch
- **Logging**: CloudWatch Logs
- **CI/CD**: AWS CodePipeline + CodeBuild

**GCP Services Mapping:**
- **Media Storage**: Cloud Storage + Cloud CDN
- **Database**: Cloud SQL PostgreSQL
- **Cache**: Memorystore Redis
- **Container**: GKE (Google Kubernetes Engine)
- **Secrets**: Secret Manager
- **Email**: SendGrid (partner)
- **Monitoring**: Cloud Monitoring
- **Logging**: Cloud Logging

#### 4. Auto-scaling Configuration
```yaml
# Kubernetes HPA (Horizontal Pod Autoscaler)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Migration Steps

### Step 1: Database Migration
```bash
# 1. Export data from Docker PostgreSQL
docker exec crp_postgres pg_dump -U postgres crp_preschool > backup.sql

# 2. Create RDS instance (AWS Console or CLI)
aws rds create-db-instance \
  --db-instance-identifier crp-postgres-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username postgres \
  --master-user-password <secure-password> \
  --allocated-storage 100 \
  --backup-retention-period 7 \
  --multi-az

# 3. Import data to RDS
psql -h <rds-endpoint> -U postgres -d crp_preschool < backup.sql

# 4. Update environment variables
DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>:5432/crp_preschool
```

### Step 2: Setup S3 for Media Storage
```bash
# 1. Create S3 bucket
aws s3 mb s3://crp-preschool-media --region us-east-1

# 2. Configure bucket policy for public read (for media)
aws s3api put-bucket-policy --bucket crp-preschool-media --policy file://bucket-policy.json

# 3. Enable CORS
aws s3api put-bucket-cors --bucket crp-preschool-media --cors-configuration file://cors.json

# 4. Update application code to use S3
# See code examples above
```

### Step 3: Container Deployment
```bash
# Using AWS ECS with Fargate

# 1. Build and push Docker images to ECR
aws ecr create-repository --repository-name crp-auth-service
docker build -t crp-auth-service ./backend/auth-service
docker tag crp-auth-service:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/crp-auth-service:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/crp-auth-service:latest

# 2. Create ECS cluster
aws ecs create-cluster --cluster-name crp-cluster

# 3. Create task definitions (JSON files)
# 4. Create services with load balancer
# 5. Configure auto-scaling
```

### Step 4: DNS and SSL
```bash
# 1. Setup Route 53 (or your DNS provider)
# 2. Create ACM certificate
aws acm request-certificate \
  --domain-name api.crpschool.com \
  --validation-method DNS

# 3. Configure ALB to use HTTPS
```

## Cost Estimation (AWS - Monthly)

### POC/Development:
- RDS t3.micro (PostgreSQL): $15
- ElastiCache t3.micro (Redis): $12
- ECS Fargate (2 services): $30
- S3 Storage (10GB): $0.23
- Data Transfer: $5
- **Total**: ~$65/month

### Production (Small):
- RDS t3.medium (Multi-AZ): $120
- ElastiCache t3.small (Cluster): $35
- ECS Fargate (4 services, scaled): $150
- S3 Storage (100GB): $2.30
- CloudFront CDN: $20
- Data Transfer: $20
- ALB: $25
- **Total**: ~$375/month

### Production (Medium - 50 schools):
- RDS t3.large (Multi-AZ): $280
- ElastiCache r6g.large: $180
- ECS Fargate (scaled): $400
- S3 Storage (1TB): $23
- CloudFront: $100
- Data Transfer: $100
- **Total**: ~$1,200/month

## Environment Variables for Production

```bash
# Production .env
NODE_ENV=production

# Database (RDS)
DATABASE_URL=postgresql://user:pass@rds-endpoint.amazonaws.com:5432/crp_preschool

# Redis (ElastiCache)
REDIS_URL=redis://elasticache-endpoint.cache.amazonaws.com:6379

# AWS S3
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=crp-preschool-media
AWS_S3_ACCESS_KEY_ID=<from IAM>
AWS_S3_SECRET_ACCESS_KEY=<from IAM>

# Secrets
JWT_SECRET=<strong-random-secret>
ENCRYPTION_KEY=<32-char-key>

# Email (SES)
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=<ses-key>
AWS_SES_SECRET_ACCESS_KEY=<ses-secret>

# Payment Gateways
STRIPE_SECRET_KEY=sk_live_xxx
RAZORPAY_KEY_SECRET=live_xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Security Checklist

- [ ] Enable encryption at rest (RDS, S3)
- [ ] Enable encryption in transit (TLS/SSL)
- [ ] Setup VPC with private subnets
- [ ] Configure security groups (restrict access)
- [ ] Use IAM roles (not access keys where possible)
- [ ] Enable AWS GuardDuty
- [ ] Setup AWS WAF (Web Application Firewall)
- [ ] Enable CloudTrail for audit logs
- [ ] Regular security updates
- [ ] Database backup strategy (automated)
- [ ] Disaster recovery plan

## Monitoring in Production

### CloudWatch Alarms:
- Database CPU > 80%
- Memory utilization > 80%
- Application errors rate
- API latency > 2s
- Failed login attempts > 10/min

### Logging Strategy:
- Centralized logging (CloudWatch Logs or ELK)
- Application logs: Info, Error, Debug
- Access logs: All API requests
- Database slow query logs
- Security events

## Rollback Plan

1. Keep Docker POC running during initial migration
2. Use blue-green deployment strategy
3. Database backup before migration
4. DNS switch with low TTL (5 minutes)
5. Immediate rollback if critical issues

## Next Steps

1. **Immediate** (Week 1):
   - Setup AWS account
   - Create RDS PostgreSQL instance
   - Setup S3 bucket for media
   - Configure environment variables

2. **Short-term** (Week 2-3):
   - Deploy containers to ECS/EKS
   - Migrate data from Docker
   - Setup monitoring and alerts
   - Load testing

3. **Medium-term** (Month 2):
   - Implement auto-scaling
   - Setup CI/CD pipeline
   - Performance optimization
   - Cost optimization

4. **Long-term** (Month 3+):
   - Multi-region deployment
   - Advanced monitoring
   - Disaster recovery testing
   - Regular security audits

## Support Resources

- **AWS Support**: https://aws.amazon.com/support/
- **Documentation**: Available in `/docs` folder
- **Team Contact**: devops@crpschool.com

---

**Document Version**: 1.0  
**Last Updated**: December 30, 2025  
**Author**: CRP Development Team
