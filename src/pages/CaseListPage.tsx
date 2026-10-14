import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.ts';
import { MedicalCase, PaginatedData } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ActiveTab } from '../components/Navbar.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { PriorityBadge } from '../components/PriorityBadge.tsx';
import {
  Search,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Calendar,
  User as UserIcon,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

interface CaseListPageProps {
  onNavigate: (tab: ActiveTab, caseId?: number) => void;
  flashMessage?: { type: 'success' | 'error'; text: string } | null;
  onClearFlash?: () => void;
}

export const CaseListPage: React.FC<CaseListPageProps> = ({
  onNavigate,
  flashMessage: initialFlash,
  onClearFlash,
}) => {
  const { isAdmin } = useAuth();

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [surgeonFilter, setSurgeonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Data & loading state
  const [paginatedData, setPaginatedData] = useState<PaginatedData<MedicalCase> | null>(null);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; text: string } | null>(
    initialFlash || null
  );

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<MedicalCase | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getCases({
        page: currentPage,
        per_page: 10,
        search: searchTerm,
        surgeon: surgeonFilter,
        status: statusFilter,
        priority: priorityFilter,
      });

      if (res.data) {
        setPaginatedData(res.data);
      } else {
        setFlash({ type: 'error', text: res.error || 'Failed to retrieve cases' });
      }
    } catch {
      setFlash({ type: 'error', text: 'Network error while fetching medical cases' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, surgeonFilter, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // When filters change, reset to page 1
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleSurgeonChange = (val: string) => {
    setSurgeonFilter(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handlePriorityChange = (val: string) => {
    setPriorityFilter(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSurgeonFilter('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCurrentPage(1);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);

    const res = await api.deleteCase(deleteTarget.id);
    setIsDeleting(false);

    if (res.error) {
      // If 403 or server rejection
      setDeleteError(res.error);
    } else {
      setFlash({
        type: 'success',
        text: `Medical case ${deleteTarget.case_number} was successfully deleted.`,
      });
      setDeleteTarget(null);
      fetchCases();
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Medical Cases</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage surgical cases, implant designs, and review clinical approvals.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onNavigate('create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create Case
          </button>
        )}
      </div>

      {/* Flash Messages */}
      {flash && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between border ${
            flash.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {flash.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="text-sm font-medium">{flash.text}</span>
          </div>
          <button
            onClick={() => {
              setFlash(null);
              if (onClearFlash) onClearFlash();
            }}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by Case Number or keyword */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search Case Number..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search by Surgeon Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <UserIcon className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search Surgeon Name..."
              value={surgeonFilter}
              onChange={(e) => handleSurgeonChange(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter by Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              aria-label="Filter by Status"
              className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Planning">Planning</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Filter by Priority */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => handlePriorityChange(e.target.value)}
              aria-label="Filter by Priority"
              className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        {(searchTerm || surgeonFilter || statusFilter !== 'all' || priorityFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Active filters applied. Showing matching results.</span>
            </div>
            <button
              onClick={handleClearFilters}
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="mt-2 text-sm text-slate-600">Loading cases from database...</p>
          </div>
        ) : paginatedData && paginatedData.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Case #</th>
                  <th className="py-3 px-4">Patient Ref</th>
                  <th className="py-3 px-4">Surgeon</th>
                  <th className="py-3 px-4">Implant Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Surgery Date</th>
                  <th className="py-3 px-4">Created By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedData.data.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700 whitespace-nowrap">
                      {c.case_number}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {c.patient_reference}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {c.surgeon_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={c.implant_type}>
                      {c.implant_type}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {c.surgery_date ? (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {c.surgery_date}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unscheduled</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {c.creator ? c.creator.name : `User #${c.created_by}`}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate('details', c.id)}
                          title="View Case Details"
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => onNavigate('edit', c.id)}
                              title="Edit Case"
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(c);
                                setDeleteError(null);
                              }}
                              title="Delete Case"
                              className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span
                            title="Viewer role: read-only access (403 on edit/delete)"
                            className="text-[11px] text-slate-400 italic px-1"
                          >
                            Read-only
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No medical cases found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              No cases matched your search query or filter parameters. Try clearing your filters or adding a new case.
            </p>
            <div className="mt-4">
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Pagination Footer (10 cases per page) */}
        {paginatedData && paginatedData.total > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-800">{paginatedData.from}</span> to{' '}
              <span className="font-semibold text-slate-800">{paginatedData.to}</span> of{' '}
              <span className="font-semibold text-slate-800">{paginatedData.total}</span> cases
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <div className="px-2 font-medium text-slate-700">
                Page {currentPage} of {paginatedData.last_page}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(paginatedData.last_page, p + 1))}
                disabled={currentPage >= paginatedData.last_page}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-100 rounded-xl text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Medical Case</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete case{' '}
                  <strong className="text-slate-800">{deleteTarget.case_number}</strong>?
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Authorization/Server Rejection:</strong> {deleteError}
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-700">
              <div>
                <span className="font-semibold text-slate-500">Patient Ref:</span>{' '}
                {deleteTarget.patient_reference}
              </div>
              <div>
                <span className="font-semibold text-slate-500">Surgeon:</span>{' '}
                {deleteTarget.surgeon_name}
              </div>
              <div>
                <span className="font-semibold text-slate-500">Implant:</span>{' '}
                {deleteTarget.implant_type}
              </div>
            </div>

            <p className="text-xs text-slate-500 italic">
              This action enforces backend authorization via Laravel CasePolicy. Only Admin role can proceed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting from DB...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
