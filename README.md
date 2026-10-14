# MedCase Pro — Medical Case Management Application

> **Jajal Medical Software Developer Intern Practical Assignment**  
> Complete Full-Stack Medical Case Management System for tracking surgical implants from draft to completion with role-based access control, dynamic dashboard analytics, REST API, and automated testing suite.

---

## 1. Project Overview & Architecture

MedCase Pro is a responsive medical case management application designed to track patient-specific medical implant cases (cranial plates, knee arthroplasty spacers, spinal cages, mandibular meshes, etc.) through their entire clinical and manufacturing lifecycle: **Draft -> Planning -> In Review -> Approved -> Completed -> Cancelled**.

### Dual-Architecture Deliverable Summary:
1. **Live Full-Stack Application (Interactive AI Studio Runtime)**:
   - Built with **Node.js, Express, TypeScript, React 19, and Tailwind CSS**.
   - Features real server-side Bearer token authentication (Laravel Sanctum emulation), role-based policy gates (Admin vs. Viewer with HTTP 403 enforcement), Form Request validation with HTTP 422 error structures, dynamic database calculations, and an interactive automated test runner.
2. **Complete Laravel 11 + PHP 8.2 + MySQL Production Source Codebase**:
   - Located under `/laravel-app` (and inspectable directly inside the web UI under the "Laravel Codebase & Docs" tab).
   - Contains authentic Laravel Eloquent Models, Form Requests (`StoreCaseRequest`, `UpdateCaseRequest`), `CasePolicy`, `CaseApiController`, `AuthApiController`, database migrations, seeders, factories, Blade views, and Pest/PHPUnit feature test suites.

---

## 2. Seeded Dummy User Credentials

Per specification, login credentials are documented here and **not hardcoded in client source code**:

| Role | Email Address | Password | Permissions & Capabilities |
|---|---|---|---|
| **Administrator** | `admin@jajalmedical.com` | `admin123` | Full CRUD: Create, View, Edit, Change Status, Delete cases, and access Dashboard. |
| **Viewer** | `viewer@jajalmedical.com` | `viewer123` | Read-Only: View cases, View details, and access Dashboard. Cannot create, edit, change status, or delete (enforced with HTTP 403). |

*Note: The application includes 25 preloaded realistic fictional surgical cases.*

---

## 3. Technology Stack & Prerequisites

### Prerequisites for Laravel / PHP Environment:
- **PHP**: 8.2 or higher (with `pdo_mysql`, `mbstring`, `bcmath`, `curl`, `xml` extensions)
- **Composer**: 2.7+
- **MySQL**: 8.0+ (or MariaDB 10.5+)
- **Node.js & npm**: 20 LTS / 22+

### Prerequisites for the Live Prototype:
- Node.js 20+ / npm 10+
- Express & Vite (pre-configured)

---

## 4. Local Installation & Setup Guide (Laravel Project)

To run the pure Laravel / MySQL application locally on your workstation:

### Step 1: Clone or Navigate to the Repository
\`\`\`bash
git clone https://github.com/your-username/jajal-medical-case-management.git
cd jajal-medical-case-management/laravel-app
\`\`\`

### Step 2: Install PHP Dependencies
\`\`\`bash
composer install
\`\`\`

### Step 3: Configure Environment Variables
Copy the example environment configuration:
\`\`\`bash
cp .env.example .env
\`\`\`
Edit `.env` to configure your MySQL connection:
\`\`\`env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medcase_db
DB_USERNAME=root
DB_PASSWORD=your_password
\`\`\`

### Step 4: Generate Application Encryption Key
\`\`\`bash
php artisan key:generate
\`\`\`

### Step 5: Run Database Migrations & Seeders
This creates the tables, indexes, 2 user accounts, and 25 fictional cases:
\`\`\`bash
php artisan migrate:fresh --seed
\`\`\`

### Step 6: Start Laravel Development Server
\`\`\`bash
php artisan serve
\`\`\`
Visit `http://127.0.0.1:8000` in your web browser.

---

## 5. Running Automated Feature Tests

The application includes automated tests covering all 6 mandatory requirements plus bonus edge cases:

