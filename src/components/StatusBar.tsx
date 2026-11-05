import React from 'react';
import { ViewMode } from '../types/jsonspy';
import { ShieldCheck, FileCode, Monitor } from 'lucide-react';

interface StatusBarProps {
  filePath?: string;
  viewMode: ViewMode;
  charCount: number;
  lineCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  filePath,
  viewMode,
  charCount,
  lineCount,
}) => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 select-none z-20">
      <div className="flex items-center space-x-4">
        <span className="flex items-center text-sky-600 dark:text-sky-400">
          <FileCode className="w-3.5 h-3.5 mr-1" />
          {filePath || 'Untitled Workspace Document'}
        </span>

        <span className="text-slate-300 dark:text-slate-600">|</span>

        <span>
          {lineCount} lines, {charCount} characters
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <span className="flex items-center text-purple-600 dark:text-purple-400">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          Ajv Engine Ready
        </span>

        <span className="text-slate-300 dark:text-slate-600">|</span>

        <span className="uppercase text-brand-600 dark:text-brand-400 font-semibold">{viewMode} Mode</span>

        <span className="text-slate-300 dark:text-slate-600">|</span>

        <span className="flex items-center text-emerald-600 dark:text-emerald-400">
          <Monitor className="w-3.5 h-3.5 mr-1" />
          Tauri v2 Native Shell
        </span>
      </div>
    </footer>
  );
};
