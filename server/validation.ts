import { db } from './db.ts';
import { CasePriority, CaseStatus } from '../src/types/index.ts';

export const ALLOWED_STATUSES: CaseStatus[] = [
  'Draft',
  'Planning',
  'In Review',
  'Approved',
  'Completed',
  'Cancelled',
];

export const ALLOWED_PRIORITIES: CasePriority[] = ['Low', 'Medium', 'High'];

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

export function validateStoreCaseRequest(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string[]> = {};

  // Case Number: required, max 50, unique
  if (!data.case_number || typeof data.case_number !== 'string' || !data.case_number.trim()) {
    errors.case_number = ['The case number field is required.'];
  } else if (data.case_number.trim().length > 50) {
    errors.case_number = ['The case number must not be greater than 50 characters.'];
  } else {
    const existing = db.getCaseByNumber(data.case_number.trim());
    if (existing) {
      errors.case_number = ['The case number has already been taken.'];
    }
  }

  // Patient Reference: required, max 50
  if (!data.patient_reference || typeof data.patient_reference !== 'string' || !data.patient_reference.trim()) {
    errors.patient_reference = ['The patient reference field is required.'];
  } else if (data.patient_reference.trim().length > 50) {
    errors.patient_reference = ['The patient reference must not be greater than 50 characters.'];
  }

  // Surgeon Name: required, max 100
  if (!data.surgeon_name || typeof data.surgeon_name !== 'string' || !data.surgeon_name.trim()) {
    errors.surgeon_name = ['The surgeon name field is required.'];
  } else if (data.surgeon_name.trim().length > 100) {
    errors.surgeon_name = ['The surgeon name must not be greater than 100 characters.'];
  }

  // Implant Type: required, max 150
  if (!data.implant_type || typeof data.implant_type !== 'string' || !data.implant_type.trim()) {
    errors.implant_type = ['The implant type field is required.'];
  } else if (data.implant_type.trim().length > 150) {
    errors.implant_type = ['The implant type must not be greater than 150 characters.'];
  }

  // Status: required, in ALLOWED_STATUSES
  if (!data.status || typeof data.status !== 'string' || !data.status.trim()) {
    errors.status = ['The status field is required.'];
  } else if (!ALLOWED_STATUSES.includes(data.status.trim() as CaseStatus)) {
    errors.status = [
      `The selected status is invalid. Allowed: ${ALLOWED_STATUSES.join(', ')}`,
    ];
  }

  // Priority: required, in ALLOWED_PRIORITIES
  if (!data.priority || typeof data.priority !== 'string' || !data.priority.trim()) {
    errors.priority = ['The priority field is required.'];
  } else if (!ALLOWED_PRIORITIES.includes(data.priority.trim() as CasePriority)) {
    errors.priority = [
      `The selected priority is invalid. Allowed: ${ALLOWED_PRIORITIES.join(', ')}`,
    ];
  }

  // Surgery Date: optional valid date
  if (data.surgery_date && typeof data.surgery_date === 'string' && data.surgery_date.trim() !== '') {
    const parsed = Date.parse(data.surgery_date);
    if (isNaN(parsed)) {
      errors.surgery_date = ['The surgery date is not a valid date format (YYYY-MM-DD).'];
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateUpdateCaseRequest(
  data: Record<string, unknown>,
  currentCaseId: number
): ValidationResult {
  const errors: Record<string, string[]> = {};

  // Case Number: required, max 50, unique except current ID
  if (!data.case_number || typeof data.case_number !== 'string' || !data.case_number.trim()) {
    errors.case_number = ['The case number field is required.'];
  } else if (data.case_number.trim().length > 50) {
    errors.case_number = ['The case number must not be greater than 50 characters.'];
  } else {
    const existing = db.getCaseByNumber(data.case_number.trim());
    if (existing && existing.id !== currentCaseId) {
      errors.case_number = ['The case number has already been taken.'];
    }
  }

  // Patient Reference
  if (!data.patient_reference || typeof data.patient_reference !== 'string' || !data.patient_reference.trim()) {
    errors.patient_reference = ['The patient reference field is required.'];
  } else if (data.patient_reference.trim().length > 50) {
    errors.patient_reference = ['The patient reference must not be greater than 50 characters.'];
  }

  // Surgeon Name
  if (!data.surgeon_name || typeof data.surgeon_name !== 'string' || !data.surgeon_name.trim()) {
    errors.surgeon_name = ['The surgeon name field is required.'];
  } else if (data.surgeon_name.trim().length > 100) {
    errors.surgeon_name = ['The surgeon name must not be greater than 100 characters.'];
  }

  // Implant Type
  if (!data.implant_type || typeof data.implant_type !== 'string' || !data.implant_type.trim()) {
    errors.implant_type = ['The implant type field is required.'];
  } else if (data.implant_type.trim().length > 150) {
    errors.implant_type = ['The implant type must not be greater than 150 characters.'];
  }

  // Status
  if (!data.status || typeof data.status !== 'string' || !data.status.trim()) {
    errors.status = ['The status field is required.'];
  } else if (!ALLOWED_STATUSES.includes(data.status.trim() as CaseStatus)) {
    errors.status = [
      `The selected status is invalid. Allowed: ${ALLOWED_STATUSES.join(', ')}`,
    ];
  }

  // Priority
  if (!data.priority || typeof data.priority !== 'string' || !data.priority.trim()) {
    errors.priority = ['The priority field is required.'];
  } else if (!ALLOWED_PRIORITIES.includes(data.priority.trim() as CasePriority)) {
    errors.priority = [
      `The selected priority is invalid. Allowed: ${ALLOWED_PRIORITIES.join(', ')}`,
    ];
  }

  // Surgery Date
  if (data.surgery_date && typeof data.surgery_date === 'string' && data.surgery_date.trim() !== '') {
    const parsed = Date.parse(data.surgery_date);
    if (isNaN(parsed)) {
      errors.surgery_date = ['The surgery date is not a valid date format.'];
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
