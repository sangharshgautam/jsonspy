import React from 'react';
import { ViewMode } from '../types/jsonspy';
import { CheckCircle2, ShieldCheck, FileCode, Monitor } from 'lucide-react';

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
    <footer className="bg-slate-900 border-t border-slate-800 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-20">
      <div className="flex items-center space-x-4">
        <span className="flex items-center text-sky-400">
          <FileCode className="w-3.5 h-3.5 mr-1" />
          {filePath || 'Untitled Workspace Document'}
        </span>

        <span className="text-slate-600">|</span>

        <span>
          {lineCount} lines, {charCount} characters
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <span className="flex items-center text-purple-400">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          Ajv Engine Ready
        </span>

        <span className="text-slate-600">|</span>

        <span className="uppercase text-brand-400 font-semibold">{viewMode} Mode</span>

        <span className="text-slate-600">|</span>

        <span className="flex items-center text-emerald-400">
          <Monitor className="w-3.5 h-3.5 mr-1" />
          Tauri v2 Native Shell
        </span>
      </div>
    </footer>
  );
};