### Running via PHPUnit / Pest (Laravel):
\`\`\`bash
php artisan test
# Or specifically run the mandatory feature test file:
php artisan test tests/Feature/MandatoryRequirementsTest.php
\`\`\`

### Mandatory Feature Test Coverage:
1. **Valid login succeeds** (Returns HTTP 200 and Sanctum API token).
2. **Invalid login is rejected** (Returns HTTP 401).
3. **Guests cannot access protected case pages or APIs** (Returns HTTP 401).
4. **Admin can create a case** (Passes `StoreCaseRequest` validation, persists in DB, returns HTTP 201).
5. **Duplicate Case Number creation is rejected** (Returns HTTP 422 with field error).
6. **Viewer cannot delete a case and receives HTTP 403** (Blocked by `CasePolicy@delete`).

### Running Live in the AI Studio Prototype:
1. Open the **Automated Tests** tab in the navigation bar.
2. Click **"Execute Test Suite"**.
3. All 10 live test assertions will execute against the backend with assertion logs and response previews.

---

## 6. REST API Documentation & Sanctum Workflow

All API endpoints follow a consistent JSON response schema:
\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
\`\`\`

### API Endpoints:

| Method | Endpoint | Authorization | Description | Status Codes |
|---|---|---|---|---|
| **POST** | `/api/login` | Public | Submit credentials; returns user and Sanctum bearer token | `200`, `401`, `422` |
| **POST** | `/api/logout` | Authenticated | Revoke current token | `200`, `401` |
| **GET** | `/api/cases` | Admin, Viewer | Paginated list (10/page), supports `search`, `surgeon`, `status`, `priority` | `200`, `401` |
| **POST** | `/api/cases` | Admin Only | Create medical case; creator set to auth user | `201`, `401`, `403`, `422` |
| **GET** | `/api/cases/{id}` | Admin, Viewer | Retrieve complete case details | `200`, `401`, `404` |
| **PUT** | `/api/cases/{id}` | Admin Only | Update existing case (uniqueness ignores current case) | `200`, `401`, `403`, `422` |
| **DELETE** | `/api/cases/{id}` | Admin Only | Delete case (Viewer receives 403 Forbidden) | `200`, `401`, `403`, `404` |

### Sanctum Token Authentication Header:
\`\`\`http
Authorization: Bearer <your_sanctum_token>
Accept: application/json
Content-Type: application/json
\`\`\`

A ready-to-import Postman collection is available in `docs/postman_collection.json`.

---

## 7. Required Frontend Screens

1. **Screen 1: Login / Logout** (`/login`)
   - Clean login card with email & password fields, validation messages, and quick one-click demo account buttons.
2. **Screen 2: Dashboard** (`/dashboard`)
   - Live metrics dynamically calculated from the database: Total Cases, Planning, In Review, Approved, Completed, High Priority, and Upcoming Surgeries.
3. **Screen 3: Case List** (`/cases`)
   - 10 cases per page with preservation of search and filter parameters across pagination.
   - Filter by status and priority, search by case number or surgeon name.
   - View, Edit, and Delete action buttons according to user role.
4. **Screen 4: Create / Edit Case** (`/cases/create` & `/cases/{id}/edit`)
   - Reusable form component with field-level validation errors, input preservation, and uniqueness verification.
   - Restricted to Administrators (Viewers receive HTTP 403).
5. **Screen 5: Case Details** (`/cases/{id}`)
   - Displays all case attributes, creator details, timestamps, and navigation back to case list.

---

## 8. Documentation Files

- **`docs/database.md`**: Detailed table schemas, column data types, indexes, foreign keys, and ER diagram.
- **`docs/traceability.md`**: Traceability Matrix mapping REQ-001 through REQ-010 to class files and test methods.
- **`docs/deployment.md`**: Production AWS deployment architecture (EC2, RDS MySQL Multi-AZ, S3, Security Groups, Nginx, SSL).
- **`docs/postman_collection.json`**: Postman collection for all 7 endpoints.

---

## 9. Instructions for Publishing to GitHub or GitLab

1. Initialize git in the project root:
   \`\`\`bash
   git init
   git add .
   git commit -m "feat: complete medical case management application for Jajal Medical assignment"
   \`\`\`
2. Create a new public repository on GitHub or GitLab (e.g. `jajal-medical-case-management`).
3. Link the remote origin and push:
   \`\`\`bash
   git branch -M main
   git remote add origin https://github.com/your-username/jajal-medical-case-management.git
   git push -u origin main
   \`\`\`
4. Ensure `.env` is ignored by `.gitignore` (only `.env.example` is committed).

---

## 10. Assumptions & Environment Notes

- **AI Studio Container Runtime**: The Google AI Studio cloud container environment provides Node.js and npm without pre-installed PHP or MySQL packages. To provide an optimal experience, this submission includes **both** the interactive live full-stack application running in the container and the pristine Laravel 11 / PHP source tree under `/laravel-app` ready for standalone local execution or submission.
- **Data Privacy**: All patient and surgical data are fictional mock examples created exclusively for demonstration purposes.
