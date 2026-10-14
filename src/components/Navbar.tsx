import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  CheckCircle2,
  FileCode2,
  LogOut,
  ShieldCheck,
  Eye,
  Activity,
  Terminal,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'cases'
  | 'create'
  | 'details'
  | 'edit'
  | 'tests'
  | 'laravel-code'
  | 'api-playground';

interface NavbarProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  pendingChanges?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate }) => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">MedCase Pro</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    Jajal Medical
                  </span>
                </div>
                <p className="text-xs text-slate-500">Surgical Implant Tracking System</p>
              </div>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => onNavigate('cases')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'cases' || activeTab === 'details' || activeTab === 'edit'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              Medical Cases
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigate('create')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'create'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                New Case
              </button>
            )}

            <button
              onClick={() => onNavigate('tests')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'tests'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Automated Tests
            </button>

            <button
              onClick={() => onNavigate('api-playground')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'api-playground'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Terminal className="w-4 h-4 text-indigo-600" />
              API Playground
            </button>

            <button
              onClick={() => onNavigate('laravel-code')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'laravel-code'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileCode2 className="w-4 h-4 text-purple-600" />
              Laravel Codebase & Docs
            </button>
          </nav>

          {/* User profile & Actions */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        <Eye className="w-3 h-3 text-amber-600" /> Viewer (Read-only)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Logout from application"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden border-t border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-around text-xs">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded ${
            activeTab === 'dashboard' ? 'text-blue-700 font-bold' : 'text-slate-600'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('cases')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded ${
            activeTab === 'cases' || activeTab === 'details' || activeTab === 'edit'
              ? 'text-blue-700 font-bold'
              : 'text-slate-600'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          Cases
        </button>
        {isAdmin && (
          <button
            onClick={() => onNavigate('create')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded ${
              activeTab === 'create' ? 'text-emerald-700 font-bold' : 'text-slate-600'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            New
          </button>
        )}
        <button
          onClick={() => onNavigate('tests')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded ${
            activeTab === 'tests' ? 'text-blue-700 font-bold' : 'text-slate-600'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Tests
        </button>
        <button
          onClick={() => onNavigate('laravel-code')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded ${
            activeTab === 'laravel-code' ? 'text-purple-700 font-bold' : 'text-slate-600'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          Laravel
        </button>
      </div>
    </header>
  );
};
