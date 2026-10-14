import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Terminal,
  Send,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface EndpointConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  permission: 'Public' | 'Authenticated' | 'Admin';
  defaultBody?: string;
}

export const ApiPlaygroundPage: React.FC = () => {
  const { token, user, isAdmin } = useAuth();

  const endpoints: EndpointConfig[] = [
    {
      method: 'POST',
      path: '/api/login',
      description: 'Authenticate user & issue Sanctum token',
      permission: 'Public',
      defaultBody: JSON.stringify(
        { email: 'admin@jajalmedical.com', password: 'admin123' },
        null,
        2
      ),
    },
    {
      method: 'POST',
      path: '/api/logout',
      description: 'Revoke authenticated Sanctum token',
      permission: 'Authenticated',
      defaultBody: '',
    },
    {
      method: 'GET',
      path: '/api/cases?page=1&per_page=10',
      description: 'Retrieve paginated case list (10/page)',
      permission: 'Authenticated',
    },
    {
      method: 'POST',
      path: '/api/cases',
      description: 'Create new medical case (Admin only)',
      permission: 'Admin',
      defaultBody: JSON.stringify(
        {
          case_number: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
          patient_reference: 'PAT-DEMO-01',
          surgeon_name: 'Dr. Robert Miller',
          implant_type: 'Custom Titanium Maxillofacial Mesh',
          status: 'Planning',
          priority: 'High',
          surgery_date: '2026-11-20',
        },
        null,
        2
      ),
    },
    {
      method: 'GET',
      path: '/api/cases/1',
      description: 'Retrieve single case details by ID',
      permission: 'Authenticated',
    },
    {
      method: 'PUT',
      path: '/api/cases/1',
      description: 'Update existing case (Admin only)',
      permission: 'Admin',
      defaultBody: JSON.stringify(
        {
          case_number: 'CASE-0001',
          patient_reference: 'PAT-84920',
          surgeon_name: 'Dr. Robert Miller',
          implant_type: 'Custom Titanium Cranial Plate (Revised Spec)',
          status: 'Approved',
          priority: 'High',
          surgery_date: '2026-10-25',
        },
        null,
        2
      ),
    },
    {
      method: 'DELETE',
      path: '/api/cases/25',
      description: 'Delete medical case by ID (Admin only)',
      permission: 'Admin',
    },
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(endpoints[2]);
  const [customPath, setCustomPath] = useState(endpoints[2].path);
  const [requestBody, setRequestBody] = useState(endpoints[2].defaultBody || '');
  const [useAuthHeader, setUseAuthHeader] = useState(true);
  const [customToken, setCustomToken] = useState(token || '');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responsePayload, setResponsePayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectEndpoint = (ep: EndpointConfig) => {
    setSelectedEndpoint(ep);
    setCustomPath(ep.path);
    setRequestBody(ep.defaultBody || '');
    setResponseStatus(null);
    setResponsePayload(null);
  };

  const handleSendRequest = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponsePayload(null);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (useAuthHeader && customToken) {
      headers['Authorization'] = `Bearer ${customToken}`;
    }

    try {
      const res = await fetch(customPath, {
        method: selectedEndpoint.method,
        headers,
        body:
          selectedEndpoint.method !== 'GET' && requestBody.trim() ? requestBody : undefined,
      });

      setResponseStatus(res.status);
      try {
        const json = await res.json();
        setResponsePayload(json);
      } catch {
        const text = await res.text();
        setResponsePayload({ text });
      }
    } catch (err: unknown) {
      setResponseStatus(0);
      setResponsePayload({ error: err instanceof Error ? err.message : 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(responsePayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Interactive REST API Playground
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          Test all 7 required Sanctum-protected endpoints with live status codes (200, 201, 401, 403, 404, 422).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint Selector List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 mb-2">
            7 Required Endpoints
          </h2>
          <div className="space-y-1.5">
            {endpoints.map((ep, idx) => {
              const isSelected =
                ep.method === selectedEndpoint.method && ep.path === selectedEndpoint.path;
              return (
                <button
                  key={idx}
                  onClick={() => selectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/80 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        ep.method === 'GET'
                          ? 'bg-blue-100 text-blue-800'
                          : ep.method === 'POST'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ep.method === 'PUT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {ep.permission}
                    </span>
                  </div>
                  <div className="font-mono text-slate-800 font-semibold truncate">
                    {ep.path}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {ep.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Request & Response Workbench */}
        <div className="lg:col-span-2 space-y-4">
          {/* Request Config */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span
                className={`font-mono font-bold px-2 py-1 rounded text-xs ${
                  selectedEndpoint.method === 'GET'
                    ? 'bg-blue-100 text-blue-800'
                    : selectedEndpoint.method === 'POST'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedEndpoint.method === 'PUT'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {selectedEndpoint.method}
              </span>
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                className="flex-1 font-mono text-sm px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendRequest}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>

            {/* Auth Header Toggle */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAuthHeader}
                    onChange={(e) => setUseAuthHeader(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Include Authorization Header (Sanctum Bearer Token)</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Current User: <strong>{user?.name || 'Guest'}</strong> (Role: {user?.role || 'None'})
                </span>
              </div>
              {useAuthHeader && (
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    placeholder="Bearer token string..."
                    className="w-full font-mono text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded"
                  />
                </div>
              )}
            </div>

            {/* Request Body (for POST / PUT) */}
            {selectedEndpoint.method !== 'GET' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Request Payload (JSON)
                </label>
                <textarea
                  rows={5}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full font-mono text-xs p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Response Output */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Live Response Output
                </h3>
                {responseStatus !== null && (
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-100 text-emerald-800'
                        : responseStatus === 401 || responseStatus === 403
                        ? 'bg-amber-100 text-amber-800'
                        : responseStatus === 422
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    HTTP {responseStatus}
                  </span>
                )}
              </div>

              {Boolean(responsePayload) && (
                <button
                  onClick={copyResponse}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy JSON
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="bg-slate-950 rounded-xl p-4 min-h-[160px] max-h-[360px] overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-400 text-xs font-mono">
                  Waiting for response...
                </div>
              ) : responsePayload ? (
                <pre className="text-emerald-400 font-mono text-xs">
                  {JSON.stringify(responsePayload, null, 2)}
                </pre>
              ) : (
                <div className="text-slate-500 text-xs font-mono py-10 text-center">
                  Select an endpoint and click "Send" to execute the request.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
