import React, { useState, useEffect } from 'react';
import jsonata from 'jsonata';
import Editor from '@monaco-editor/react';
import { QueryTemplate, ThemeMode } from '../types/jsonspy';
import {
  Play,
  Copy,
  Check,
  Zap,
  Clock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface QueryWorkbenchProps {
  content: string;
  theme?: ThemeMode;
}

const DEFAULT_TEMPLATES: QueryTemplate[] = [
  {
    id: 'identity',
    label: 'Root Payload (Identity)',
    description: 'Returns the full un-transformed document',
    expression: '$',
  },
  {
    id: 'filter_items',
    label: 'Filter High-Value Items (Price > 100)',
    description: 'Filters array elements matching specified numeric criteria',
    expression: 'items[unitPrice > 100]',
  },
  {
    id: 'map_names',
    label: 'Map Descriptions & Prices',
    description: 'Extracts specific object properties into a clean list',
    expression: 'items.{\n  "name": description,\n  "price": unitPrice\n}',
  },
  {
    id: 'calculate_sum',
    label: 'Calculate Total Sum',
    description: 'Runs numeric aggregation function $sum over array fields',
    expression: '$sum(items.(quantity * unitPrice))',
  },
  {
    id: 'group_by',
    label: 'Group Items by Category',
    description: 'Groups array items into a hash map by category property',
    expression: 'items{category: description}',
  },
];

export const QueryWorkbench: React.FC<QueryWorkbenchProps> = ({ content, theme = 'dark' }) => {
  const [expression, setExpression] = useState('items[unitPrice > 100]');
  const [resultText, setResultText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const runQuery = async (exprToRun: string) => {
    if (!content.trim()) {
      setResultText('// Document is empty');
      setErrorMsg(null);
      return;
    }

    try {
      const parsedData = JSON.parse(content);
      const start = performance.now();

      const evaluator = jsonata(exprToRun);
      const evaluated = evaluator.evaluate(parsedData);
      const result = evaluated && typeof (evaluated as any).then === 'function' ? await evaluated : evaluated;
      const end = performance.now();

      setExecutionTimeMs(Number((end - start).toFixed(2)));
      setErrorMsg(null);

      if (result === undefined) {
        setResultText('undefined (no match found)');
      } else if (typeof result === 'object') {
        setResultText(JSON.stringify(result, null, 2));
      } else {
        setResultText(String(result));
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'JSONata evaluation error');
      setExecutionTimeMs(null);
    }
  };

  useEffect(() => {
    runQuery(expression);
  }, [expression, content]);

  const handleSelectTemplate = (tmpl: QueryTemplate) => {
    setExpression(tmpl.expression);
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const monacoTheme = theme === 'dark' ? 'jsonspy-dark' : 'vs';

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 text-xs">
      {/* Query Bar & Templates Header */}
      <div className="p-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <span className="flex items-center text-slate-800 dark:text-slate-200 font-mono font-semibold">
            <Zap className="w-4 h-4 mr-1.5 text-amber-500 dark:text-amber-400" />
            JSONata Transformation & Query Engine
          </span>

          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
            <select
              onChange={(e) => {
                const found = DEFAULT_TEMPLATES.find((t) => t.id === e.target.value);
                if (found) handleSelectTemplate(found);
              }}
              className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2.5 py-1 text-slate-700 dark:text-slate-300 font-sans focus:outline-none focus:border-brand-500"
            >
              <option value="">Select Query Template...</option>
              {DEFAULT_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => runQuery(expression)}
          className="flex items-center px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded shadow transition"
        >
          <Play className="w-3.5 h-3.5 mr-1 fill-current" />
          Run Query (Ctrl+Enter)
        </button>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden">
        {/* Left Pane: JSONata Expression Input */}
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
          <div className="px-4 py-2 bg-slate-200/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono text-[11px] text-slate-600 dark:text-slate-400">
            <span>JSONata Expression ($)</span>
            <span className="text-slate-400 dark:text-slate-500">Draft 2020-12 Compatible</span>
          </div>

          <div className="flex-1 w-full h-full relative">
            <Editor
              height="100%"
              defaultLanguage="json"
              theme={monacoTheme}
              value={expression}
              onChange={(val) => setExpression(val || '')}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Right Pane: Query Output Result */}
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
          <div className="px-4 py-2 bg-slate-200/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <span>Transformation Output</span>
              {executionTimeMs !== null && (
                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {executionTimeMs} ms
                </span>
              )}
            </div>

            <button
              onClick={handleCopyResult}
              className="flex items-center px-2 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1 text-emerald-500 dark:text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1 text-slate-400" />
                  Copy Result
                </>
              )}
            </button>
          </div>

          {errorMsg ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-mono text-xs flex flex-col space-y-2">
              <div className="flex items-center text-rose-600 dark:text-rose-400 font-semibold">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                Query Evaluation Exception
              </div>
              <pre className="p-3 bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-900/60 rounded text-rose-700 dark:text-rose-300 overflow-x-auto">
                {errorMsg}
              </pre>
            </div>
          ) : (
            <div className="flex-1 w-full h-full relative">
              <Editor
                height="100%"
                defaultLanguage="json"
                theme={monacoTheme}
                value={resultText}
                options={{
                  readOnly: true,
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
