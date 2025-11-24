# Database Setup Guide

## Quick Setup

### 1. Create Database and User
```bash
mysql -u root -p < setup.sql
```

### 2. Import Data
```bash
mysql -u taskpro_user -p taskpro_db < taskpro_dump.sql
# Password: TaskPro@2025
```

### 3. Or use Django migrations (if starting fresh)
```bash
python manage.py migrate
python manage.py createsuperuser
```