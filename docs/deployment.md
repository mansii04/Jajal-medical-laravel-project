# AWS Cloud Deployment & Infrastructure Guide

This guide documents the enterprise production deployment architecture for the MedCase Pro (Medical Case Management) system on Amazon Web Services (AWS).

---

## 1. High-Level Architecture Overview

\`\`\`
  [Internet]
      |
  [AWS Route 53 (DNS)]
      |
  [AWS Certificate Manager (ACM) - SSL/TLS HTTPS]
      |
  [Application Load Balancer (ALB) - Public Subnet]
      |
  +-----------------------------------------------------------+
  | Virtual Private Cloud (VPC) - 10.0.0.0/16                 |
  |                                                           |
  | [Private App Subnet - 10.0.1.0/24]                        |
  |   - AWS EC2 Instance (t3.medium, Ubuntu 24.04 LTS)        |
  |   - PHP 8.2-FPM + Nginx Reverse Proxy                     |
  |   - Supervisord (Laravel Queue Worker / Horizon)          |
  |                                                           |
  | [Private Database Subnet - 10.0.2.0/24]                   |
  |   - AWS RDS MySQL 8.0 (Multi-AZ for high availability)    |
  |   - Encrypted at rest (AWS KMS)                           |
  |                                                           |
  | [Storage & External Services]                             |
  |   - AWS S3 (Bucket for medical scan attachments)          |
  |   - AWS Secrets Manager / Parameter Store (Env Secrets)   |
  +-----------------------------------------------------------+
\`\`\`

---

## 2. Infrastructure Components

### 2.1 AWS EC2 (Application Server)
- **Instance Type:** `t3.medium` (2 vCPU, 4GB RAM) for staging/production.
- **Operating System:** Ubuntu 24.04 LTS.
- **Stack:**
  - Nginx 1.24+
  - PHP 8.2 with extensions: `php8.2-fpm`, `php8.2-mysql`, `php8.2-mbstring`, `php8.2-xml`, `php8.2-bcmath`, `php8.2-curl`.
  - Node.js 20 LTS (Vite build assets).
  - Composer 2.7+.

### 2.2 AWS RDS for MySQL
- **Engine:** MySQL 8.0.35.
- **Instance Class:** `db.t3.medium` (Multi-AZ Deployment for failover).
- **Storage:** 50GB gp3 SSD with auto-scaling up to 200GB.
- **Security:** Private subnet, no public IP assigned.
- **Backup:** Daily automated snapshots with 30-day retention.

### 2.3 AWS S3 (Object Storage)
- Secure, encrypted S3 bucket for storing medical CAD/CAM surgical guides and patient dummy scan files.
- IAM role attached to EC2 with least-privilege `s3:PutObject`, `s3:GetObject` permissions.

---

## 3. Security Groups & Network Isolation

### Security Group 1: `alb-sg` (Application Load Balancer)
- **Inbound:**
  - Port 80 (HTTP) -> Redirected to 443.
  - Port 443 (HTTPS) -> Allowed from `0.0.0.0/0`.
- **Outbound:**
  - Port 80 to `ec2-sg`.

### Security Group 2: `ec2-sg` (App Server)
- **Inbound:**
  - Port 80 from `alb-sg` only.
  - Port 22 (SSH) from Bastion Host or AWS Systems Manager (SSM Session Manager).
- **Outbound:**
  - All traffic to internet (via NAT Gateway for OS updates).
  - Port 3306 to `rds-sg`.

### Security Group 3: `rds-sg` (Database)
- **Inbound:**
  - Port 3306 (MySQL) from `ec2-sg` only. Never open to the public.
- **Outbound:**
  - None required.

---

## 4. Nginx Server Configuration

\`\`\`nginx
server {
    listen 80;
    server_name medical.example.com;
    root /var/www/medical-cases/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\\.(?!well-known).* {
        deny all;
    }
}
\`\`\`

---

## 5. Deployment Commands & Zero-Downtime Pipeline

\`\`\`bash
# 1. Pull latest code from main branch
cd /var/www/medical-cases
git pull origin main

# 2. Install dependencies (no dev dependencies in production)
composer install --no-dev --optimize-autoloader

# 3. Compile frontend assets
npm ci
npm run build

# 4. Run database migrations safely
php artisan migrate --force

# 5. Clear and rebuild caches for optimal performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Restart PHP-FPM service
sudo systemctl reload php8.2-fpm
\`\`\`

---

## 6. Secrets Management
- All production database credentials, Sanctum keys, and API secrets are stored securely in AWS Secrets Manager.
- Never commit `.env` or production secrets to Git.
