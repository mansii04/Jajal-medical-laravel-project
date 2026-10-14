import express, { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';
import { validateStoreCaseRequest, validateUpdateCaseRequest } from './validation.ts';
import { runAutomatedTests } from './testRunner.ts';
import { UserRole } from '../src/types/index.ts';

// Extend Express Request to carry authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
}

const router = express.Router();

// -------------------------------------------------------------
// Authentication Middleware (Sanctum emulation)
// -------------------------------------------------------------
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Unauthenticated.',
    });
  }

  const user = db.getUserByToken(authHeader);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthenticated. Invalid or expired token.',
    });
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  next();
}

// -------------------------------------------------------------
// Authorization Middleware (Policies / Gates emulation)
// -------------------------------------------------------------
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'This action is unauthorized. Only Admins have permission to perform this operation.',
    });
  }
  next();
}

// -------------------------------------------------------------
// 1. POST /api/login (Public)
// -------------------------------------------------------------
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({
      success: false,
      message: 'The given data was invalid.',
      errors: {
        ...(email ? {} : { email: ['The email field is required.'] }),
        ...(password ? {} : { password: ['The password field is required.'] }),
      },
    });
  }

  const user = db.getUserByEmail(email);
  // Compare password (in seed: admin123, viewer123)
  if (!user || user.password_hash !== password) {
    return res.status(401).json({
      success: false,
      message: 'These credentials do not match our records.',
    });
  }

  const token = db.createToken(user.id);

  return res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    message: 'Operation successful',
  });
});

// -------------------------------------------------------------
// 2. POST /api/logout (Authenticated)
// -------------------------------------------------------------
router.post('/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization || '';
  db.revokeToken(authHeader);
  return res.status(200).json({
    success: true,
    data: null,
    message: 'Operation successful',
  });
});

// -------------------------------------------------------------
// GET /api/user (Authenticated)
// -------------------------------------------------------------
router.get('/user', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    data: req.user,
    message: 'Operation successful',
  });
});

// -------------------------------------------------------------
// GET /api/dashboard/stats (Authenticated)
// -------------------------------------------------------------
router.get('/dashboard/stats', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const cases = db.getCases();

  const total = cases.length;
  const planning = cases.filter((c) => c.status === 'Planning').length;
  const in_review = cases.filter((c) => c.status === 'In Review').length;
  const approved = cases.filter((c) => c.status === 'Approved').length;
  const completed = cases.filter((c) => c.status === 'Completed').length;
  const draft = cases.filter((c) => c.status === 'Draft').length;
  const cancelled = cases.filter((c) => c.status === 'Cancelled').length;
  const high_priority = cases.filter((c) => c.priority === 'High').length;
  const medium_priority = cases.filter((c) => c.priority === 'Medium').length;
  const low_priority = cases.filter((c) => c.priority === 'Low').length;

  const now = new Date();
  const upcoming_surgeries = cases.filter((c) => {
    if (!c.surgery_date) return false;
    const d = new Date(c.surgery_date);
    return d >= now;
  }).length;

  return res.status(200).json({
    success: true,
    data: {
      total,
      planning,
      in_review,
      approved,
      completed,
      draft,
      cancelled,
      high_priority,
      medium_priority,
      low_priority,
      upcoming_surgeries,
    },
    message: 'Operation successful',
  });
});

// -------------------------------------------------------------
// 3. GET /api/cases (Authenticated: Admin & Viewer)
// Supports search by case_number, surgeon_name, filter by status, priority, pagination (10 per page)
// -------------------------------------------------------------
router.get('/cases', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  let cases = db.getCases();

  const { search, surgeon, status, priority, sort, direction } = req.query;

  // Search by Case Number or general text
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    cases = cases.filter(
      (c) =>
        c.case_number.toLowerCase().includes(q) ||
        c.patient_reference.toLowerCase().includes(q) ||
        c.implant_type.toLowerCase().includes(q)
    );
  }

  // Filter / Search by Surgeon Name
  if (surgeon && typeof surgeon === 'string' && surgeon.trim() !== '') {
    const s = surgeon.trim().toLowerCase();
    cases = cases.filter((c) => c.surgeon_name.toLowerCase().includes(s));
  }

  // Filter by Status
  if (status && typeof status === 'string' && status.trim() !== '' && status !== 'all') {
    cases = cases.filter(
      (c) => c.status.toLowerCase() === status.trim().toLowerCase()
    );
  }

  // Filter by Priority
  if (priority && typeof priority === 'string' && priority.trim() !== '' && priority !== 'all') {
    cases = cases.filter(
      (c) => c.priority.toLowerCase() === priority.trim().toLowerCase()
    );
  }

  // Sorting
  if (sort && typeof sort === 'string') {
    const dir = direction === 'asc' ? 1 : -1;
    cases.sort((a, b) => {
      const fieldA = (a as unknown as Record<string, unknown>)[sort];
      const fieldB = (b as unknown as Record<string, unknown>)[sort];
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return fieldA.localeCompare(fieldB) * dir;
      }
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return (fieldA - fieldB) * dir;
      }
      return 0;
    });
  }

  // Pagination (default 10 per page as required)
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
  const perPage = Math.max(1, parseInt((req.query.per_page as string) || '10', 10));
  const total = cases.length;
  const lastPage = Math.ceil(total / perPage) || 1;
  const offset = (page - 1) * perPage;
  const paginatedItems = cases.slice(offset, offset + perPage);

  return res.status(200).json({
    success: true,
    data: {
      data: paginatedItems,
      current_page: page,
      per_page: perPage,
      total,
      last_page: lastPage,
      from: total === 0 ? 0 : offset + 1,
      to: Math.min(offset + perPage, total),
    },
    message: 'Operation successful',
  });
});

