import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Handle,
  Position,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { inferJsonSchema } from '../utils/schemaInference';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Settings,
  Layers,
  Copy,
  Check,
  Code,
} from 'lucide-react';

interface SchemaViewProps {
  content: string;
  onChange: (newContent: string) => void;
}

interface CustomSchemaNodeData extends Record<string, unknown> {
  keyName: string;
  type: string;
  required: boolean;
  description?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  enum?: any[];
  onToggleRequired?: (key: string) => void;
  onSelectProperty?: (key: string) => void;
}

// Custom Node Renderer for React Flow
const SchemaNodeComponent: React.FC<{ data: CustomSchemaNodeData }> = ({ data }) => {
  const getTypeColor = (typeStr: string) => {
    switch (typeStr) {
      case 'object':
        return 'bg-purple-950 text-purple-300 border-purple-700';
      case 'array':
        return 'bg-sky-950 text-sky-300 border-sky-700';
      case 'string':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700';
      case 'number':
      case 'integer':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      case 'boolean':
        return 'bg-pink-950 text-pink-300 border-pink-700';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <div
      onClick={() => data.onSelectProperty && data.onSelectProperty(data.keyName)}
      className="bg-slate-900 border-2 border-slate-700 rounded-lg p-3 min-w-[220px] shadow-xl hover:border-brand-500 transition cursor-pointer"
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-brand-400" />

      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="font-bold font-mono text-sm text-sky-400">{data.keyName}</span>

        {/* Required Badge Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (data.onToggleRequired) data.onToggleRequired(data.keyName);
          }}
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase transition ${
            data.required
              ? 'bg-rose-950 text-rose-400 border border-rose-800'
              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Required Property"
        >
          {data.required ? 'Required' : 'Optional'}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold font-mono border ${getTypeColor(
            data.type
          )}`}
        >
          {data.type}
        </span>

        {data.format && (
          <span className="text-[10px] font-mono text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
            fmt: {data.format}
          </span>
        )}
      </div>

      {data.description && (
        <p className="mt-2 text-[11px] text-slate-400 line-clamp-2 italic font-sans">
          {data.description}
        </p>
      )}

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-brand-400" />
    </div>
  );
};

export const SchemaView: React.FC<SchemaViewProps> = ({ content, onChange }) => {
  const [schemaObj, setSchemaObj] = useState<any>(null);
  const [selectedPropKey, setSelectedPropKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const nodeTypes = useMemo(() => ({ schemaNode: SchemaNodeComponent }), []);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Parse or infer schema on content change
  useEffect(() => {
    try {
      const parsed = JSON.parse(content);
      let schema: any;
      if (parsed.$schema || parsed.properties || parsed.type === 'object') {
        schema = parsed;
      } else {
        schema = inferJsonSchema(parsed, 'RootSchema');
      }
      setSchemaObj(schema);
      generateFlowGraph(schema);
    } catch (e) {
      setSchemaObj(null);
    }
  }, [content]);

  // Generate React Flow nodes and edges from schema object
  const generateFlowGraph = (schema: any) => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    let nodeIdSeq = 1;

    const requiredSet = new Set<string>(schema.required || []);
    const props = schema.properties || {};

    // Root Node
    const rootId = 'root';
    flowNodes.push({
      id: rootId,
      type: 'schemaNode',
      position: { x: 50, y: 150 },
      data: {
        keyName: schema.title || 'RootSchema',
        type: schema.type || 'object',
        required: true,
        description: schema.description || 'Root JSON Schema Definition',
      } as CustomSchemaNodeData,
    });

    let yOffset = 50;
    for (const [propKey, propVal] of Object.entries<any>(props)) {
      const nodeId = `node_${nodeIdSeq++}`;
      const isReq = requiredSet.has(propKey);

      flowNodes.push({
        id: nodeId,
        type: 'schemaNode',
        position: { x: 340, y: yOffset },
        data: {
          keyName: propKey,
          type: propVal.type || 'string',
          required: isReq,
          description: propVal.description,
          format: propVal.format,
          minimum: propVal.minimum,
          maximum: propVal.maximum,
          pattern: propVal.pattern,
          onToggleRequired: (keyToToggle: string) => handleToggleRequired(keyToToggle),
          onSelectProperty: (keyToSelect: string) => setSelectedPropKey(keyToSelect),
        } as CustomSchemaNodeData,
      });

      flowEdges.push({
        id: `edge_${rootId}_${nodeId}`,
        source: rootId,
        target: nodeId,
        animated: true,
        style: { stroke: '#0c8de9', strokeWidth: 2 },
      });

      yOffset += 110;
    }

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  const handleToggleRequired = (propKey: string) => {
    if (!schemaObj) return;
    const newSchema = JSON.parse(JSON.stringify(schemaObj));
    let requiredList: string[] = newSchema.required || [];

    if (requiredList.includes(propKey)) {
      requiredList = requiredList.filter((k) => k !== propKey);
    } else {
      requiredList.push(propKey);
    }

    newSchema.required = requiredList;
    setSchemaObj(newSchema);
    onChange(JSON.stringify(newSchema, null, 2));
  };

  const handleAddProperty = () => {
    if (!schemaObj) return;
    const newSchema = JSON.parse(JSON.stringify(schemaObj));
    const props = newSchema.properties || {};

    let newPropName = 'newField';
    let counter = 1;
    while (newPropName in props) {
      newPropName = `newField_${counter++}`;
    }

    props[newPropName] = {
      type: 'string',
      description: 'Newly added JSON Schema property',
    };

    newSchema.properties = props;
    setSchemaObj(newSchema);
    onChange(JSON.stringify(newSchema, null, 2));
  };

  const handleDeleteProperty = (propKey: string) => {
    if (!schemaObj) return;
    const newSchema = JSON.parse(JSON.stringify(schemaObj));
    if (newSchema.properties && newSchema.properties[propKey]) {
      delete newSchema.properties[propKey];
    }
    if (newSchema.required) {
      newSchema.required = newSchema.required.filter((k: string) => k !== propKey);
    }
    setSchemaObj(newSchema);
    setSelectedPropKey(null);
    onChange(JSON.stringify(newSchema, null, 2));
  };

  const handleUpdatePropDetail = (propKey: string, field: string, value: any) => {
    if (!schemaObj || !schemaObj.properties || !schemaObj.properties[propKey]) return;
    const newSchema = JSON.parse(JSON.stringify(schemaObj));
    newSchema.properties[propKey][field] = value;
    setSchemaObj(newSchema);
    onChange(JSON.stringify(newSchema, null, 2));
  };

  const handleInferFreshSchema = () => {
    try {
      const parsed = JSON.parse(content);
      const inferred = inferJsonSchema(parsed, 'InferredSchema');
      setSchemaObj(inferred);
      onChange(JSON.stringify(inferred, null, 2));
    } catch (e) {
      // ignore
    }
  };

  const handleCopySchema = () => {
    if (schemaObj) {
      navigator.clipboard.writeText(JSON.stringify(schemaObj, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeProp = selectedPropKey && schemaObj?.properties?.[selectedPropKey];

  return (
    <div className="flex h-full w-full bg-slate-950 text-xs">
      {/* Left Canvas Panel */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Schema Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 z-10">
          <div className="flex items-center space-x-3">
            <span className="flex items-center text-slate-300 font-mono font-semibold">
              <Layers className="w-4 h-4 mr-1.5 text-purple-400" />
              Visual JSON Schema Designer
            </span>

            <button
              onClick={handleInferFreshSchema}
              className="flex items-center px-2.5 py-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 transition shadow-sm"
              title="Infer clean JSON Schema from active payload"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" />
              Infer Schema
            </button>

            <button
              onClick={handleAddProperty}
              className="flex items-center px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition shadow-sm"
              title="Add property to root schema"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Property
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySchema}
              className="flex items-center px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Copied Schema
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Copy Schema JSON
                </>
              )}
            </button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 w-full h-full bg-slate-950">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      {/* Right Inspector Drawer */}
      <div className="w-80 border-l border-slate-800 bg-slate-900 p-4 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <span className="font-semibold text-slate-200 flex items-center">
            <Settings className="w-4 h-4 mr-1.5 text-brand-400" />
            Property Inspector
          </span>
          {selectedPropKey && (
            <button
              onClick={() => handleDeleteProperty(selectedPropKey)}
              className="p-1 text-rose-400 hover:bg-rose-950 rounded transition"
              title="Delete Property from Schema"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {selectedPropKey && activeProp ? (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Property Name</label>
              <input
                type="text"
                value={selectedPropKey}
                disabled
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-sky-400 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">Data Type</label>
              <select
                value={activeProp.type || 'string'}
                onChange={(e) => handleUpdatePropDetail(selectedPropKey, 'type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="integer">Integer</option>
                <option value="boolean">Boolean</option>
                <option value="object">Object</option>
                <option value="array">Array</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">Description</label>
              <textarea
                rows={3}
                value={activeProp.description || ''}
                onChange={(e) =>
                  handleUpdatePropDetail(selectedPropKey, 'description', e.target.value)
                }
                placeholder="Enter documentation or property purpose..."
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">Format (String)</label>
              <select
                value={activeProp.format || ''}
                onChange={(e) =>
                  handleUpdatePropDetail(selectedPropKey, 'format', e.target.value || undefined)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value="">None</option>
                <option value="email">Email</option>
                <option value="date-time">Date Time (ISO-8601)</option>
                <option value="date">Date</option>
                <option value="uri">URI / URL</option>
                <option value="uuid">UUID</option>
              </select>
            </div>

            {activeProp.type === 'number' || activeProp.type === 'integer' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Minimum</label>
                  <input
                    type="number"
                    value={activeProp.minimum ?? ''}
                    onChange={(e) =>
                      handleUpdatePropDetail(
                        selectedPropKey,
                        'minimum',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Maximum</label>
                  <input
                    type="number"
                    value={activeProp.maximum ?? ''}
                    onChange={(e) =>
                      handleUpdatePropDetail(
                        selectedPropKey,
                        'maximum',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-amber-400 font-mono"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-64 text-slate-500">
            <Layers className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">Select a property node on the graph canvas to inspect & configure constraints.</p>
          </div>
        )}
      </div>
    </div>
  );
};
