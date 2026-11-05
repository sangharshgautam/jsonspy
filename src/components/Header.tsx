import React from 'react';
import { DocumentTab, ViewMode } from '../types/jsonspy';
import {
  FileCode,
  Grid,
  Layers,
  Zap,
  FolderOpen,
  Save,
  Plus,
  X,
  Wand2,
  Code2,
  Sparkles,
  AlignLeft,
  FileText,
} from 'lucide-react';

interface HeaderProps {
  tabs: DocumentTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onCloseTab: (id: string) => void;
  onSelectView: (view: ViewMode) => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onPrettify: () => void;
  onSmartFix: () => void;
  onOpenGenerator: () => void;
  onSelectSamplePreset: (presetKey: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
  onSelectView,
  onOpenFile,
  onSaveFile,
  onPrettify,
  onSmartFix,
  onOpenGenerator,
  onSelectSamplePreset,
}) => {
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <header className="bg-slate-900 border-b border-slate-800 flex flex-col select-none z-30">
      {/* Top Application Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-sky-500 px-2.5 py-1 rounded-lg text-white shadow-md">
            <Sparkles className="w-4 h-4" />
            <span className="font-extrabold tracking-tight text-sm font-sans">JSONSpy</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 border-l border-slate-700 pl-3 hidden sm:inline-block">
            Enterprise Workbench
          </span>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center space-x-2 text-xs">
          {/* File Operations */}
          <button
            onClick={onOpenFile}
            className="flex items-center px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Open JSON File from Disk (Ctrl+O)"
          >
            <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
            Open
          </button>

          <button
            onClick={onSaveFile}
            className="flex items-center px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Save File (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Save
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Quick Engine Actions */}
          <button
            onClick={onPrettify}
            className="flex items-center px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Prettify / Format JSON (Ctrl+Shift+F)"
          >
            <AlignLeft className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Prettify
          </button>

          <button
            onClick={onSmartFix}
            className="flex items-center px-2.5 py-1.5 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 transition"
            title="SmartFix: Automatically repair syntax errors"
          >
            <Wand2 className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            SmartFix
          </button>

          <button
            onClick={onOpenGenerator}
            className="flex items-center px-2.5 py-1.5 rounded bg-brand-950 hover:bg-brand-900 text-brand-300 border border-brand-800 transition shadow-sm"
            title="Generate TypeScript, Java, C#, Go, Rust, Python code models"
          >
            <Code2 className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
            Code Generator
          </button>

          {/* Sample Presets Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value) onSelectSamplePreset(e.target.value);
            }}
            value=""
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="" disabled>
              Load Sample Preset...
            </option>
            <option value="order">E-Commerce Order</option>
            <option value="profile">User Profile</option>
            <option value="geojson">GeoJSON FeatureCollection</option>
            <option value="openapi">OpenAPI 3.0 Specification</option>
            <option value="schema">JSON Schema (Draft 2020-12)</option>
            <option value="broken">Broken JSON (SmartFix Test)</option>
          </select>
        </div>
      </div>

      {/* Tabs & View Switcher Bar */}
      <div className="flex items-center justify-between px-2 bg-slate-950 border-b border-slate-800">
        {/* Workspace Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto py-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center px-3 py-1.5 rounded-t-lg border-t border-x text-xs font-medium cursor-pointer transition max-w-[200px] ${
                tab.id === activeTabId
                  ? 'bg-slate-900 border-slate-800 text-sky-400 shadow-sm'
                  : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-500 shrink-0" />
              <span className="truncate font-mono">
                {tab.title}
                {tab.isDirty && <span className="text-amber-400 font-bold ml-1">*</span>}
              </span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="ml-2 p-0.5 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={onAddTab}
            className="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-900 rounded transition"
            title="New Workspace Tab"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Switcher */}
        {activeTab && (
          <div className="flex items-center space-x-1 p-1 bg-slate-900 rounded-lg border border-slate-800 my-1">
            <button
              onClick={() => onSelectView('text')}
              className={`flex items-center px-2.5 py-1 rounded text-xs font-medium transition ${
                activeTab.selectedView === 'text'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 mr-1.5" />
              Text View
            </button>

            <button
              onClick={() => onSelectView('grid')}
              className={`flex items-center px-2.5 py-1 rounded text-xs font-medium transition ${
                activeTab.selectedView === 'grid'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5 mr-1.5" />
              Grid View
            </button>

            <button
              onClick={() => onSelectView('schema')}
              className={`flex items-center px-2.5 py-1 rounded text-xs font-medium transition ${
                activeTab.selectedView === 'schema'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              Schema Designer
            </button>

            <button
              onClick={() => onSelectView('query')}
              className={`flex items-center px-2.5 py-1 rounded text-xs font-medium transition ${
                activeTab.selectedView === 'query'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Query Workbench
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
