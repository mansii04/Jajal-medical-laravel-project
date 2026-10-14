# Database Schema & Entity Relationship Documentation

This document describes the database design, table structures, column definitions, data types, indexes, constraints, and relationships for the Jajal Medical Case Management Application.

---

## 1. Entity Relationship (ER) Diagram

\`\`\`
+-------------------------------------------------------------+
|                          users                              |
+-------------------------------------------------------------+
| id                  : BIGINT UNSIGNED [PK, Auto Increment]  |
| name                : VARCHAR(255)                          |
| email               : VARCHAR(255) [UNIQUE]                 |
| email_verified_at   : TIMESTAMP NULL                        |
| password            : VARCHAR(255)                          |
| role                : ENUM('admin', 'viewer')               |
| remember_token      : VARCHAR(100) NULL                     |
| created_at          : TIMESTAMP NULL                        |
| updated_at          : TIMESTAMP NULL                        |
+-------------------------------------------------------------+
                              |
                              | 1
                              |
                              | hasMany (created_by)
                              |
                              | *
+-------------------------------------------------------------+
|                      medical_cases                          |
+-------------------------------------------------------------+
| id                  : BIGINT UNSIGNED [PK, Auto Increment]  |
| case_number         : VARCHAR(50) [UNIQUE INDEX]            |
| patient_reference   : VARCHAR(50)                           |
| surgeon_name        : VARCHAR(100) [INDEX]                  |
| implant_type        : VARCHAR(150)                          |
| status              : ENUM('Draft', 'Planning', 'In Review',|
|                            'Approved', 'Completed',         |
|                            'Cancelled') [INDEX]             |
| priority            : ENUM('Low', 'Medium', 'High') [INDEX] |
| surgery_date        : DATE NULL                             |
| created_by          : BIGINT UNSIGNED [FK -> users.id]      |
| created_at          : TIMESTAMP NULL                        |
| updated_at          : TIMESTAMP NULL                        |
+-------------------------------------------------------------+
\`\`\`

---

## 2. Table Specifications

### 2.1 Table: `users`

Represents application users (both Administrators and Viewers).

| Column | Data Type | Nullable | Key / Index | Description |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | No | PK | Primary Key, Auto Incrementing |
| `name` | VARCHAR(255) | No | - | Full name of the user |
| `email` | VARCHAR(255) | No | UNIQUE | User email address, used for authentication |
| `email_verified_at` | TIMESTAMP | Yes | - | Timestamp when email was verified |
| `password` | VARCHAR(255) | No | - | Bcrypt-hashed password |
| `role` | ENUM('admin', 'viewer') | No | - | Authorization role (`admin` or `viewer`) |
| `remember_token` | VARCHAR(100) | Yes | - | Laravel "Remember Me" session token |
| `created_at` | TIMESTAMP | Yes | - | Record creation timestamp |
| `updated_at` | TIMESTAMP | Yes | - | Record update timestamp |

**Relationships:**
- Has Many `medical_cases` via foreign key `medical_cases.created_by`.

---

### 2.2 Table: `medical_cases`

Represents surgical cases tracking customized implant design, review, approval, and execution.

| Column | Data Type | Nullable | Key / Index | Description |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | No | PK | Primary Key, Auto Incrementing |
| `case_number` | VARCHAR(50) | No | UNIQUE INDEX | Unique case identifier (e.g., `CASE-0001`) |
| `patient_reference` | VARCHAR(50) | No | - | Dummy pseudonymized patient identifier (e.g. `PAT-84920`) |
| `surgeon_name` | VARCHAR(100) | No | INDEX | Name of attending orthopedic/neurosurgical surgeon |
| `implant_type` | VARCHAR(150) | No | - | Engineering description of implant (e.g., Titanium Cranial Plate) |
| `status` | ENUM | No | INDEX | Current workflow status (`Draft`, `Planning`, `In Review`, `Approved`, `Completed`, `Cancelled`) |
| `priority` | ENUM | No | INDEX | Urgency level (`Low`, `Medium`, `High`) |
| `surgery_date` | DATE | Yes | - | Scheduled surgery date (nullable if not yet scheduled) |
| `created_by` | BIGINT UNSIGNED | No | FK | Foreign key referencing `users.id` (ON DELETE CASCADE) |
| `created_at` | TIMESTAMP | Yes | - | Creation timestamp |
| `updated_at` | TIMESTAMP | Yes | - | Modification timestamp |

**Indexes Defined:**
1. `medical_cases_case_number_unique`: UNIQUE (`case_number`)
2. `medical_cases_status_index`: INDEX (`status`)
3. `medical_cases_priority_index`: INDEX (`priority`)
4. `medical_cases_surgeon_name_index`: INDEX (`surgeon_name`)
5. `medical_cases_created_by_foreign`: FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE

---

### 2.3 Table: `personal_access_tokens` (Laravel Sanctum)

Standard Laravel Sanctum token storage table for API authentication tokens.

| Column | Data Type | Nullable | Key / Index | Description |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | No | PK | Primary Key |
| `tokenable_type` | VARCHAR(255) | No | INDEX | Morph model (`App\\Models\\User`) |
| `tokenable_id` | BIGINT UNSIGNED | No | INDEX | User ID |
| `name` | VARCHAR(255) | No | - | Token name |
| `token` | VARCHAR(64) | No | UNIQUE | SHA-256 hashed token string |
| `abilities` | TEXT | Yes | - | Token permissions array |
| `last_used_at` | TIMESTAMP | Yes | - | Timestamp of last API request |
| `expires_at` | TIMESTAMP | Yes | - | Token expiration |
| `created_at` | TIMESTAMP | Yes | - | Creation timestamp |
| `updated_at` | TIMESTAMP | Yes | - | Update timestamp |

---

## 3. Seeded Accounts & Mock Data Guarantee

- **Admin Account**: `admin@jajalmedical.com` (password: `admin123`)
- **Viewer Account**: `viewer@jajalmedical.com` (password: `viewer123`)
- **Seed Cases**: 25 realistic surgical implant cases preloaded across all 6 statuses and 3 priorities.
