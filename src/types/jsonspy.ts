export type ViewMode = 'text' | 'grid' | 'schema' | 'query';

export interface AjvValidationError {
  line?: number;
  column?: number;
  path: string;
  message: string;
  keyword: string;
  schemaPath: string;
  params?: Record<string, any>;
}

export interface DocumentTab {
  id: string;
  title: string;
  content: string;
  filePath?: string;
  isDirty: boolean;
  selectedView: ViewMode;
  schemaContent?: string; // Attached Ajv validation schema (optional)
  validationDraft?: 'draft-07' | 'draft-2020-12';
}

export interface SmartFixReport {
  repairedText: string;
  fixesApplied: string[];
  fixedCount: number;
  isValidJson: boolean;
  errorDetail?: string;
}

export type GeneratorTarget = 'typescript' | 'java' | 'csharp' | 'go' | 'rust' | 'python' | 'json-schema';

export interface GeneratorOptions {
  rootTypeName: string;
  useJackson?: boolean; // For Java
  useSystemTextJson?: boolean; // For C#
  generateOptional?: boolean;
  includeComments?: boolean;
}

export interface QueryTemplate {
  id: string;
  label: string;
  description: string;
  expression: string;
}

export interface SchemaNodeProperty {
  key: string;
  type: string;
  required: boolean;
  description?: string;
  format?: string;
  enum?: any[];
  itemsType?: string;
}

export interface SchemaNodeData {
  title: string;
  type: string;
  requiredProps: string[];
  properties: SchemaNodeProperty[];
  description?: string;
  onToggleRequired?: (propKey: string) => void;
  onAddProperty?: () => void;
  onSelectProperty?: (propKey: string) => void;
}
