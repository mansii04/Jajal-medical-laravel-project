import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar, ActiveTab } from './components/Navbar.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { CaseListPage } from './pages/CaseListPage.tsx';
import { CaseFormPage } from './pages/CaseFormPage.tsx';
import { CaseDetailPage } from './pages/CaseDetailPage.tsx';
import { TestRunnerPage } from './pages/TestRunnerPage.tsx';
import { LaravelCodeInspectorPage } from './pages/LaravelCodeInspectorPage.tsx';
import { ApiPlaygroundPage } from './pages/ApiPlaygroundPage.tsx';

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<number | undefined>(undefined);
  const [flashMessage, setFlashMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Initializing MedCase Pro...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigate = (tab: ActiveTab, caseId?: number) => {
    setActiveTab(tab);
    if (caseId !== undefined) {
      setSelectedCaseId(caseId);
    }
  };

  const handleFormSuccess = (msg: string) => {
    setFlashMessage({ type: 'success', text: msg });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Navbar activeTab={activeTab} onNavigate={handleNavigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}

        {activeTab === 'cases' && (
          <CaseListPage
            onNavigate={handleNavigate}
            flashMessage={flashMessage}
            onClearFlash={() => setFlashMessage(null)}
          />
        )}

        {activeTab === 'create' && (
          <CaseFormPage
            mode="create"
            onNavigate={handleNavigate}
            onSuccess={handleFormSuccess}
          />
        )}

        {activeTab === 'edit' && selectedCaseId && (
          <CaseFormPage
            mode="edit"
            caseId={selectedCaseId}
            onNavigate={handleNavigate}
            onSuccess={handleFormSuccess}
          />
        )}

        {activeTab === 'details' && selectedCaseId && (
          <CaseDetailPage
            caseId={selectedCaseId}
            onNavigate={handleNavigate}
            onDeleteSuccess={(msg) => {
              setFlashMessage({ type: 'success', text: msg });
            }}
          />
        )}

        {activeTab === 'tests' && <TestRunnerPage />}

        {activeTab === 'laravel-code' && <LaravelCodeInspectorPage />}

        {activeTab === 'api-playground' && <ApiPlaygroundPage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            MedCase Pro • Jajal Medical Software Developer Intern Practical Assignment
          </div>
          <div className="flex items-center gap-4">
            <span>Laravel 11 • MySQL Architecture • Sanctum API</span>
            <span>Live Express/React Prototype</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
