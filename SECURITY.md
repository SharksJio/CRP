# Security Notes for Production Deployment

## ⚠️ IMPORTANT: POC vs Production Security

This Docker POC includes several default values and configurations that are **ONLY SUITABLE FOR DEVELOPMENT/TESTING**. 

**DO NOT USE THESE IN PRODUCTION WITHOUT CHANGES!**

## Critical Security Items to Address Before Production

### 1. Default Admin Account

**Issue**: Default admin user with known credentials
- Email: `admin@demopreschool.com`
- Password: `Admin@123`

**Action Required**:
```sql
-- After creating your own admin account, delete the default one:
DELETE FROM users WHERE email = 'admin@demopreschool.com';

-- Or change the password:
UPDATE users 
SET password_hash = '$2b$12$YOUR_NEW_BCRYPT_HASH' 
WHERE email = 'admin@demopreschool.com';
```

### 2. JWT Secret

**Issue**: Application will fail to start if `JWT_SECRET` is not provided (security by design).

**Action Required**:
```bash
# Generate a strong random secret (32+ characters)
openssl rand -base64 32

# Add to .env file:
JWT_SECRET=your_generated_random_secret_here
JWT_REFRESH_SECRET=another_generated_secret_here
```

**Never use default values in production!**

### 3. Database Credentials

**Issue**: Default PostgreSQL credentials in docker-compose.yml

**Action Required**:
```bash
# In .env file, use strong passwords:
DATABASE_USER=your_db_user
DATABASE_PASSWORD=strong_random_password_min_16_chars
DATABASE_NAME=crp_preschool_prod

# Or use managed database service (RDS, Cloud SQL)
DATABASE_URL=postgresql://user:pass@rds-endpoint.aws.com:5432/dbname
```

### 4. CORS Configuration

**Issue**: docker-compose.yml has permissive CORS settings for development

**Action Required**:
```bash
# In production .env:
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
# Do NOT use * in production
```

### 5. API Keys and Secrets

**Issue**: Many API keys use defaults or placeholders

**Action Required**:
- [ ] Firebase/FCM credentials
- [ ] SendGrid/Email service API keys
- [ ] Cloudinary/S3 credentials
- [ ] Payment gateway keys (Stripe, Razorpay)
- [ ] All third-party service credentials

**Use environment variables or secret management service:**
```bash
# AWS Secrets Manager
aws secretsmanager create-secret --name crp/jwt-secret --secret-string "your-secret"

# Or use .env with proper file permissions
chmod 600 .env
```

### 6. TLS/SSL Certificates

**Issue**: Docker POC runs on HTTP

**Action Required**:
- Configure ALB/Load Balancer for HTTPS
- Obtain SSL certificate (ACM, Let's Encrypt)
- Redirect all HTTP to HTTPS
- Use HSTS headers

### 7. Database Encryption

**Issue**: Data stored in plain text in PostgreSQL

**Action Required**:
- Enable encryption at rest (RDS encryption)
- Use encrypted EBS volumes
- Consider column-level encryption for sensitive data
- Use pgcrypto for application-level encryption

### 8. Rate Limiting

**Issue**: No rate limiting in POC

**Action Required**:
```typescript
// Add rate limiting middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 9. Input Validation

**Issue**: Basic validation in POC

**Action Required**:
- Implement comprehensive input validation
- Use validation libraries (Joi, Yup)
- Sanitize user inputs
- Validate file uploads

```typescript
import Joi from 'joi';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
});
```

### 10. Logging and Monitoring

**Issue**: Basic console.log in POC

**Action Required**:
- Implement structured logging (Winston, Pino)
- Send logs to centralized system (CloudWatch, ELK)
- Set up security alerts
- Monitor for suspicious activity
- Log all authentication attempts
- Log all data access

## Production Security Checklist

### Before Going Live:

#### Authentication & Authorization:
- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Implement MFA for admin accounts
- [ ] Set up session timeout
- [ ] Implement account lockout after failed attempts
- [ ] Use secure password reset flow

#### Network Security:
- [ ] Use HTTPS everywhere
- [ ] Configure firewall rules
- [ ] Use private subnets for database
- [ ] Implement VPC peering if needed
- [ ] Set up security groups properly
- [ ] Use NAT gateway for outbound traffic

#### Data Security:
- [ ] Enable encryption at rest
- [ ] Enable encryption in transit
- [ ] Implement backup strategy
- [ ] Test disaster recovery
- [ ] Implement data retention policies
- [ ] Consider GDPR/COPPA compliance

#### Application Security:
- [ ] Enable CSRF protection
- [ ] Implement XSS protection
- [ ] Use parameterized queries (already done)
- [ ] Validate all inputs
- [ ] Sanitize outputs
- [ ] Implement rate limiting
- [ ] Set security headers

#### Infrastructure Security:
- [ ] Keep all software updated
- [ ] Use least privilege principle
- [ ] Rotate credentials regularly
- [ ] Use IAM roles instead of keys
- [ ] Enable AWS CloudTrail / GCP audit logs
- [ ] Set up intrusion detection
- [ ] Implement WAF rules

#### Monitoring & Incident Response:
- [ ] Set up security monitoring
- [ ] Configure alerting
- [ ] Create incident response plan
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Vulnerability scanning

## Quick Security Hardening Script

```bash
#!/bin/bash
# Production security hardening checklist

