# Database Schema Design

## Overview
This document defines the database schema for the Communication, Expense Management, and Fee Management modules of the CRP PreSchool Management System.

**Database**: PostgreSQL 15+
**Naming Convention**: snake_case
**Character Set**: UTF-8

## Common Tables

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'parent')),
    school_id UUID REFERENCES schools(id),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);
```

### schools
```sql
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    subscription_tier VARCHAR(50) DEFAULT 'starter',
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schools_name ON schools(name);
```

### students
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    admission_number VARCHAR(50) UNIQUE,
    class_id UUID REFERENCES classes(id),
    parent_id UUID REFERENCES users(id),
    photo_url TEXT,
    enrollment_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_admission_number ON students(admission_number);
```

### classes
```sql
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    section VARCHAR(50),
    teacher_id UUID REFERENCES users(id),
    capacity INTEGER,
    academic_year VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
```

---

## Communication Module

### notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('announcement', 'homework', 'event', 'alert', 'reminder')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    related_id UUID, -- Reference to announcement, homework, etc.
    related_type VARCHAR(50), -- Type of related entity
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    sent_via JSONB DEFAULT '{"push": true, "email": false, "sms": false}', -- Delivery channels
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_school_id ON notifications(school_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### announcements
```sql
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) CHECK (category IN ('general', 'event', 'holiday', 'emergency', 'academic')),
    target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'parents', 'teachers', 'specific')),
    target_class_ids UUID[], -- Array of class IDs for specific targeting
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_school_id ON announcements(school_id);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_is_published ON announcements(is_published);
CREATE INDEX idx_announcements_published_at ON announcements(published_at DESC);
```

### announcement_media
```sql
CREATE TABLE announcement_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'document')),
    file_name VARCHAR(255),
    file_size INTEGER, -- in bytes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcement_media_announcement_id ON announcement_media(announcement_id);
```

### homework
```sql
CREATE TABLE homework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    assigned_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_homework_school_id ON homework(school_id);
CREATE INDEX idx_homework_class_id ON homework(class_id);
CREATE INDEX idx_homework_due_date ON homework(due_date);
CREATE INDEX idx_homework_assigned_by ON homework(assigned_by);
```

### homework_attachments
```sql
CREATE TABLE homework_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homework_id UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_homework_attachments_homework_id ON homework_attachments(homework_id);
```

### media_gallery
```sql
CREATE TABLE media_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    event_name VARCHAR(255),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video')),
    caption TEXT,
    class_ids UUID[], -- Photos/videos can be associated with multiple classes
    uploaded_by UUID NOT NULL REFERENCES users(id),
    upload_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_gallery_school_id ON media_gallery(school_id);
CREATE INDEX idx_media_gallery_media_type ON media_gallery(media_type);
CREATE INDEX idx_media_gallery_upload_date ON media_gallery(upload_date DESC);
CREATE INDEX idx_media_gallery_uploaded_by ON media_gallery(uploaded_by);
```

### calendar_events
```sql
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) CHECK (event_type IN ('holiday', 'ptm', 'event', 'exam', 'meeting', 'other')),
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    is_all_day BOOLEAN DEFAULT false,
    target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'parents', 'teachers', 'specific')),
    target_class_ids UUID[],
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calendar_events_school_id ON calendar_events(school_id);
CREATE INDEX idx_calendar_events_event_date ON calendar_events(event_date);
CREATE INDEX idx_calendar_events_event_type ON calendar_events(event_type);
```

---

## Expense Management Module

### expense_categories
```sql
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false, -- System-defined categories
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (school_id, name)
);

CREATE INDEX idx_expense_categories_school_id ON expense_categories(school_id);
CREATE INDEX idx_expense_categories_is_default ON expense_categories(is_default);

-- Insert default categories
INSERT INTO expense_categories (name, description, is_default) VALUES
('Salaries', 'Staff salaries and wages', true),
('Utilities', 'Electricity, water, internet', true),
('Rent', 'Building rent', true),
('Supplies', 'Educational and office supplies', true),
('Maintenance', 'Building and equipment maintenance', true),
('Food', 'Meal and snack expenses', true),
('Transport', 'Transportation costs', true),
('Marketing', 'Advertising and promotions', true),
('Insurance', 'Insurance premiums', true),
('Miscellaneous', 'Other expenses', true);
```

### expenses
```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES expense_categories(id),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'cheque', 'other')),
    vendor_name VARCHAR(255),
    receipt_number VARCHAR(100),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_school_id ON expenses(school_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_created_by ON expenses(created_by);
CREATE INDEX idx_expenses_amount ON expenses(amount);
```

### expense_receipts
```sql
CREATE TABLE expense_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    receipt_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expense_receipts_expense_id ON expense_receipts(expense_id);
```

### remittances
```sql
CREATE TABLE remittances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    remittance_date DATE NOT NULL,
    bank_name VARCHAR(255),
    account_number VARCHAR(100),
    transaction_reference VARCHAR(100),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_remittances_school_id ON remittances(school_id);
CREATE INDEX idx_remittances_remittance_date ON remittances(remittance_date DESC);
```

---

## Fee Management Module

### fee_structures
```sql
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id),
    fee_type VARCHAR(100) NOT NULL CHECK (fee_type IN ('tuition', 'admission', 'annual', 'transport', 'meal', 'activity', 'exam', 'miscellaneous')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    frequency VARCHAR(20) CHECK (frequency IN ('one_time', 'monthly', 'quarterly', 'half_yearly', 'yearly')),
    is_mandatory BOOLEAN DEFAULT true,
    description TEXT,
    effective_from DATE,
    effective_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fee_structures_school_id ON fee_structures(school_id);
CREATE INDEX idx_fee_structures_class_id ON fee_structures(class_id);
CREATE INDEX idx_fee_structures_fee_type ON fee_structures(fee_type);
```

### invoices
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    paid_amount DECIMAL(10, 2) DEFAULT 0 CHECK (paid_amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    due_date DATE NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    generated_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_school_id ON invoices(school_id);
CREATE INDEX idx_invoices_student_id ON invoices(student_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
```

### invoice_items
```sql
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    fee_type VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
```

### payments
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'online', 'cheque')),
    payment_gateway VARCHAR(50) CHECK (payment_gateway IN ('stripe', 'razorpay', 'paypal', 'manual')),
    transaction_id VARCHAR(255),
    transaction_reference VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_school_id ON payments(school_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date DESC);
```

### payment_gateway_logs
```sql
CREATE TABLE payment_gateway_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    gateway VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    request_data JSONB,
    response_data JSONB,
    status_code INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_gateway_logs_payment_id ON payment_gateway_logs(payment_id);
CREATE INDEX idx_payment_gateway_logs_gateway ON payment_gateway_logs(gateway);
```

### receipts
```sql
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    pdf_url TEXT,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receipts_payment_id ON receipts(payment_id);
CREATE INDEX idx_receipts_receipt_number ON receipts(receipt_number);
```

### payment_reminders
```sql
CREATE TABLE payment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20) CHECK (reminder_type IN ('first', 'second', 'final', 'overdue')),
    sent_via VARCHAR(20) CHECK (sent_via IN ('email', 'sms', 'push', 'all')),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_reminders_invoice_id ON payment_reminders(invoice_id);
CREATE INDEX idx_payment_reminders_sent_at ON payment_reminders(sent_at DESC);
```

---

## Views for Reporting

### expense_summary_view
```sql
CREATE VIEW expense_summary_view AS
SELECT 
    e.school_id,
    DATE_TRUNC('month', e.expense_date) as month,
    ec.name as category_name,
    COUNT(*) as expense_count,
    SUM(e.amount) as total_amount,
    AVG(e.amount) as average_amount
FROM expenses e
JOIN expense_categories ec ON e.category_id = ec.id
GROUP BY e.school_id, month, ec.name
ORDER BY month DESC, total_amount DESC;
```

### fee_collection_summary_view
```sql
CREATE VIEW fee_collection_summary_view AS
SELECT 
    i.school_id,
    DATE_TRUNC('month', p.payment_date) as month,
    COUNT(DISTINCT i.id) as invoices_paid,
    COUNT(DISTINCT p.id) as payment_count,
    SUM(p.amount) as total_collected
FROM payments p
JOIN invoices i ON p.invoice_id = i.id
WHERE p.status = 'completed'
GROUP BY i.school_id, month
ORDER BY month DESC;
```

### pending_fees_view
```sql
CREATE VIEW pending_fees_view AS
SELECT 
    i.id as invoice_id,
    i.invoice_number,
    s.first_name || ' ' || s.last_name as student_name,
    i.total_amount,
    i.paid_amount,
    (i.total_amount - i.paid_amount) as pending_amount,
    i.due_date,
    i.status,
    CASE 
        WHEN i.due_date < CURRENT_DATE THEN 'overdue'
        WHEN i.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'upcoming'
    END as urgency
FROM invoices i
JOIN students s ON i.student_id = s.id
WHERE i.status IN ('pending', 'partially_paid', 'overdue')
ORDER BY i.due_date;
```

---

## Database Indexes Summary

### Performance Optimization
- All foreign keys have indexes
- Date columns have indexes for time-range queries
- Status/type columns have indexes for filtering
- Composite indexes for common query patterns

### Full-text Search (Optional)
```sql
-- Add full-text search for announcements
ALTER TABLE announcements ADD COLUMN search_vector tsvector;

CREATE INDEX idx_announcements_search 
ON announcements USING gin(search_vector);

CREATE TRIGGER announcements_search_update 
BEFORE INSERT OR UPDATE ON announcements
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', title, content);
```

---

## Database Migrations

### Migration Tool
Use **TypeORM** or **Prisma** for database migrations

### Migration Strategy
1. Create migration files
2. Review changes
3. Test on development
4. Apply to staging
5. Backup production
6. Apply to production
7. Verify data integrity

---

## Data Retention Policy

### Active Data
- Keep for duration of school operation
- Regular backups (daily)

### Historical Data
- Archive after academic year ends
- Keep for 7 years (compliance)
- Compressed storage

### Deleted Data
- Soft delete for 90 days
- Hard delete after retention period
- Audit logs maintained

---

## Security Considerations

### Encryption
- Passwords: bcrypt (rounds: 12)
- Sensitive data: AES-256
- Data at rest: Database-level encryption
- Data in transit: TLS 1.3

### Access Control
- Row-level security for multi-tenancy
- School-based data isolation
- Role-based permissions

### Audit Trail
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
```

---

## Backup Strategy

### Automated Backups
- **Full backup**: Daily at 2 AM
- **Incremental backup**: Every 6 hours
- **Retention**: 30 days
- **Location**: AWS S3 / Google Cloud Storage
- **Encryption**: AES-256

### Disaster Recovery
- **RPO (Recovery Point Objective)**: 1 hour
- **RTO (Recovery Time Objective)**: 4 hours
- **Testing**: Monthly DR drills

---

## Performance Tuning

### Query Optimization
- Use EXPLAIN ANALYZE
- Optimize slow queries
- Add missing indexes
- Use connection pooling

### Caching Strategy
- Redis for frequently accessed data
- Cache invalidation on updates
- Cache warm-up on startup

### Partitioning (Future)
- Partition large tables by date
- Partition by school_id for multi-tenancy

---

## Conclusion

This database schema provides:
- ✅ Normalized structure
- ✅ Proper relationships and constraints
- ✅ Performance optimization through indexes
- ✅ Multi-tenancy support
- ✅ Audit trail capability
- ✅ Scalability through proper design
- ✅ Security through encryption and access control

The schema is ready for implementation with TypeORM or Prisma in the NestJS backend services.
