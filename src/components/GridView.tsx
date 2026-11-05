import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Search,
  Maximize2,
  Minimize2,
  AlertCircle,
} from 'lucide-react';

interface GridViewProps {
  content: string;
  onChange: (newContent: string) => void;
}

type ValueType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';

export const GridView: React.FC<GridViewProps> = ({ content, onChange }) => {
  const [data, setData] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['$']));

  useEffect(() => {
    try {
      const parsed = JSON.parse(content);
      setData(parsed);
      setParseError(null);
    } catch (e: any) {
      setParseError(e.message || 'Invalid JSON syntax');
    }
  }, [content]);

  const updateParentJson = (newData: any) => {
    setData(newData);
    onChange(JSON.stringify(newData, null, 2));
  };

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const expandAll = () => {
    const paths = new Set<string>();
    const collectPaths = (val: any, currentPath: string) => {
      paths.add(currentPath);
      if (typeof val === 'object' && val !== null) {
        for (const [k, v] of Object.entries(val)) {
          collectPaths(v, `${currentPath}.${k}`);
        }
      }
    };
    if (data) collectPaths(data, '$');
    setExpandedPaths(paths);
  };

  const collapseAll = () => {
    setExpandedPaths(new Set(['$']));
  };

  const handleUpdateValue = (path: string[], newValue: any) => {
    if (!data) return;
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    const lastKey = path[path.length - 1];
    current[lastKey] = newValue;
    updateParentJson(newData);
  };

  const handleRenameKey = (path: string[], oldKey: string, newKey: string) => {
    if (!data || !newKey || oldKey === newKey) return;
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;

    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }

    if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
      const entries = Object.entries(current);
      const newObj: Record<string, any> = {};

      for (const [k, v] of entries) {
        if (k === oldKey) {
          newObj[newKey] = v;
        } else {
          newObj[k] = v;
        }
      }
      let parent = newData;
      for (let i = 0; i < path.length - 1; i++) {
        parent = parent[path[i]];
      }
      if (path.length > 0) {
        parent[path[path.length - 1]] = newObj;
      } else {
        updateParentJson(newObj);
        return;
      }
    }
    updateParentJson(newData);
  };

  const handleChangeType = (path: string[], targetType: ValueType) => {
    if (!data) return;
    let initialVal: any = '';
    switch (targetType) {
      case 'string':
        initialVal = '';
        break;
      case 'number':
        initialVal = 0;
        break;
      case 'boolean':
        initialVal = false;
        break;
      case 'object':
        initialVal = {};
        break;
      case 'array':
        initialVal = [];
        break;
      case 'null':
        initialVal = null;
        break;
    }
    handleUpdateValue(path, initialVal);
  };

  const handleAddChild = (path: string[], parentVal: any) => {
    if (!data) return;
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;

    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }

    if (Array.isArray(parentVal)) {
      current.push('new_item');
    } else if (typeof parentVal === 'object' && parentVal !== null) {
      let newPropName = 'newProperty';
      let counter = 1;
      while (newPropName in current) {
        newPropName = `newProperty_${counter++}`;
      }
      current[newPropName] = 'value';
    }

    updateParentJson(newData);
    setExpandedPaths((prev) => new Set(prev).add(path.length > 0 ? `$.${path.join('.')}` : '$'));
  };

  const handleDeleteNode = (path: string[]) => {
    if (!data || path.length === 0) return;
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    const lastKey = path[path.length - 1];
    if (Array.isArray(current)) {
      current.splice(Number(lastKey), 1);
    } else {
      delete current[lastKey];
    }

    updateParentJson(newData);
  };

  if (parseError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 p-8">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Grid View Unavailable</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md text-center">
          The document contains invalid JSON syntax. Switch to Text View and use SmartFix to repair syntax errors before viewing the grid tree.
        </p>
        <pre className="mt-4 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded text-rose-600 dark:text-rose-400 text-xs font-mono max-w-lg overflow-x-auto">
          {parseError}
        </pre>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 text-xs">
      {/* Grid Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search keys or values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 w-64 text-xs"
            />
          </div>
          <button
            onClick={expandAll}
            className="flex items-center px-2 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
          >
            <Maximize2 className="w-3 h-3 mr-1 text-slate-400" />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center px-2 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
          >
            <Minimize2 className="w-3 h-3 mr-1 text-slate-400" />
            Collapse All
          </button>
        </div>

        <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          Interactive Hierarchical Tree Grid
        </div>
      </div>

      {/* Grid Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-200/60 dark:bg-slate-900/60 border-b border-slate-300 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400 text-[11px] uppercase tracking-wider">
        <div className="col-span-5">Key / Property</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-4">Value</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {/* Grid Tree Nodes */}
      <div className="flex-1 overflow-y-auto p-2 font-mono">
        {data !== null && (
          <TreeNode
            keyName="root"
            val={data}
            path={[]}
            stringPath="$"
            expandedPaths={expandedPaths}
            onToggleExpand={toggleExpand}
            onUpdateValue={handleUpdateValue}
            onRenameKey={handleRenameKey}
            onChangeType={handleChangeType}
            onAddChild={handleAddChild}
            onDeleteNode={handleDeleteNode}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
};

interface TreeNodeProps {
  keyName: string;
  val: any;
  path: string[];
  stringPath: string;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  onUpdateValue: (path: string[], val: any) => void;
  onRenameKey: (path: string[], oldKey: string, newKey: string) => void;
  onChangeType: (path: string[], type: ValueType) => void;
  onAddChild: (path: string[], val: any) => void;
  onDeleteNode: (path: string[]) => void;
  searchQuery: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  keyName,
  val,
  path,
  stringPath,
  expandedPaths,
  onToggleExpand,
  onUpdateValue,
  onRenameKey,
  onChangeType,
  onAddChild,
  onDeleteNode,
  searchQuery,
}) => {
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [editingKeyVal, setEditingKeyVal] = useState(keyName);

  const isExpanded = expandedPaths.has(stringPath);
  const isObject = typeof val === 'object' && val !== null && !Array.isArray(val);
  const isArray = Array.isArray(val);
  const isContainer = isObject || isArray;

  const currentType: ValueType = val === null
    ? 'null'
    : Array.isArray(val)
    ? 'array'
    : typeof val as ValueType;

  const matchesSearch =
    !searchQuery ||
    keyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(val).toLowerCase().includes(searchQuery.toLowerCase());

  const handleKeyBlur = () => {
    setIsEditingKey(false);
    if (editingKeyVal !== keyName) {
      const parentPath = path.slice(0, -1);
      onRenameKey(parentPath, keyName, editingKeyVal);
    }
  };

  return (
    <div className={`my-0.5 ${!matchesSearch && !isContainer ? 'hidden' : ''}`}>
      <div className="grid grid-cols-12 gap-2 items-center px-2 py-1 hover:bg-slate-200/70 dark:hover:bg-slate-900/80 rounded group border border-transparent hover:border-slate-300 dark:hover:border-slate-800 transition">
        {/* Key Column */}
        <div className="col-span-5 flex items-center min-w-0" style={{ paddingLeft: `${path.length * 16}px` }}>
          {isContainer ? (
            <button
              onClick={() => onToggleExpand(stringPath)}
              className="mr-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 focus:outline-none shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-brand-500 dark:text-brand-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              )}
            </button>
          ) : (
            <span className="w-4 h-4 mr-1 shrink-0 inline-block" />
          )}

          {isEditingKey && path.length > 0 ? (
            <input
              type="text"
              value={editingKeyVal}
              onChange={(e) => setEditingKeyVal(e.target.value)}
              onBlur={handleKeyBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleKeyBlur()}
              autoFocus
              className="bg-white dark:bg-slate-950 border border-brand-500 rounded px-1 text-sky-600 dark:text-sky-400 focus:outline-none w-full text-xs font-mono"
            />
          ) : (
            <span
              onClick={() => path.length > 0 && setIsEditingKey(true)}
              className={`truncate font-semibold cursor-pointer ${
                path.length === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400 hover:underline'
              }`}
            >
              {keyName}
            </span>
          )}

          {isContainer && (
            <span className="ml-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              ({isArray ? `${val.length} items` : `${Object.keys(val).length} props`})
            </span>
          )}
        </div>

        {/* Type Badge Column */}
        <div className="col-span-2 flex items-center">
          <select
            value={currentType}
            onChange={(e) => onChangeType(path, e.target.value as ValueType)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-700 dark:text-slate-300 font-sans focus:outline-none focus:border-brand-500"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="object">Object</option>
            <option value="array">Array</option>
            <option value="null">Null</option>
          </select>
        </div>

        {/* Value Column */}
        <div className="col-span-4 min-w-0">
          {currentType === 'string' && (
            <input
              type="text"
              value={val}
              onChange={(e) => onUpdateValue(path, e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2 py-0.5 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
          )}

          {currentType === 'number' && (
            <input
              type="number"
              value={val}
              onChange={(e) => onUpdateValue(path, Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2 py-0.5 text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500 font-mono text-xs"
            />
          )}

          {currentType === 'boolean' && (
            <button
              onClick={() => onUpdateValue(path, !val)}
              className={`px-3 py-0.5 rounded text-xs font-semibold ${
                val
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-800'
              }`}
            >
              {val ? 'TRUE' : 'FALSE'}
            </button>
          )}

          {currentType === 'null' && (
            <span className="text-slate-400 dark:text-slate-600 italic">null</span>
          )}

          {isContainer && (
            <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
              {isArray ? '[ ... ]' : '{ ... }'}
            </span>
          )}
        </div>

        {/* Actions Column */}
        <div className="col-span-1 flex items-center justify-end space-x-1 opacity-80 group-hover:opacity-100">
          {isContainer && (
            <button
              onClick={() => onAddChild(path, val)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded transition"
              title={isArray ? 'Add array item' : 'Add property'}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          {path.length > 0 && (
            <button
              onClick={() => onDeleteNode(path)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400 rounded transition"
              title="Delete node"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isContainer && isExpanded && (
        <div className="pl-1">
          {isArray
            ? val.map((item: any, idx: number) => {
                const childPath = [...path, String(idx)];
                return (
                  <TreeNode
                    key={`${stringPath}[${idx}]`}
                    keyName={`[${idx}]`}
                    val={item}
                    path={childPath}
                    stringPath={`${stringPath}.${idx}`}
                    expandedPaths={expandedPaths}
                    onToggleExpand={onToggleExpand}
                    onUpdateValue={onUpdateValue}
                    onRenameKey={onRenameKey}
                    onChangeType={onChangeType}
                    onAddChild={onAddChild}
                    onDeleteNode={onDeleteNode}
                    searchQuery={searchQuery}
                  />
                );
              })
            : Object.entries(val).map(([k, v]) => {
                const childPath = [...path, k];
                return (
                  <TreeNode
                    key={`${stringPath}.${k}`}
                    keyName={k}
                    val={v}
                    path={childPath}
                    stringPath={`${stringPath}.${k}`}
                    expandedPaths={expandedPaths}
                    onToggleExpand={onToggleExpand}
                    onUpdateValue={onUpdateValue}
                    onRenameKey={onRenameKey}
                    onChangeType={onChangeType}
                    onAddChild={onAddChild}
                    onDeleteNode={onDeleteNode}
                    searchQuery={searchQuery}
                  />
                );
              })}
        </div>
      )}
    </div>
  );
};
