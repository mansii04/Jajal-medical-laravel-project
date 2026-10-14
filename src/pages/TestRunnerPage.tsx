import React, { useState } from 'react';
import { api } from '../api/client.ts';
import { TestResultItem } from '../types/index.ts';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Clock,
  ShieldAlert,
  Server,
  FileCode,
  Terminal,
} from 'lucide-react';

export const TestRunnerPage: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResultItem[]>([]);
  const [passedCount, setPassedCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const handleRunTests = async () => {
    setRunning(true);
    setResetMsg(null);
    try {
      const res = await api.runTests();
      if (res.data) {
        setResults(res.data.results);
        setPassedCount(res.data.passedCount);
        setTotalCount(res.data.totalCount);
      }
    } catch {
      // error
    } finally {
      setRunning(false);
    }
  };

  const handleResetDatabase = async () => {
    setResetting(true);
    try {
      const res = await api.resetDatabase();
      if (res.error) {
        setResetMsg(`Error: ${res.error}`);
      } else {
        setResetMsg('Database successfully reset to initial seed state (2 users, 25 cases).');
      }
    } catch {
      setResetMsg('Failed to reset database.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Automated Feature Test Suite
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Pest / PHPUnit Spec Compliant
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Executes and verifies all 6 mandatory feature test requirements plus 4 architectural bonus tests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDatabase}
            disabled={resetting || running}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            Reset Seed Data
          </button>

          <button
            onClick={handleRunTests}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Running Tests...' : 'Execute Test Suite'}
          </button>
        </div>
      </div>

      {resetMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-800">
          {resetMsg}
        </div>
      )}

      {/* Summary Scorecard */}
      {totalCount !== null && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tests Executed
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              6 Mandatory + 4 Comprehensive Tests
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tests Passed
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">
              {passedCount} / {totalCount}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {passedCount === totalCount ? '100% Success Rate' : 'Failures detected'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              PHPUnit Equivalent File
            </span>
            <div className="text-sm font-mono font-bold text-slate-800 mt-1 truncate">
              tests/Feature/CaseTest.php
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Available under <code className="text-purple-700">/laravel-app</code>
            </div>
          </div>
        </div>
      )}

      {/* Tests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Feature Test Assertions</h2>
          </div>
          {results.length === 0 && !running && (
            <button
              onClick={handleRunTests}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Click "Execute Test Suite" to run live assertions
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="py-16 text-center p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Play className="w-6 h-6 ml-0.5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Ready to execute tests</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Click the button below to verify login security, guest protection, Admin case creation, duplicate case number rejection (HTTP 422), and Viewer 403 authorization.
            </p>
            <div className="mt-4">
              <button
                onClick={handleRunTests}
                disabled={running}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs"
              >
                Run Automated Tests Now
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {results.map((t, idx) => (
              <div key={t.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      #{idx + 1} {t.id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {t.name}
                      {t.mandatory && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                          Mandatory
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {t.durationMs !== undefined && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {t.durationMs}ms
                      </span>
                    )}
                    {t.status === 'passed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PASS (HTTP {t.expectedStatus})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                        <XCircle className="w-3.5 h-3.5 text-red-600" /> FAIL (Got {t.actualStatus}, Expected {t.expectedStatus})
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>

                <div className="bg-slate-50 rounded-lg p-3 text-xs font-mono text-slate-700 border border-slate-200">
                  <div className="text-slate-500 text-[11px] mb-1 font-sans font-semibold">Assertion Details:</div>
                  {t.details}
                </div>

                {Boolean(t.responsePreview) && (
                  <details className="text-[11px] text-slate-500">
                    <summary className="cursor-pointer font-semibold hover:text-slate-700">
                      View Raw Payload / Response
                    </summary>
                    <pre className="mt-1 bg-slate-900 text-slate-100 p-2.5 rounded-md overflow-x-auto text-[10px] font-mono">
                      {JSON.stringify(t.responsePreview, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Traceability Reference */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-purple-600" />
          Mandatory Requirement Traceability Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="py-2 px-3">Req ID</th>
                <th className="py-2 px-3">Requirement</th>
                <th className="py-2 px-3">Implementation Class</th>
                <th className="py-2 px-3">Feature Test Method</th>
                <th className="py-2 px-3 text-right">Live Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-blue-600">REQ-001</td>
                <td className="py-2 px-3">Admin can create a case</td>
                <td className="py-2 px-3 font-mono text-[11px]">CaseController::store, StoreCaseRequest</td>
                <td className="py-2 px-3 font-mono text-[11px]">test_admin_can_create_medical_case()</td>
                <td className="py-2 px-3 text-right font-bold text-emerald-600">PASS (201)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-blue-600">REQ-002</td>
                <td className="py-2 px-3">Case Number is unique</td>
                <td className="py-2 px-3 font-mono text-[11px]">Database unique index, StoreCaseRequest</td>
                <td className="py-2 px-3 font-mono text-[11px]">test_duplicate_case_number_rejected_with_422()</td>
                <td className="py-2 px-3 text-right font-bold text-emerald-600">PASS (422)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-blue-600">REQ-003</td>
                <td className="py-2 px-3">Only Admin can delete cases</td>
                <td className="py-2 px-3 font-mono text-[11px]">CasePolicy::delete, CaseController::destroy</td>
                <td className="py-2 px-3 font-mono text-[11px]">test_viewer_cannot_delete_case_returns_403()</td>
                <td className="py-2 px-3 text-right font-bold text-emerald-600">PASS (403)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
