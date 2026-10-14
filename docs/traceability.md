# Requirements Traceability Matrix (RTM)

This document tracks the requirements specified for the Jajal Medical Software Developer Intern assignment from business rules to architectural implementation and automated verification.

| Requirement ID | Requirement Description | Implementation Artifacts | Verification Method & Test Case | Live Status |
|---|---|---|---|---|
| **REQ-001** | Admin can create a medical case with automatic creator assignment | \`App\\Http\\Controllers\\CaseController::store\`, \`App\\Http\\Requests\\StoreCaseRequest\`, \`resources/views/cases/create.blade.php\` | \`Tests\\Feature\\MandatoryRequirementsTest::test_admin_can_create_a_case\` | **PASSED (HTTP 201)** |
| **REQ-002** | Case Number is strictly unique across all medical cases | Database Migration Unique Index (\`case_number\`), \`StoreCaseRequest\` (\`unique:medical_cases,case_number\`), \`UpdateCaseRequest\` | \`Tests\\Feature\\MandatoryRequirementsTest::test_duplicate_case_number_rejected_with_422\` | **PASSED (HTTP 422)** |
| **REQ-003** | Only Admin can delete cases; Viewers receive HTTP 403 Forbidden | \`App\\Policies\\CasePolicy::delete\`, \`App\\Http\\Controllers\\CaseController::destroy\`, \`App\\Http\\Controllers\\Api\\CaseApiController::destroy\` | \`Tests\\Feature\\MandatoryRequirementsTest::test_viewer_cannot_delete_a_case_receives_403\` | **PASSED (HTTP 403)** |
| **REQ-004** | Valid login succeeds and returns authenticated session & token | \`App\\Http\\Controllers\\AuthController::login\`, \`App\\Http\\Controllers\\Api\\AuthApiController::login\` | \`Tests\\Feature\\MandatoryRequirementsTest::test_valid_login_succeeds\` | **PASSED (HTTP 200)** |
| **REQ-005** | Invalid login rejected with clear feedback | \`App\\Http\\Controllers\\AuthController::login\`, \`App\\Http\\Controllers\\Api\\AuthApiController::login\` | \`Tests\\Feature\\MandatoryRequirementsTest::test_invalid_login_is_rejected\` | **PASSED (HTTP 401)** |
| **REQ-006** | Guests cannot access protected web or API routes | \`auth\` and \`auth:sanctum\` middleware groups in \`routes/web.php\` and \`routes/api.php\` | \`Tests\\Feature\\MandatoryRequirementsTest::test_guests_cannot_access_protected_apis\` | **PASSED (HTTP 401)** |
| **REQ-007** | Dashboard statistics are calculated dynamically from database | \`App\\Http\\Controllers\\DashboardController::index\`, \`routes.ts\` (\`/api/dashboard/stats\`) | Database aggregate assertion test; verified against real record counts | **PASSED** |
| **REQ-008** | Case list paginated (10 per page) with search and status filtering | \`App\\Http\\Controllers\\CaseController::index\`, Eloquent query builder, \`resources/views/cases/index.blade.php\` | \`Tests\\Feature\\CaseTest::test_case_list_pagination_and_filtering\` | **PASSED** |
| **REQ-009** | Server-side validation via dedicated Form Requests (not controller bloat) | \`App\\Http\\Requests\\StoreCaseRequest\`, \`App\\Http\\Requests\\UpdateCaseRequest\` | Field-level error validation tests, HTTP 422 JSON validation assertions | **PASSED (HTTP 422)** |
| **REQ-010** | REST API endpoints return consistent JSON schema and standard status codes | \`App\\Http\\Controllers\\Api\\CaseApiController\`, standard response helper \`{"success": true, "data": {}, "message": "..."}\` | API feature tests inspecting JSON keys and status codes (200, 201, 401, 403, 404, 422) | **PASSED** |

---

## Architecture Class Mapping

- **Models**:
  - `App\Models\User`
  - `App\Models\MedicalCase`
- **Form Requests**:
  - `App\Http\Requests\StoreCaseRequest`
  - `App\Http\Requests\UpdateCaseRequest`
- **Policies**:
  - `App\Policies\CasePolicy`
- **Web Controllers**:
  - `App\Http\Controllers\AuthController`
  - `App\Http\Controllers\CaseController`
  - `App\Http\Controllers\DashboardController`
- **API Controllers**:
  - `App\Http\Controllers\Api\AuthApiController`
  - `App\Http\Controllers\Api\CaseApiController`
- **Test Classes**:
  - `Tests\Feature\MandatoryRequirementsTest`
  - `Tests\Feature\CaseTest`
  - `Tests\Feature\AuthTest`
