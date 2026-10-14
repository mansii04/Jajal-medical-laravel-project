<?php

namespace Database\Seeders;

use App\Models\MedicalCase;
use App\Models\User;
use Illuminate\Database\Seeder;

class MedicalCaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', User::ROLE_ADMIN)->first();
        if (! $admin) {
            $admin = User::first();
        }

        $cases = [
            [
                'case_number' => 'CASE-0001',
                'patient_reference' => 'PAT-84920',
                'surgeon_name' => 'Dr. Robert Miller',
                'implant_type' => 'Custom Titanium Cranial Plate',
                'status' => 'Approved',
                'priority' => 'High',
                'surgery_date' => '2026-10-25',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0002',
                'patient_reference' => 'PAT-77312',
                'surgeon_name' => 'Dr. Alicia Thorne',
                'implant_type' => 'Bicruciate Knee Arthroplasty Spacer',
                'status' => 'In Review',
                'priority' => 'Medium',
                'surgery_date' => '2026-11-04',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0003',
                'patient_reference' => 'PAT-19284',
                'surgeon_name' => 'Dr. Sanjay Gupta',
                'implant_type' => 'PEEK Lumbar Interbody Spinal Cage',
                'status' => 'Planning',
                'priority' => 'High',
                'surgery_date' => '2026-11-12',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0004',
                'patient_reference' => 'PAT-33829',
                'surgeon_name' => 'Dr. Elena Rostova',
                'implant_type' => 'Cementless Acetabular Hip Shell',
                'status' => 'Completed',
                'priority' => 'Medium',
                'surgery_date' => '2026-09-28',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0005',
                'patient_reference' => 'PAT-90124',
                'surgeon_name' => 'Dr. David Kim',
                'implant_type' => 'Trabecular Metal Mandibular Plate',
                'status' => 'Approved',
                'priority' => 'High',
                'surgery_date' => '2026-10-29',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0006',
                'patient_reference' => 'PAT-44019',
                'surgeon_name' => 'Dr. Marcus Vance',
                'implant_type' => 'Reverse Shoulder Glenosphere Stem',
                'status' => 'Planning',
                'priority' => 'Medium',
                'surgery_date' => '2026-11-20',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0007',
                'patient_reference' => 'PAT-66120',
                'surgeon_name' => 'Dr. Robert Miller',
                'implant_type' => 'Subperiosteal Dental Framework',
                'status' => 'Completed',
                'priority' => 'Low',
                'surgery_date' => '2026-10-02',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0008',
                'patient_reference' => 'PAT-55102',
                'surgeon_name' => 'Dr. Alicia Thorne',
                'implant_type' => 'Distal Femoral Resection Prosthesis',
                'status' => 'In Review',
                'priority' => 'High',
                'surgery_date' => '2026-11-08',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0009',
                'patient_reference' => 'PAT-12093',
                'surgeon_name' => 'Dr. Chloe Tremblay',
                'implant_type' => 'Cervical Spine Artificial Disc',
                'status' => 'Approved',
                'priority' => 'Medium',
                'surgery_date' => '2026-10-31',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0010',
                'patient_reference' => 'PAT-78219',
                'surgeon_name' => 'Dr. Sanjay Gupta',
                'implant_type' => 'Occipitocervical Fusion Rod System',
                'status' => 'Draft',
                'priority' => 'Low',
                'surgery_date' => null,
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0011',
                'patient_reference' => 'PAT-83910',
                'surgeon_name' => 'Dr. David Kim',
                'implant_type' => 'Maxillofacial Orbital Floor Mesh',
                'status' => 'Planning',
                'priority' => 'Medium',
                'surgery_date' => '2026-11-18',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0012',
                'patient_reference' => 'PAT-94821',
                'surgeon_name' => 'Dr. Elena Rostova',
                'implant_type' => 'Porous Coated Femoral Stem',
                'status' => 'Completed',
                'priority' => 'Medium',
                'surgery_date' => '2026-09-15',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0013',
                'patient_reference' => 'PAT-23849',
                'surgeon_name' => 'Dr. Marcus Vance',
                'implant_type' => 'Anatomical Radial Head Implant',
                'status' => 'Cancelled',
                'priority' => 'Low',
                'surgery_date' => null,
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0014',
                'patient_reference' => 'PAT-67123',
                'surgeon_name' => 'Dr. Robert Miller',
                'implant_type' => 'Patient-Matched Calcaneal Wedge',
                'status' => 'In Review',
                'priority' => 'Medium',
                'surgery_date' => '2026-11-10',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0015',
                'patient_reference' => 'PAT-45920',
                'surgeon_name' => 'Dr. Chloe Tremblay',
                'implant_type' => 'Sacroiliac Joint Fusion Screw Array',
                'status' => 'Planning',
                'priority' => 'High',
                'surgery_date' => '2026-11-25',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0016',
                'patient_reference' => 'PAT-31290',
                'surgeon_name' => 'Dr. Alicia Thorne',
                'implant_type' => 'Unicompartmental Knee Bearing System',
                'status' => 'Approved',
                'priority' => 'Low',
                'surgery_date' => '2026-11-02',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0017',
                'patient_reference' => 'PAT-82301',
                'surgeon_name' => 'Dr. Sanjay Gupta',
                'implant_type' => 'Thoracolumbar Deformity Correction Rods',
                'status' => 'In Review',
                'priority' => 'High',
                'surgery_date' => '2026-11-15',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0018',
                'patient_reference' => 'PAT-74912',
                'surgeon_name' => 'Dr. David Kim',
                'implant_type' => 'Zygomatic Complex Locking Plate',
                'status' => 'Draft',
                'priority' => 'Medium',
                'surgery_date' => null,
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0019',
                'patient_reference' => 'PAT-59281',
                'surgeon_name' => 'Dr. Elena Rostova',
                'implant_type' => 'Bipolar Hemiarthroplasty Head',
                'status' => 'Completed',
                'priority' => 'High',
                'surgery_date' => '2026-09-10',
                'created_by' => $admin->id,
            ],
            [
                'case_number' => 'CASE-0020',
                'patient_reference' => 'PAT-18392',
                'surgeon_name' => 'Dr. Robert Miller',
                'implant_type' => 'Custom 3D-Printed Sternum Prosthesis',
                'status' => 'Planning',
                'priority' => 'High',
                'surgery_date' => '2026-11-28',
                'created_by' => $admin->id,
            ],
        ];

        foreach ($cases as $caseData) {
            MedicalCase::firstOrCreate(
                ['case_number' => $caseData['case_number']],
                $caseData
            );
        }
    }
}
