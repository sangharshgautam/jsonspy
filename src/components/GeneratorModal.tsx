import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { GeneratorOptions, GeneratorTarget, ThemeMode } from '../types/jsonspy';
import { generateCode } from '../utils/typeGenerators';
import { saveJsonFile } from '../utils/fileSystem';
import {
  X,
  Code2,
  Copy,
  Check,
  Download,
  FileCode2,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawJson: string;
  theme?: ThemeMode;
}

const TARGETS: { id: GeneratorTarget; label: string; language: string }[] = [
  { id: 'typescript', label: 'TypeScript', language: 'typescript' },
  { id: 'java', label: 'Java POJO', language: 'java' },
  { id: 'csharp', label: 'C# DTO', language: 'csharp' },
  { id: 'go', label: 'Go Struct', language: 'go' },
  { id: 'rust', label: 'Rust Struct', language: 'rust' },
  { id: 'python', label: 'Python Pydantic', language: 'python' },
  { id: 'json-schema', label: 'JSON Schema (Draft 2020-12)', language: 'json' },
];

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
  isOpen,
  onClose,
  rawJson,
  theme = 'dark',
}) => {
  const [selectedTarget, setSelectedTarget] = useState<GeneratorTarget>('typescript');
  const [options, setOptions] = useState<GeneratorOptions>({
    rootTypeName: 'RootObject',
    useJackson: true,
    useSystemTextJson: true,
    generateOptional: false,
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const code = generateCode(rawJson, selectedTarget, options);
      setGeneratedCode(code);
    }
  }, [isOpen, selectedTarget, options, rawJson]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    const activeObj = TARGETS.find((t) => t.id === selectedTarget);
    const ext = activeObj?.language === 'typescript' ? 'ts' : activeObj?.language || 'txt';
    const defaultName = `${options.rootTypeName || 'Model'}.${ext}`;
    await saveJsonFile(generatedCode, undefined, defaultName);
  };

  const activeTargetObj = TARGETS.find((t) => t.id === selectedTarget);
  const monacoTheme = theme === 'dark' ? 'jsonspy-dark' : 'vs';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-brand-500 dark:text-brand-400" />
            <h2 className="text-base font-bold">Enterprise Code & Schema Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden text-xs">
          {/* Target Tabs & Options Sidebar */}
          <div className="w-72 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Target Language / Format
                </label>
                <div className="space-y-1">
                  {TARGETS.map((target) => (
                    <button
                      key={target.id}
                      onClick={() => setSelectedTarget(target.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium transition flex items-center justify-between ${
                        selectedTarget === target.id
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900'
                      }`}
                    >
                      <span>{target.label}</span>
                      {selectedTarget === target.id && <Sparkles className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generator Configuration Options */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Generator Configuration
                </label>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono">Root Type / Class Name</label>
                  <input
                    type="text"
                    value={options.rootTypeName}
                    onChange={(e) => setOptions({ ...options, rootTypeName: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded px-2.5 py-1.5 text-sky-600 dark:text-sky-400 font-mono font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>

                {selectedTarget === 'java' && (
                  <button
                    onClick={() => setOptions({ ...options, useJackson: !options.useJackson })}
                    className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 py-1"
                  >
                    {options.useJackson ? (
                      <CheckSquare className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                    )}
                    <span>Add Jackson @JsonProperty Annotations</span>
                  </button>
                )}

                {selectedTarget === 'csharp' && (
                  <button
                    onClick={() =>
                      setOptions({ ...options, useSystemTextJson: !options.useSystemTextJson })
                    }
                    className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 py-1"
                  >
                    {options.useSystemTextJson ? (
                      <CheckSquare className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                    )}
                    <span>Add [JsonPropertyName] Annotations</span>
                  </button>
                )}

                {selectedTarget === 'typescript' && (
                  <button
                    onClick={() =>
                      setOptions({ ...options, generateOptional: !options.generateOptional })
                    }
                    className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 py-1"
                  >
                    {options.generateOptional ? (
                      <CheckSquare className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                    )}
                    <span>Mark all properties optional (?)</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              JSONSpy AST Model Synthesis v1.0
            </div>
          </div>

          {/* Generated Code Output Preview */}
          <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold flex items-center">
                <FileCode2 className="w-4 h-4 mr-1.5 text-brand-500 dark:text-brand-400" />
                {activeTargetObj?.label} Output Preview
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center px-3 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-500 dark:text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Copy Code
                    </>
                  )}
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center px-3 py-1 rounded bg-brand-600 hover:bg-brand-500 text-white font-medium shadow transition"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Save Code File
                </button>
              </div>
            </div>

            <div className="flex-1 w-full h-full relative">
              <Editor
                height="100%"
                language={activeTargetObj?.language || 'text'}
                theme={monacoTheme}
                value={generatedCode}
                options={{
                  readOnly: true,
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
