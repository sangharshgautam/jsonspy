import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { AjvValidationError, SmartFixReport, ThemeMode } from '../types/jsonspy';
import { smartFixJSON } from '../utils/smartFix';
import {
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  AlignLeft,
  Minimize2,
  ShieldCheck,
  FileCode,
} from 'lucide-react';

interface TextViewProps {
  content: string;
  onChange: (newContent: string) => void;
  schemaContent?: string;
  onApplySmartFix?: (repairedText: string) => void;
  theme?: ThemeMode;
}

export const TextView: React.FC<TextViewProps> = ({
  content,
  onChange,
  schemaContent,
  onApplySmartFix,
  theme = 'dark',
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [schemaErrors, setSchemaErrors] = useState<AjvValidationError[]>([]);
  const [smartFixResult, setSmartFixResult] = useState<SmartFixReport | null>(null);
  const [isValidJson, setIsValidJson] = useState(true);

  // Validate JSON syntax and Ajv Schema
  useEffect(() => {
    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
      setSyntaxError(null);
      setIsValidJson(true);
      setSmartFixResult(null);
    } catch (e: any) {
      setSyntaxError(e.message || 'Invalid JSON syntax');
      setIsValidJson(false);
      const report = smartFixJSON(content);
      setSmartFixResult(report);
    }

    if (parsed && schemaContent && schemaContent.trim().length > 0) {
      try {
        const ajv = new Ajv({ allErrors: true, strict: false });
        addFormats(ajv);
        const schemaObj = JSON.parse(schemaContent);
        const validate = ajv.compile(schemaObj);
        const valid = validate(parsed);

        if (!valid && validate.errors) {
          const errors: AjvValidationError[] = validate.errors.map((err) => ({
            path: err.instancePath || '/',
            message: err.message || 'Schema validation error',
            keyword: err.keyword,
            schemaPath: err.schemaPath,
            params: err.params,
          }));
          setSchemaErrors(errors);
        } else {
          setSchemaErrors([]);
        }
      } catch (e: any) {
        setSchemaErrors([
          {
            path: '/schema',
            message: `Invalid Schema: ${e.message}`,
            keyword: 'schema_parse_error',
            schemaPath: '',
          },
        ]);
      }
    } else {
      setSchemaErrors([]);
    }
  }, [content, schemaContent]);

  // Update Monaco theme when theme prop changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'jsonspy-dark' : 'jsonspy-light');
    }
  }, [theme]);

  // Handle Monaco Editor Mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [],
    });

    // Custom dark theme
    monaco.editor.defineTheme('jsonspy-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'string.key.json', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'string.value.json', foreground: '4ade80' },
        { token: 'number', foreground: 'facc15' },
        { token: 'keyword.json', foreground: 'f472b6' },
      ],
      colors: {
        'editor.background': '#090d16',
        'editor.lineHighlightBackground': '#152033',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#38bdf8',
      },
    });

    // Custom light theme
    monaco.editor.defineTheme('jsonspy-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'string.key.json', foreground: '0284c7', fontStyle: 'bold' },
        { token: 'string.value.json', foreground: '16a34a' },
        { token: 'number', foreground: 'd97706' },
        { token: 'keyword.json', foreground: 'db2777' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#0284c7',
      },
    });

    monaco.editor.setTheme(theme === 'dark' ? 'jsonspy-dark' : 'jsonspy-light');
  };

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
    } catch (e) {
      const report = smartFixJSON(content);
      if (report.isValidJson) {
        onChange(report.repairedText);
      }
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(content);
      const minified = JSON.stringify(parsed);
      onChange(minified);
    } catch (e) {
      // ignore
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerSmartFix = () => {
    const report = smartFixJSON(content);
    if (report.isValidJson) {
      if (onApplySmartFix) {
        onApplySmartFix(report.repairedText);
      } else {
        onChange(report.repairedText);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-slate-600 dark:text-slate-400 font-mono">
            <FileCode className="w-3.5 h-3.5 mr-1.5 text-brand-500 dark:text-brand-400" />
            JSON Text Editor
          </span>

          {isValidJson && schemaErrors.length === 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Valid JSON
            </span>
          )}

          {isValidJson && schemaErrors.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {schemaErrors.length} Schema Violation(s)
            </span>
          )}

          {!isValidJson && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Syntax Error
            </span>
          )}
        </div>

        {/* Editor Quick Actions */}
        <div className="flex items-center space-x-2">
          {smartFixResult && smartFixResult.fixedCount > 0 && (
            <button
              onClick={handleTriggerSmartFix}
              className="flex items-center px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-sm transition"
              title="One-click automatic repair for JSON syntax errors"
            >
              <Wand2 className="w-3.5 h-3.5 mr-1 animate-pulse" />
              SmartFix ({smartFixResult.fixedCount} repairs ready)
            </button>
          )}

          <button
            onClick={handlePrettify}
            className="flex items-center px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
            title="Prettify / Format JSON (Ctrl+Shift+F)"
          >
            <AlignLeft className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Prettify
          </button>

          <button
            onClick={handleMinify}
            className="flex items-center px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
            title="Minify JSON string"
          >
            <Minimize2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Minify
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
            title="Copy document to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-500 dark:text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* SmartFix Banner Alert */}
      {!isValidJson && smartFixResult && (
        <div className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-800/80 px-4 py-2.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center space-x-2">
            <Wand2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold text-amber-900 dark:text-amber-300">Syntax Error Detected: </span>
              <span>{syntaxError}</span>
              {smartFixResult.fixesApplied.length > 0 && (
                <div className="text-amber-700 dark:text-amber-400/90 text-[11px] mt-0.5">
                  Suggested repairs: {smartFixResult.fixesApplied.join(' • ')}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleTriggerSmartFix}
            className="shrink-0 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded shadow transition flex items-center"
          >
            <Wand2 className="w-3.5 h-3.5 mr-1" />
            Apply SmartFix Now
          </button>
        </div>
      )}

      {/* Ajv Schema Validation Violations Panel */}
      {schemaErrors.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900/80 px-4 py-2 max-h-28 overflow-y-auto text-xs text-rose-800 dark:text-rose-200 font-mono">
          <div className="font-sans font-semibold text-rose-700 dark:text-rose-400 mb-1 flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600 dark:text-rose-400" />
            Ajv Schema Validation Violations ({schemaErrors.length}):
          </div>
          <ul className="space-y-1">
            {schemaErrors.map((err, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-rose-600 dark:text-rose-400 font-bold mr-2">{err.path}:</span>
                <span>{err.message}</span>
                <span className="text-rose-500 text-[10px] ml-2">[{err.keyword}]</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={content}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontLigatures: true,
            tabSize: 2,
            minimap: { enabled: true, renderCharacters: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            folding: true,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
};
