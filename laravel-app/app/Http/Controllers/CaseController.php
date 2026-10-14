<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCaseRequest;
use App\Http\Requests\UpdateCaseRequest;
use App\Models\MedicalCase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CaseController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(MedicalCase::class, 'case');
    }

    /**
     * Screen 3: Case list
     */
    public function index(Request $request): View
    {
        $query = MedicalCase::with('creator');

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

        $cases = $query->latest('id')->paginate(10)->withQueryString();

        return view('cases.index', compact('cases'));
    }

    /**
     * Screen 4: Create Case form (Admin only)
     */
    public function create(): View
    {
        return view('cases.create');
    }

    /**
     * Store new case (Admin only)
     */
    public function store(StoreCaseRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        $case = new MedicalCase($validated);
        $case->created_by = $request->user()->id; // Automatic creator assignment
        $case->save();

        return redirect()->route('cases.index')
            ->with('success', "Medical case {$case->case_number} was successfully created.");
    }

    /**
     * Screen 5: Case details (Admin & Viewer)
     */
    public function show(MedicalCase $case): View
    {
        $case->load('creator');
        return view('cases.show', compact('case'));
    }

    /**
     * Screen 4: Edit Case form (Admin only)
     */
    public function edit(MedicalCase $case): View
    {
        return view('cases.edit', compact('case'));
    }

    /**
     * Update case (Admin only)
     */
    public function update(UpdateCaseRequest $request, MedicalCase $case): RedirectResponse
    {
        $case->update($request->validated());

        return redirect()->route('cases.index')
            ->with('success', "Medical case {$case->case_number} was successfully updated.");
    }

    /**
     * Delete case (Admin only, Viewer receives 403)
     */
    public function destroy(MedicalCase $case): RedirectResponse
    {
        $caseNumber = $case->case_number;
        $case->delete();

        return redirect()->route('cases.index')
            ->with('success', "Medical case {$caseNumber} was successfully deleted.");
    }
}
