import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { MedicalCase, CaseStatus, CasePriority } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ActiveTab } from '../components/Navbar.tsx';
import {
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  Layers,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';

interface CaseFormPageProps {
  mode: 'create' | 'edit';
  caseId?: number;
  onNavigate: (tab: ActiveTab, caseId?: number) => void;
  onSuccess: (message: string) => void;
}

export const CaseFormPage: React.FC<CaseFormPageProps> = ({
  mode,
  caseId,
  onNavigate,
  onSuccess,
}) => {
  const { isAdmin } = useAuth();

  // Form field state
  const [caseNumber, setCaseNumber] = useState('');
  const [patientReference, setPatientReference] = useState('');
  const [surgeonName, setSurgeonName] = useState('');
  const [implantType, setImplantType] = useState('');
  const [status, setStatus] = useState<CaseStatus>('Planning');
  const [priority, setPriority] = useState<CasePriority>('Medium');
  const [surgeryDate, setSurgeryDate] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Allowed options matching specification
  const statuses: CaseStatus[] = [
    'Draft',
    'Planning',
    'In Review',
    'Approved',
    'Completed',
    'Cancelled',
  ];
  const priorities: CasePriority[] = ['Low', 'Medium', 'High'];

  // If edit mode, load initial case
  useEffect(() => {
    if (mode === 'edit' && caseId) {
      setLoading(true);
      api.getCase(caseId).then((res) => {
        if (res.data) {
          const c = res.data;
          setCaseNumber(c.case_number);
          setPatientReference(c.patient_reference);
          setSurgeonName(c.surgeon_name);
          setImplantType(c.implant_type);
          setStatus(c.status);
          setPriority(c.priority);
          setSurgeryDate(c.surgery_date || '');
        } else {
          setGeneralError(res.error || 'Failed to load case data');
        }
        setLoading(false);
      });
    }
  }, [mode, caseId]);

  // Authorization check (Only Admin can create/edit)
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl p-8 border border-red-200 shadow-md text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">HTTP 403 - Forbidden</h2>
        <p className="text-sm text-slate-600">
          This action is unauthorized. You are logged in as a <strong>Viewer</strong>. Laravel Policy rules (<code>CasePolicy@create</code> / <code>CasePolicy@update</code>) restrict write operations exclusively to Administrators.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('cases')}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            Return to Case List
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setSubmitting(true);

    const payload = {
      case_number: caseNumber,
      patient_reference: patientReference,
      surgeon_name: surgeonName,
      implant_type: implantType,
      status,
      priority,
      surgery_date: surgeryDate ? surgeryDate : null,
    };

    try {
      const res =
        mode === 'create'
          ? await api.createCase(payload)
          : await api.updateCase(caseId!, payload);

      if (res.error) {
        setGeneralError(res.error);
        if (res.errors) {
          setFieldErrors(res.errors);
        }
      } else {
        const msg =
          mode === 'create'
            ? `Medical case ${caseNumber} created successfully.`
            : `Medical case ${caseNumber} updated successfully.`;
        onSuccess(msg);
        onNavigate('cases');
      }
    } catch {
      setGeneralError('An unexpected server error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const generateDummyCaseNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setCaseNumber(`CASE-${randomNum}`);
    if (fieldErrors.case_number) {
      setFieldErrors({ ...fieldErrors, case_number: [] });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('cases')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to Cases"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {mode === 'create' ? 'Create New Medical Case' : `Edit Medical Case (${caseNumber})`}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'create'
                ? 'Register a new patient-specific surgical implant tracking case.'
                : 'Modify surgical details, implant specifications, or status.'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Admin Write Access
        </div>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Validation or Server Error</div>
            <p className="mt-0.5 text-red-700">{generalError}</p>
          </div>
        </div>
      )}

      {/* Reusable Case Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Case Number */}
          <div className="sm:col-span-1">
            <div className="flex items-center justify-between">
              <label htmlFor="case_number" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Case Number <span className="text-red-500">*</span>
              </label>
              {mode === 'create' && (
                <button
                  type="button"
                  onClick={generateDummyCaseNumber}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Generate Sample #
                </button>
              )}
            </div>
            <div className="mt-1 relative">
              <input
                id="case_number"
                type="text"
                value={caseNumber}
                onChange={(e) => {
                  setCaseNumber(e.target.value);
                  if (fieldErrors.case_number) setFieldErrors({ ...fieldErrors, case_number: [] });
                }}
                placeholder="e.g. CASE-0042"
                className={`block w-full px-3.5 py-2 text-sm font-mono border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors ${
                  fieldErrors.case_number && fieldErrors.case_number.length > 0
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-slate-300'
                }`}
              />
            </div>
            {fieldErrors.case_number && fieldErrors.case_number[0] && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                {fieldErrors.case_number[0]}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-500">
              Must be unique across all cases (enforced by DB index and Form Request).
            </p>
          </div>

          {/* Patient Reference */}
          <div className="sm:col-span-1">
            <label htmlFor="patient_reference" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Patient Reference <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative">
              <input
                id="patient_reference"
                type="text"
                value={patientReference}
                onChange={(e) => {
                  setPatientReference(e.target.value);
                  if (fieldErrors.patient_reference) setFieldErrors({ ...fieldErrors, patient_reference: [] });
                }}
                placeholder="e.g. PAT-94821 (Fictional ID only)"
                className={`block w-full px-3.5 py-2 text-sm font-mono border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors ${
                  fieldErrors.patient_reference && fieldErrors.patient_reference.length > 0
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-slate-300'
                }`}
              />
            </div>
            {fieldErrors.patient_reference && fieldErrors.patient_reference[0] && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                {fieldErrors.patient_reference[0]}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-500">
              Dummy pseudonymized identifier for HIPAA/GDPR mock compliance.
            </p>
          </div>

          {/* Surgeon Name */}
          <div className="sm:col-span-2">
            <label htmlFor="surgeon_name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Surgeon Name <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative">
              <input
                id="surgeon_name"
                type="text"
                value={surgeonName}
                onChange={(e) => {
                  setSurgeonName(e.target.value);
                  if (fieldErrors.surgeon_name) setFieldErrors({ ...fieldErrors, surgeon_name: [] });
                }}
                placeholder="e.g. Dr. Robert Miller"
                className={`block w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors ${
                  fieldErrors.surgeon_name && fieldErrors.surgeon_name.length > 0
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-slate-300'
                }`}
              />
            </div>
            {fieldErrors.surgeon_name && fieldErrors.surgeon_name[0] && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                {fieldErrors.surgeon_name[0]}
              </p>
            )}
          </div>

          {/* Implant Type */}
          <div className="sm:col-span-2">
            <label htmlFor="implant_type" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Implant Type & Specification <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative">
              <input
                id="implant_type"
                type="text"
                value={implantType}
                onChange={(e) => {
                  setImplantType(e.target.value);
                  if (fieldErrors.implant_type) setFieldErrors({ ...fieldErrors, implant_type: [] });
                }}
                placeholder="e.g. Custom Titanium Cranial Plate / PEEK Lumbar Cage"
                className={`block w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors ${
                  fieldErrors.implant_type && fieldErrors.implant_type.length > 0
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-slate-300'
                }`}
              />
            </div>
            {fieldErrors.implant_type && fieldErrors.implant_type[0] && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                {fieldErrors.implant_type[0]}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="sm:col-span-1">
            <label htmlFor="status" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Case Status <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className="block w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors.status && fieldErrors.status[0] && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{fieldErrors.status[0]}</p>
            )}
            <p className="mt-1 text-[11px] text-slate-500">Only Admin may change status.</p>
          </div>

          {/* Priority */}
          <div className="sm:col-span-1">
            <label htmlFor="priority" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Priority Level <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as CasePriority)}
                className="block w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors.priority && fieldErrors.priority[0] && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{fieldErrors.priority[0]}</p>
            )}
          </div>

          {/* Surgery Date (Optional) */}
          <div className="sm:col-span-2">
            <label htmlFor="surgery_date" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Surgery Date <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="mt-1 relative">
              <input
                id="surgery_date"
                type="date"
                value={surgeryDate}
                onChange={(e) => {
                  setSurgeryDate(e.target.value);
                  if (fieldErrors.surgery_date) setFieldErrors({ ...fieldErrors, surgery_date: [] });
                }}
                className={`block w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors ${
                  fieldErrors.surgery_date && fieldErrors.surgery_date.length > 0
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-slate-300'
                }`}
              />
            </div>
            {fieldErrors.surgery_date && fieldErrors.surgery_date[0] && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                {fieldErrors.surgery_date[0]}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-500">
              Leave blank if the procedure has not yet been scheduled on the surgical calendar.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('cases')}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting
              ? 'Saving to DB...'
              : mode === 'create'
              ? 'Save Medical Case'
              : 'Update Medical Case'}
          </button>
        </div>
      </form>
    </div>
  );
};
