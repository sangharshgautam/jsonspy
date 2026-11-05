import React, { useState } from 'react';
import {
  BarChart3,
  ShieldCheck,
  FileCode,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SidebarProps {
  content: string;
  schemaContent?: string;
  onAttachSchema: (schemaStr: string) => void;
  onSelectSamplePreset: (key: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  content,
  schemaContent,
  onAttachSchema,
  onSelectSamplePreset,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [schemaDraft, setSchemaDraft] = useState<'draft-07' | 'draft-2020-12'>('draft-2020-12');

  const computeStats = () => {
    const bytes = new Blob([content]).size;
    const sizeFormatted =
      bytes > 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
        : bytes > 1024
        ? `${(bytes / 1024).toFixed(2)} KB`
        : `${bytes} B`;

    const lines = content.split('\n').length;

    let keyCount = 0;
    let maxDepth = 0;
    let isValid = false;

    try {
      const parsed = JSON.parse(content);
      isValid = true;

      const traverse = (obj: any, currentDepth: number) => {
        if (currentDepth > maxDepth) maxDepth = currentDepth;
        if (typeof obj === 'object' && obj !== null) {
          for (const [key, val] of Object.entries(obj)) {
            keyCount++;
            traverse(val, currentDepth + 1);
          }
        }
      };
      traverse(parsed, 1);
    } catch (e) {
      isValid = false;
    }

    return { sizeFormatted, lines, keyCount, maxDepth, isValid };
  };

  const stats = computeStats();

  if (collapsed) {
    return (
      <div className="w-12 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 space-y-6">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <BarChart3 className="w-5 h-5 text-brand-500 dark:text-brand-400" />
        <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      </div>
    );
  }

  return (
    <aside className="w-64 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 overflow-y-auto select-none text-xs">
      <div className="space-y-6">
        {/* Header Title & Collapse Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-slate-800 dark:text-slate-200 tracking-wide flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-brand-500 dark:text-brand-400" />
            Document Inspector
          </span>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Document Stats Box */}
        <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 font-mono">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-900 pb-1">
            <span>Syntax Status</span>
            {stats.isValid ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" /> Invalid
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 pt-1">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px]">File Size</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">{stats.sizeFormatted}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Total Lines</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{stats.lines}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Key Count</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.keyCount}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Nesting Depth</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{stats.maxDepth}</span>
            </div>
          </div>
        </div>

        {/* Ajv Schema Validation Engine Panel */}
        <div className="space-y-3">
          <span className="font-semibold text-slate-800 dark:text-slate-300 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-purple-600 dark:text-purple-400" />
            Ajv Schema Validation
          </span>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Draft Specification</label>
            <select
              value={schemaDraft}
              onChange={(e) => setSchemaDraft(e.target.value as any)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="draft-2020-12">JSON Schema Draft 2020-12</option>
              <option value="draft-07">JSON Schema Draft-07</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Attached Schema</label>
            {schemaContent ? (
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 rounded flex items-center justify-between text-purple-800 dark:text-purple-300 font-mono">
                <span className="truncate">Schema Active</span>
                <button
                  onClick={() => onAttachSchema('')}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-sans"
                >
                  Detach
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelectSamplePreset('schema')}
                className="w-full py-1.5 px-3 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800 rounded text-left transition flex items-center justify-between"
              >
                <span>Attach Sample Order Schema</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </button>
            )}
          </div>
        </div>

        {/* Preset Templates Quick Menu */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="font-semibold text-slate-800 dark:text-slate-300 flex items-center">
            <FileCode className="w-4 h-4 mr-1.5 text-sky-600 dark:text-sky-400" />
            Quick Preset Payloads
          </span>
          <div className="space-y-1">
            <button
              onClick={() => onSelectSamplePreset('order')}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            >
              E-Commerce Order
            </button>
            <button
              onClick={() => onSelectSamplePreset('profile')}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            >
              User Profile & Permissions
            </button>
            <button
              onClick={() => onSelectSamplePreset('geojson')}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            >
              GeoJSON Spatial Data
            </button>
            <button
              onClick={() => onSelectSamplePreset('openapi')}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            >
              OpenAPI 3.0 Gateway Spec
            </button>
            <button
              onClick={() => onSelectSamplePreset('broken')}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 font-mono transition"
            >
              Broken JSON (SmartFix Demo)
            </button>
          </div>
        </div>
      </div>

      {/* Footer System info */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 font-mono flex items-center justify-between">
        <span>Tauri v2 Desktop</span>
        <span className="text-emerald-600 dark:text-emerald-500 font-bold">Online</span>
      </div>
    </aside>
  );
};
