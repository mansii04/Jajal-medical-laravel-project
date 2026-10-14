<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCaseRequest;
use App\Http\Requests\UpdateCaseRequest;
use App\Models\MedicalCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CaseApiController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(MedicalCase::class, 'case');
    }

    /**
     * GET /api/cases
     * Paginated list with search, surgeon, and status filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MedicalCase::with('creator:id,name,email,role');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('case_number', 'like', "%{$search}%")
                  ->orWhere('patient_reference', 'like', "%{$search}%")
                  ->orWhere('implant_type', 'like', "%{$search}%");
            });
        }

        if ($request->filled('surgeon')) {
            $query->where('surgeon_name', 'like', '%' . $request->query('surgeon') . '%');
        }

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('priority') && $request->query('priority') !== 'all') {
            $query->where('priority', $request->query('priority'));
        }

        $perPage = (int) $request->query('per_page', 10);
        $cases = $query->latest('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $cases,
            'message' => 'Operation successful',
        ], 200);
    }

    /**
     * POST /api/cases
     * Admin only. Validated by StoreCaseRequest.
     */
    public function store(StoreCaseRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        $medicalCase = new MedicalCase($validated);
        $medicalCase->created_by = $request->user()->id; // Never trust client
        $medicalCase->save();

        $medicalCase->load('creator:id,name,email,role');

        return response()->json([
            'success' => true,
            'data' => $medicalCase,
            'message' => 'Operation successful',
        ], 201);
    }

    /**
     * GET /api/cases/{id}
     */
    public function show(MedicalCase $case): JsonResponse
    {
        $case->load('creator:id,name,email,role');

        return response()->json([
            'success' => true,
            'data' => $case,
            'message' => 'Operation successful',
        ], 200);
    }

    /**
     * PUT /api/cases/{id}
     */
    public function update(UpdateCaseRequest $request, MedicalCase $case): JsonResponse
    {
        $validated = $request->validated();
        $case->update($validated);
        $case->load('creator:id,name,email,role');

        return response()->json([
            'success' => true,
            'data' => $case,
            'message' => 'Operation successful',
        ], 200);
    }

    /**
     * DELETE /api/cases/{id}
     */
    public function destroy(MedicalCase $case): JsonResponse
    {
        $case->delete();

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Operation successful',
        ], 200);
    }
}
