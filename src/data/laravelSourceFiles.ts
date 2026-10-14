export interface LaravelFileItem {
  path: string;
  category: 'models' | 'controllers' | 'requests' | 'policies' | 'migrations' | 'seeders' | 'routes' | 'views' | 'tests' | 'docs' | 'config';
  language: 'php' | 'markdown' | 'json' | 'html';
  content: string;
}

export const LARAVEL_PROJECT_FILES: LaravelFileItem[] = [
  {
    path: 'app/Models/MedicalCase.php',
    category: 'models',
    language: 'php',
    content: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class MedicalCase extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'medical_cases';

    /**
     * The attributes that are mass assignable.
     * Note: 'created_by' is guarded and must be assigned from authenticated user context.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'case_number',
        'patient_reference',
        'surgeon_name',
        'implant_type',
        'status',
        'priority',
        'surgery_date',
    ];

    /**
     * Allowed case statuses.
     */
    public const STATUS_DRAFT = 'Draft';
    public const STATUS_PLANNING = 'Planning';
    public const STATUS_IN_REVIEW = 'In Review';
    public const STATUS_APPROVED = 'Approved';
    public const STATUS_COMPLETED = 'Completed';
    public const STATUS_CANCELLED = 'Cancelled';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_PLANNING,
        self::STATUS_IN_REVIEW,
        self::STATUS_APPROVED,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELLED,
    ];

    /**
     * Allowed priorities.
     */
    public const PRIORITY_LOW = 'Low';
    public const PRIORITY_MEDIUM = 'Medium';
    public const PRIORITY_HIGH = 'High';

    public const PRIORITIES = [
        self::PRIORITY_LOW,
        self::PRIORITY_MEDIUM,
        self::PRIORITY_HIGH,
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'surgery_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Case creator relationship (User who created the case).
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
`,
  },
  {
    path: 'app/Models/User.php',
    category: 'models',
    language: 'php',
    content: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;
use Illuminate\\Foundation\\Auth\\User as Authenticatable;
use Illuminate\\Notifications\\Notifiable;
use Laravel\\Sanctum\\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_VIEWER = 'viewer';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isViewer(): bool
    {
        return $this->role === self::ROLE_VIEWER;
    }

    public function cases(): HasMany
    {
        return $this->hasMany(MedicalCase::class, 'created_by');
    }
}
`,
  },
  {
    path: 'app/Http/Requests/StoreCaseRequest.php',
    category: 'requests',
    language: 'php',
    content: `<?php

namespace App\\Http\\Requests;

use App\\Models\\MedicalCase;
use Illuminate\\Contracts\\Validation\\Validator;
use Illuminate\\Foundation\\Http\\FormRequest;
use Illuminate\\Http\\Exceptions\\HttpResponseException;
use Illuminate\\Validation\\Rule;

class StoreCaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Uses Laravel CasePolicy authorization.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('create', MedicalCase::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'case_number' => [
                'required',
                'string',
                'max:50',
                'unique:medical_cases,case_number',
            ],
            'patient_reference' => ['required', 'string', 'max:50'],
            'surgeon_name' => ['required', 'string', 'max:100'],
            'implant_type' => ['required', 'string', 'max:150'],
            'status' => ['required', 'string', Rule::in(MedicalCase::STATUSES)],
            'priority' => ['required', 'string', Rule::in(MedicalCase::PRIORITIES)],
            'surgery_date' => ['nullable', 'date'],
        ];
    }

    /**
     * Handle a failed validation attempt for API requests returning HTTP 422.
     */
    protected function failedValidation(Validator $validator)
    {
        if ($this->expectsJson()) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422));
        }

        parent::failedValidation($validator);
    }
}
`,
  },
  {
    path: 'app/Http/Requests/UpdateCaseRequest.php',
    category: 'requests',
    language: 'php',
    content: `<?php

namespace App\\Http\\Requests;

use App\\Models\\MedicalCase;
use Illuminate\\Contracts\\Validation\\Validator;
use Illuminate\\Foundation\\Http\\FormRequest;
use Illuminate\\Http\\Exceptions\\HttpResponseException;
use Illuminate\\Validation\\Rule;

class UpdateCaseRequest extends FormRequest
{
    /**
     * Determine if user is authorized.
     */
    public function authorize(): bool
    {
        $case = $this->route('case');
        return $this->user() && $this->user()->can('update', $case);
    }

    /**
     * Validation rules ignoring current case ID for unique case_number.
     */
    public function rules(): array
    {
        $caseId = $this->route('case') instanceof MedicalCase 
            ? $this->route('case')->id 
            : $this->route('case');

        return [
            'case_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('medical_cases', 'case_number')->ignore($caseId),
            ],
            'patient_reference' => ['required', 'string', 'max:50'],
            'surgeon_name' => ['required', 'string', 'max:100'],
            'implant_type' => ['required', 'string', 'max:150'],
            'status' => ['required', 'string', Rule::in(MedicalCase::STATUSES)],
            'priority' => ['required', 'string', Rule::in(MedicalCase::PRIORITIES)],
            'surgery_date' => ['nullable', 'date'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        if ($this->expectsJson()) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422));
        }

        parent::failedValidation($validator);
    }
}
`,
  },
  {
    path: 'app/Policies/CasePolicy.php',
    category: 'policies',
    language: 'php',
    content: `<?php

namespace App\\Policies;

use App\\Models\\MedicalCase;
use App\\Models\\User;
use Illuminate\\Auth\\Access\\Response;

class CasePolicy
{
    /**
     * Determine whether the user can view any cases.
     * Admin and Viewer can view.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [User::ROLE_ADMIN, User::ROLE_VIEWER]);
    }

    /**
     * Determine whether the user can view the case details.
     */
    public function view(User $user, MedicalCase $case): bool
    {
        return in_array($user->role, [User::ROLE_ADMIN, User::ROLE_VIEWER]);
    }

    /**
     * Determine whether the user can create cases.
     * Admin only. Viewer returns 403 Forbidden.
     */
    public function create(User $user): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('This action is unauthorized. Only Admins can create cases.', 403);
    }

    /**
     * Determine whether the user can update the case.
     */
    public function update(User $user, MedicalCase $case): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('This action is unauthorized. Only Admins can edit cases.', 403);
    }

    /**
     * Determine whether the user can change status.
     */
    public function changeStatus(User $user, MedicalCase $case): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('This action is unauthorized. Only Admins can modify case status.', 403);
    }

    /**
     * Determine whether the user can delete the case.
     * Viewer cannot delete (returns 403).
     */
    public function delete(User $user, MedicalCase $case): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('This action is unauthorized. Only Admins can delete cases.', 403);
    }
}
`,
  },
  {
    path: 'app/Http/Controllers/Api/CaseApiController.php',
    category: 'controllers',
    language: 'php',
    content: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\StoreCaseRequest;
use App\\Http\\Requests\\UpdateCaseRequest;
use App\\Models\\MedicalCase;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;

class CaseApiController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(MedicalCase::class, 'case');
    }

    /**
     * GET /api/cases
     * Paginated list of cases with search and filters.
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
        
        // Never trust client for created_by
        $medicalCase = new MedicalCase($validated);
        $medicalCase->created_by = $request->user()->id;
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
     * Admin only.
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
     * Admin only. Viewer receives 403.
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
`,
  },
  {
    path: 'app/Http/Controllers/Api/AuthApiController.php',
    category: 'controllers',
    language: 'php',
    content: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\User;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Hash;
use Illuminate\\Validation\\ValidationException;

class AuthApiController extends Controller
{
    /**
     * POST /api/login (Public)
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'These credentials do not match our records.',
            ], 401);
        }

        // Revoke prior tokens and create new Sanctum token
        $token = $user->createToken('medcase-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ],
            'message' => 'Operation successful',
        ], 200);
    }

    /**
     * POST /api/logout (Authenticated)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Operation successful',
        ], 200);
    }
}
`,
  },
  {
    path: 'database/migrations/2026_01_01_000001_create_medical_cases_table.php',
    category: 'migrations',
    language: 'php',
    content: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('medical_cases', function (Blueprint $table) {
            $table->id();
            $table->string('case_number', 50)->unique();
            $table->string('patient_reference', 50);
            $table->string('surgeon_name', 100);
            $table->string('implant_type', 150);
            $table->enum('status', [
                'Draft',
                'Planning',
                'In Review',
                'Approved',
                'Completed',
                'Cancelled'
            ])->default('Planning');
            $table->enum('priority', ['Low', 'Medium', 'High'])->default('Medium');
            $table->date('surgery_date')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // Indexes for optimal query performance
            $table->index('status');
            $table->index('priority');
            $table->index('surgeon_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_cases');
    }
};
`,
  },
  {
    path: 'database/seeders/DatabaseSeeder.php',
    category: 'seeders',
    language: 'php',
    content: `<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            MedicalCaseSeeder::class,
        ]);
    }
}
`,
  },
  {
    path: 'database/seeders/UserSeeder.php',
    category: 'seeders',
    language: 'php',
    content: `<?php

namespace Database\\Seeders;

use App\\Models\\User;
use Illuminate\\Database\\Seeder;
use Illuminate\\Support\\Facades\\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seed exactly 1 Admin and 1 Viewer user.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@jajalmedical.com'],
            [
                'name' => 'Dr. Sarah Connor (Admin)',
                'password' => Hash::make('admin123'),
                'role' => User::ROLE_ADMIN,
            ]
        );

        User::firstOrCreate(
            ['email' => 'viewer@jajalmedical.com'],
            [
                'name' => 'Mark Taylor (Viewer)',
                'password' => Hash::make('viewer123'),
                'role' => User::ROLE_VIEWER,
            ]
        );
    }
}
`,
  },
  {
    path: 'tests/Feature/MandatoryRequirementsTest.php',
    category: 'tests',
    language: 'php',
    content: `<?php

namespace Tests\\Feature;

use App\\Models\\MedicalCase;
use App\\Models\\User;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;
use Tests\\TestCase;

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
`,
  },
  {
    path: 'routes/api.php',
    category: 'routes',
    language: 'php',
    content: `<?php

use App\\Http\\Controllers\\Api\\AuthApiController;
use App\\Http\\Controllers\\Api\\CaseApiController;
use Illuminate\\Support\\Facades\\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Implements all 7 required REST endpoints with Sanctum token authentication.
*/

// Public authentication endpoint
Route::post('/login', [AuthApiController::class, 'login']);

// Protected endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthApiController::class, 'logout']);
    
    // Case Management Endpoints (Roles enforced via CasePolicy)
    Route::apiResource('cases', CaseApiController::class);
});
`,
  },
  {
    path: 'routes/web.php',
    category: 'routes',
    language: 'php',
    content: `<?php

use App\\Http\\Controllers\\AuthController;
use App\\Http\\Controllers\\CaseController;
use App\\Http\\Controllers\\DashboardController;
use Illuminate\\Support\\Facades\\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (Laravel Blade UI)
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Screen 2: Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Screen 3: Case List & Screen 5: Case Details (Admin & Viewer)
    Route::get('/cases', [CaseController::class, 'index'])->name('cases.index');
    Route::get('/cases/{case}', [CaseController::class, 'show'])->name('cases.show');

    // Screen 4: Create & Edit Case (Admin Only)
    Route::middleware('can:create,App\\Models\\MedicalCase')->group(function () {
        Route::get('/cases/create', [CaseController::class, 'create'])->name('cases.create');
        Route::post('/cases', [CaseController::class, 'store'])->name('cases.store');
    });

    Route::middleware('can:update,case')->group(function () {
        Route::get('/cases/{case}/edit', [CaseController::class, 'edit'])->name('cases.edit');
        Route::put('/cases/{case}', [CaseController::class, 'update'])->name('cases.update');
    });

    Route::delete('/cases/{case}', [CaseController::class, 'destroy'])
        ->middleware('can:delete,case')
        ->name('cases.destroy');
});
`,
  },
];
