import React, { useState } from 'react';
import { LARAVEL_PROJECT_FILES, LaravelFileItem } from '../data/laravelSourceFiles.ts';
import {
  FileCode,
  FolderTree,
  Copy,
  Check,
  Download,
  Terminal,
  BookOpen,
  GitBranch,
  ExternalLink,
} from 'lucide-react';

export const LaravelCodeInspectorPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<LaravelFileItem>(LARAVEL_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const copyContent = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    { key: 'all', label: 'All Files' },
    { key: 'models', label: 'Models' },
    { key: 'controllers', label: 'Controllers' },
    { key: 'requests', label: 'Form Requests' },
    { key: 'policies', label: 'Policies' },
    { key: 'migrations', label: 'Migrations & Seeds' },
    { key: 'tests', label: 'Pest / PHPUnit' },
    { key: 'routes', label: 'Routes' },
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFiles = LARAVEL_PROJECT_FILES.filter((f) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'migrations') {
      return f.category === 'migrations' || f.category === 'seeders';
    }
    return f.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FileCode className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Laravel 11 Source Codebase & Architecture
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          Full production PHP implementation for the Jajal Medical assignment (located under <code className="text-purple-700 bg-purple-50 px-1 py-0.5 rounded">/laravel-app</code>).
        </p>
      </div>

      {/* Quick Setup Instructions Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-purple-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-700" />
            Local Laravel Execution Commands (Terminal / Shell)
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-200 text-purple-800">
            PHP 8.2+ / MySQL
          </span>
        </div>
        <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-xs font-mono overflow-x-auto space-y-1">
          <div><span className="text-slate-500"># 1. Navigate and install PHP dependencies</span></div>
          <div>cd laravel-app &amp;&amp; composer install</div>
          <div><span className="text-slate-500"># 2. Setup environment and generate application key</span></div>
          <div>cp .env.example .env &amp;&amp; php artisan key:generate</div>
          <div><span className="text-slate-500"># 3. Run database migrations with seed data (2 users, 25 cases)</span></div>
          <div>php artisan migrate:fresh --seed</div>
          <div><span className="text-slate-500"># 4. Run automated test suite</span></div>
          <div>php artisan test</div>
          <div><span className="text-slate-500"># 5. Start Laravel development server</span></div>
          <div>php artisan serve</div>
        </div>
      </div>

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category & File Browser */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1 pb-2 border-b border-slate-100">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  activeCategory === c.key
                    ? 'bg-purple-100 text-purple-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* File List */}
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {filteredFiles.map((f) => {
              const isSelected = f.path === selectedFile.path;
              return (
                <button
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-50 text-purple-800 font-bold border border-purple-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{f.path}</span>
                  <span className="text-[10px] uppercase font-sans text-slate-400">
                    {f.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-purple-600" />
              <span className="font-mono text-sm font-bold text-slate-800">
                laravel-app/{selectedFile.path}
              </span>
            </div>

            <button
              onClick={copyContent}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  Copy File
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto max-h-[600px]">
            <pre className="text-slate-200 font-mono text-xs leading-relaxed">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
