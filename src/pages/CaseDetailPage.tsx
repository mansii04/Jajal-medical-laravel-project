import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { MedicalCase } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ActiveTab } from '../components/Navbar.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { PriorityBadge } from '../components/PriorityBadge.tsx';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Edit2,
  Trash2,
  ShieldCheck,
  Activity,
  FileText,
  Hospital,
  AlertCircle,
  Hash,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface CaseDetailPageProps {
  caseId: number;
  onNavigate: (tab: ActiveTab, caseId?: number) => void;
  onDeleteSuccess?: (message: string) => void;
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({
  caseId,
  onNavigate,
  onDeleteSuccess,
}) => {
  const { isAdmin } = useAuth();
  const [medicalCase, setMedicalCase] = useState<MedicalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getCase(caseId).then((res) => {
      if (res.data) {
        setMedicalCase(res.data);
      } else {
        setError(res.error || 'Medical case not found');
      }
      setLoading(false);
    });
  }, [caseId]);

  const handleDelete = async () => {
    if (!medicalCase) return;
    setIsDeleting(true);
    const res = await api.deleteCase(medicalCase.id);
    setIsDeleting(false);

    if (res.error) {
      setError(res.error);
      setShowDeleteModal(false);
    } else {
      if (onDeleteSuccess) {
        onDeleteSuccess(`Medical case ${medicalCase.case_number} was successfully deleted.`);
      }
      onNavigate('cases');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !medicalCase) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl p-8 border border-slate-200 shadow-md text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Case Not Found</h2>
        <p className="text-sm text-slate-600">{error || 'Requested medical case does not exist.'}</p>
        <button
          onClick={() => onNavigate('cases')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Back to Case List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Navigation Back */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('cases')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Return to Case List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Case Details
              </h1>
              <span className="font-mono text-base font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {medicalCase.case_number}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive clinical case summary and surgical specification.
            </p>
          </div>
        </div>

        {/* Action Buttons for Admin */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => onNavigate('edit', medicalCase.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Case
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Case
              </button>
            </>
          ) : (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Viewer Access (Read-Only)
            </span>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Status & Priority Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Workflow Status
              </span>
              <div className="mt-1">
                <StatusBadge status={medicalCase.status} />
              </div>
            </div>
            <div className="h-8 w-px bg-slate-300 mx-2" />
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Clinical Priority
              </span>
              <div className="mt-1">
                <PriorityBadge priority={medicalCase.priority} />
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>Internal ID: <strong className="text-slate-800">#{medicalCase.id}</strong></div>
            <div>Unique Index: <strong className="font-mono text-slate-800">{medicalCase.case_number}</strong></div>
          </div>
        </div>

        {/* Key Fields Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-600" />
              Case Number
            </span>
            <p className="font-mono text-base font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {medicalCase.case_number}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Patient Reference (Pseudonymized)
            </span>
            <p className="font-mono text-base font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {medicalCase.patient_reference}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Hospital className="w-3.5 h-3.5 text-emerald-600" />
              Surgeon Name
            </span>
            <p className="text-base font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {medicalCase.surgeon_name}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              Surgery Date
            </span>
            <p className="text-base font-medium text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {medicalCase.surgery_date ? (
                <span className="text-slate-900 font-semibold">{medicalCase.surgery_date}</span>
              ) : (
                <span className="text-slate-400 italic">Not yet scheduled on surgical calendar</span>
              )}
            </p>
          </div>

          <div className="md:col-span-2 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-600" />
              Implant Type & Engineering Specification
            </span>
            <p className="text-base text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-medium">
              {medicalCase.implant_type}
            </p>
          </div>
        </div>

        {/* Audit & Creator Information */}
        <div className="p-6 bg-slate-50/70 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Audit Trail & User Attribution
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 block mb-0.5">Created By</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                {medicalCase.creator?.name || `User ID #${medicalCase.created_by}`}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Role: {medicalCase.creator?.role || 'admin'}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 block mb-0.5">Created At (Timestamp)</span>
              <span className="font-mono text-slate-800 block">
                {new Date(medicalCase.created_at).toLocaleString()}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 block mb-0.5">Last Updated At</span>
              <span className="font-mono text-slate-800 block">
                {new Date(medicalCase.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-100 rounded-xl text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete medical case{' '}
                  <strong className="text-slate-900">{medicalCase.case_number}</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              This action cannot be undone and will delete the record from the database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