echo "Production Security Hardening Checklist"
echo "========================================"

# Check for default passwords
echo "1. Checking for default passwords..."
if grep -r "Admin@123" .; then
  echo "  ❌ Default password found! Change immediately!"
else
  echo "  ✅ No default passwords found"
fi

# Check for JWT secret
if [ -z "$JWT_SECRET" ]; then
  echo "2. ❌ JWT_SECRET not set!"
else
  echo "2. ✅ JWT_SECRET is set"
fi

# Check for strong password requirements
echo "3. Verify password policy: Min 8 chars, uppercase, lowercase, number"

# Check HTTPS
echo "4. Verify HTTPS is enabled on load balancer"

# Check CORS configuration
if [[ "$CORS_ORIGIN" == "*" ]]; then
  echo "5. ❌ CORS is set to allow all origins!"
else
  echo "5. ✅ CORS is properly configured"
fi

echo ""
echo "Review complete. Address all ❌ items before going live!"
```

## Security Resources

### Tools:
- **OWASP ZAP**: Web application security scanner
- **npm audit**: Check for vulnerable dependencies
- **Snyk**: Continuous security monitoring
- **AWS Security Hub**: Centralized security alerts
- **GuardDuty**: Threat detection

### Best Practices:
- Follow OWASP Top 10
- Implement NIST Cybersecurity Framework
- Regular security training for team
- Security code reviews
- Automated security testing in CI/CD

### Compliance:
- **GDPR**: EU data protection
- **COPPA**: Children's privacy (critical for preschools!)
- **PCI DSS**: If handling credit cards
- **SOC 2**: For enterprise customers

## Incident Response Plan

### If Security Breach Occurs:

1. **Immediate Actions**:
   - Isolate affected systems
   - Preserve logs and evidence
   - Notify security team

2. **Investigation**:
   - Determine scope of breach
   - Identify compromised data
   - Find root cause

3. **Remediation**:
   - Patch vulnerabilities
   - Reset all credentials
   - Update security measures

4. **Communication**:
   - Notify affected users
   - Report to authorities if required
   - Update stakeholders

5. **Post-Incident**:
   - Document lessons learned
   - Improve security measures
   - Update response plan

## Regular Security Maintenance

### Weekly:
- Review access logs
- Check for suspicious activity
- Verify backups are working

### Monthly:
- Update dependencies
- Review user permissions
- Test backup restoration
- Security patch updates

### Quarterly:
- Security audit
- Penetration testing
- Review and update policies
- Security training

### Annually:
- Full security assessment
- Compliance audit
- Disaster recovery drill
- Update incident response plan

## Contact for Security Issues

If you discover a security vulnerability:
- **DO NOT** open a public GitHub issue
- Email: security@crpschool.com (create this!)
- Use responsible disclosure
- Allow time for patching before public disclosure

---

**Remember**: Security is not a one-time task. It's an ongoing process that requires constant attention and updates.

**Last Updated**: December 30, 2025  
**Review Schedule**: Quarterly
