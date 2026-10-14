<?php

namespace Tests\Feature;

use App\Models\MedicalCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MandatoryRequirementsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $viewer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email' => 'admin@jajalmedical.com',
            'role' => User::ROLE_ADMIN,
        ]);

        $this->viewer = User::factory()->create([
            'email' => 'viewer@jajalmedical.com',
            'role' => User::ROLE_VIEWER,
        ]);
    }

    /**
     * Mandatory Test 1: Valid login succeeds.
     */
    public function test_valid_login_succeeds(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@jajalmedical.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => ['token', 'user'],
                     'message',
                 ]);
    }

    /**
     * Mandatory Test 2: Invalid login is rejected.
     */
    public function test_invalid_login_is_rejected(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@jajalmedical.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Mandatory Test 3: Guests cannot access protected case pages or APIs.
     */
    public function test_guests_cannot_access_protected_apis(): void
    {
        $response = $this->getJson('/api/cases');
        $response->assertStatus(401);
    }

    /**
     * Mandatory Test 4: Admin can create a case.
     */
    public function test_admin_can_create_a_case(): void
    {
        $payload = [
            'case_number' => 'CASE-TEST-001',
            'patient_reference' => 'PAT-88123',
            'surgeon_name' => 'Dr. Miller',
            'implant_type' => 'Titanium Plate',
            'status' => 'Planning',
            'priority' => 'High',
            'surgery_date' => '2026-11-20',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->postJson('/api/cases', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('data.case_number', 'CASE-TEST-001')
                 ->assertJsonPath('data.created_by', $this->admin->id);

        $this->assertDatabaseHas('medical_cases', [
            'case_number' => 'CASE-TEST-001',
            'created_by' => $this->admin->id,
        ]);
    }

    /**
     * Mandatory Test 5: Duplicate Case Number creation is rejected with HTTP 422.
     */
    public function test_duplicate_case_number_rejected_with_422(): void
    {
        MedicalCase::factory()->create([
            'case_number' => 'CASE-UNIQUE-99',
            'created_by' => $this->admin->id,
        ]);

        $payload = [
            'case_number' => 'CASE-UNIQUE-99', // Duplicate!
            'patient_reference' => 'PAT-999',
            'surgeon_name' => 'Dr. Jones',
            'implant_type' => 'PEEK Spacer',
            'status' => 'Draft',
            'priority' => 'Low',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->postJson('/api/cases', $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['case_number']);
    }

    /**
     * Mandatory Test 6: Viewer cannot delete a case and receives HTTP 403.
     */
    public function test_viewer_cannot_delete_a_case_receives_403(): void
    {
        $case = MedicalCase::factory()->create([
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->viewer, 'sanctum')
                         ->deleteJson("/api/cases/{$case->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('medical_cases', ['id' => $case->id]);
    }
}