// -------------------------------------------------------------
// 4. POST /api/cases (Authenticated: Admin only)
// -------------------------------------------------------------
router.post('/cases', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const validation = validateStoreCaseRequest(req.body);
  if (!validation.valid) {
    return res.status(422).json({
      success: false,
      message: 'The given data was invalid.',
      errors: validation.errors,
    });
  }

  // Set creator strictly from authenticated user (never trust client)
  const newCase = db.createCase({
    case_number: req.body.case_number.trim(),
    patient_reference: req.body.patient_reference.trim(),
    surgeon_name: req.body.surgeon_name.trim(),
    implant_type: req.body.implant_type.trim(),
    status: req.body.status,
    priority: req.body.priority,
    surgery_date: req.body.surgery_date ? req.body.surgery_date.trim() : null,
    created_by: req.user!.id,
  });

  return res.status(201).json({
    success: true,
    data: newCase,
    message: 'Operation successful',
  });
});

// -------------------------------------------------------------
// 5. GET /api/cases/{id} (Authenticated: Admin & Viewer)
// -------------------------------------------------------------
router.get('/cases/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({
      success: false,
      message: 'No query results for model [App\\Models\\MedicalCase] ' + req.params.id,
    });
  }

  const medicalCase = db.getCaseById(id);
  if (!medicalCase) {
    return res.status(404).json({
      success: false,
      message: 'No query results for model [App\\Models\\MedicalCase] ' + id,
    });
  }

  return res.status(200).json({
    success: true,
    data: medicalCase,
    message: 'Operation successful',
  });
});

// -------------------------------------------------------------
// 6. PUT /api/cases/{id} (Authenticated: Admin only)
// -------------------------------------------------------------
router.put('/cases/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({
      success: false,
      message: 'No query results for model [App\\Models\\MedicalCase] ' + req.params.id,
    });
  }

  const existingCase = db.getCaseById(id);
  if (!existingCase) {
    return res.status(404).json({
      success: false,
      message: 'No query results for model [App\\Models\\MedicalCase] ' + id,
    });
  }

  const validation = validateUpdateCaseRequest(req.body, id);
  if (!validation.valid) {
    return res.status(422).json({
      success: false,
      message: 'The given data was invalid.',
      errors: validation.errors,
    });
  }

  const updated = db.updateCase(id, {
    case_number: req.body.case_number.trim(),
    patient_reference: req.body.patient_reference.trim(),
    surgeon_name: req.body.surgeon_name.trim(),
    implant_type: req.body.implant_type.trim(),
    status: req.body.status,
    priority: req.body.priority,
    surgery_date: req.body.surgery_date ? req.body.surgery_date.trim() : null,
  });

  return res.status(200).json({
    success: true,
    data: updated,
    message: 'Operation successful',
  });
});

// -------------------------------------------------------------
// 7. DELETE /api/cases/{id} (Authenticated: Admin only)
// -------------------------------------------------------------
router.delete('/cases/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({
      success: false,
      message: 'No query results for model [App\\Models\\MedicalCase] ' + req.params.id,
    });
  }

  const existingCase = db.getCaseById(id);
  if (!existingCase) {
    return res.status(404).json({
      success: false,
      message: 'No query results for model [App\\Models\\MedicalCase] ' + id,
    });
  }

  db.deleteCase(id);

  return res.status(200).json({
    success: true,
    data: null,
    message: 'Operation successful',
  });
});

// -------------------------------------------------------------
// Diagnostic & Test Runner Endpoints
// -------------------------------------------------------------
router.get('/run-tests', async (_req: Request, res: Response) => {
  const result = await runAutomatedTests();
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Test suite executed successfully',
  });
});

router.post('/run-tests', async (_req: Request, res: Response) => {
  const result = await runAutomatedTests();
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Test suite executed successfully',
  });
});

router.post('/database/reset', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  db.reset();
  return res.status(200).json({
    success: true,
    message: 'Database reset to initial seeded state (2 users, 25 cases).',
  });
});

export default router;
