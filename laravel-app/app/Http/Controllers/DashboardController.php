<?php

namespace App\Http\Controllers;

use App\Models\MedicalCase;
use Illuminate\View\View;

class DashboardController extends Controller
{
    /**
     * Screen 2: Dashboard
     * Dynamically calculates metrics from MySQL database.
     */
    public function index(): View
    {
        $totalCases = MedicalCase::count();
        $planningCount = MedicalCase::where('status', MedicalCase::STATUS_PLANNING)->count();
        $inReviewCount = MedicalCase::where('status', MedicalCase::STATUS_IN_REVIEW)->count();
        $approvedCount = MedicalCase::where('status', MedicalCase::STATUS_APPROVED)->count();
        $completedCount = MedicalCase::where('status', MedicalCase::STATUS_COMPLETED)->count();

        $recentCases = MedicalCase::with('creator')->latest('id')->take(5)->get();

        return view('dashboard', compact(
            'totalCases',
            'planningCount',
            'inReviewCount',
            'approvedCount',
            'completedCount',
            'recentCases'
        ));
    }
}
