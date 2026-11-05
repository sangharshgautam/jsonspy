import { GeneratorOptions, GeneratorTarget } from '../types/jsonspy';
import { inferJsonSchema } from './schemaInference';

/**
 * Enterprise Code & Schema Generator Engine
 * Transforms raw JSON or parsed objects into target language models.
 */

export function generateCode(
  rawJson: string,
  target: GeneratorTarget,
  options: GeneratorOptions
): string {
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    return `// Error: Input is not valid JSON\n// Please fix JSON syntax before generating code.`;
  }

  const rootName = sanitizeIdentifier(options.rootTypeName || 'RootObject');

  switch (target) {
    case 'typescript':
      return generateTypeScript(parsed, rootName, options);
    case 'java':
      return generateJava(parsed, rootName, options);
    case 'csharp':
      return generateCSharp(parsed, rootName, options);
    case 'go':
      return generateGo(parsed, rootName, options);
    case 'rust':
      return generateRust(parsed, rootName, options);
    case 'python':
      return generatePython(parsed, rootName, options);
    case 'json-schema':
      return JSON.stringify(inferJsonSchema(parsed, rootName), null, 2);
    default:
      return '// Unsupported target language';
  }
}

function sanitizeIdentifier(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9_$]/g, '_');
  if (!clean) return 'RootObject';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/* ==================== TYPESCRIPT ==================== */
function generateTypeScript(val: any, rootName: string, options: GeneratorOptions): string {
  const interfaces = new Map<string, string>();

  function walk(node: any, name: string): string {
    if (node === null) return 'any';
    if (Array.isArray(node)) {
      if (node.length === 0) return 'any[]';
      const itemType = walk(node[0], name + 'Item');
      return `${itemType}[]`;
    }
    if (typeof node === 'object') {
      const typeName = sanitizeIdentifier(name);
      if (interfaces.has(typeName)) return typeName;

      const lines: string[] = [];
      lines.push(`export interface ${typeName} {`);

      for (const [key, propVal] of Object.entries(node)) {
        const propType = walk(propVal, key);
        const optional = options.generateOptional ? '?' : '';
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
        lines.push(`  ${safeKey}${optional}: ${propType};`);
      }

      lines.push(`}`);
      interfaces.set(typeName, lines.join('\n'));
      return typeName;
    }

    if (typeof node === 'number') return Number.isInteger(node) ? 'number' : 'number';
    return typeof node;
  }

  walk(val, rootName);
  return Array.from(interfaces.values()).reverse().join('\n\n');
}

/* ==================== JAVA POJO ==================== */
function generateJava(val: any, rootName: string, options: GeneratorOptions): string {
  const classes = new Map<string, string>();
  const useJackson = options.useJackson !== false;

  function walk(node: any, name: string): string {
    if (node === null) return 'Object';
    if (Array.isArray(node)) {
      if (node.length === 0) return 'List<Object>';
      const itemType = walk(node[0], name + 'Item');
      return `List<${itemType}>`;
    }
    if (typeof node === 'object') {
      const className = sanitizeIdentifier(name);
      if (classes.has(className)) return className;

      const imports = new Set<string>();
      if (useJackson) {
        imports.add('import com.fasterxml.jackson.annotation.JsonProperty;');
      }
      imports.add('import java.util.List;');

      const fields: string[] = [];
      const methods: string[] = [];

      for (const [key, propVal] of Object.entries(node)) {
        const fieldType = walk(propVal, key);
        const fieldName = toCamelCase(key);

        if (useJackson) {
          fields.push(`    @JsonProperty("${key}")`);
        }
        fields.push(`    private ${fieldType} ${fieldName};`);

        // Getters and Setters
        const getterName = 'get' + toPascalCase(fieldName);
        const setterName = 'set' + toPascalCase(fieldName);
        methods.push(`    public ${fieldType} ${getterName}() {\n        return ${fieldName};\n    }`);
        methods.push(`    public void ${setterName}(${fieldType} ${fieldName}) {\n        this.${fieldName} = ${fieldName};\n    }`);
      }

      const code: string[] = [];
      if (classes.size === 0) {
        // Only print imports for the main class file
        code.push(...Array.from(imports));
        code.push('');
      }
      code.push(`public class ${className} {`);
      code.push(fields.join('\n'));
      code.push('');
      code.push(methods.join('\n\n'));
      code.push(`}`);

      classes.set(className, code.join('\n'));
      return className;
    }

    if (typeof node === 'number') return Number.isInteger(node) ? 'Integer' : 'Double';
    if (typeof node === 'boolean') return 'Boolean';
    return 'String';
  }

  walk(val, rootName);
  return Array.from(classes.values()).reverse().join('\n\n');
}

/* ==================== C# DTO ==================== */
function generateCSharp(val: any, rootName: string, options: GeneratorOptions): string {
  const classes = new Map<string, string>();
  const useSystemTextJson = options.useSystemTextJson !== false;

  function walk(node: any, name: string): string {
    if (node === null) return 'object';
    if (Array.isArray(node)) {
      if (node.length === 0) return 'List<object>';
      const itemType = walk(node[0], name + 'Item');
      return `List<${itemType}>`;
    }
    if (typeof node === 'object') {
      const className = sanitizeIdentifier(name);
      if (classes.has(className)) return className;

      const props: string[] = [];

      for (const [key, propVal] of Object.entries(node)) {
        const propType = walk(propVal, key);
        const propName = toPascalCase(key);

        if (useSystemTextJson) {
          props.push(`        [JsonPropertyName("${key}")]`);
        }
        props.push(`        public ${propType} ${propName} { get; set; }`);
      }

      const code: string[] = [];
      code.push(`    public class ${className}`);
      code.push(`    {`);
      code.push(props.join('\n\n'));
      code.push(`    }`);

      classes.set(className, code.join('\n'));
      return className;
    }

    if (typeof node === 'number') return Number.isInteger(node) ? 'int' : 'double';
    if (typeof node === 'boolean') return 'bool';
    return 'string';
  }

  walk(val, rootName);
  const header = useSystemTextJson
    ? 'using System.Text.Json.Serialization;\nusing System.Collections.Generic;\n\nnamespace JsonSpy.Models\n{\n'
    : 'using System.Collections.Generic;\n\nnamespace JsonSpy.Models\n{\n';
  return header + Array.from(classes.values()).reverse().join('\n\n') + '\n}';
}

/* ==================== GO STRUCT ==================== */
function generateGo(val: any, rootName: string, _options: GeneratorOptions): string {
  const structs = new Map<string, string>();

  function walk(node: any, name: string): string {
    if (node === null) return 'interface{}';
    if (Array.isArray(node)) {
      if (node.length === 0) return '[]interface{}';
      const itemType = walk(node[0], name + 'Item');
      return `[]${itemType}`;
    }
    if (typeof node === 'object') {
      const structName = sanitizeIdentifier(name);
      if (structs.has(structName)) return structName;

      const fields: string[] = [];

      for (const [key, propVal] of Object.entries(node)) {
        const fieldType = walk(propVal, key);
        const fieldName = toPascalCase(key);
        fields.push(`\t${fieldName} ${fieldType} \`json:"${key}"\``);
      }

      const code = `type ${structName} struct {\n${fields.join('\n')}\n}`;
      structs.set(structName, code);
      return structName;
    }

    if (typeof node === 'number') return Number.isInteger(node) ? 'int' : 'float64';
    if (typeof node === 'boolean') return 'bool';
    return 'string';
  }

  walk(val, rootName);
  return 'package main\n\n' + Array.from(structs.values()).reverse().join('\n\n');
}

/* ==================== RUST STRUCT ==================== */
function generateRust(val: any, rootName: string, _options: GeneratorOptions): string {
  const structs = new Map<string, string>();

  function walk(node: any, name: string): string {
    if (node === null) return 'Option<serde_json::Value>';
    if (Array.isArray(node)) {
      if (node.length === 0) return 'Vec<serde_json::Value>';
      const itemType = walk(node[0], name + 'Item');
      return `Vec<${itemType}>`;
    }
    if (typeof node === 'object') {
      const structName = sanitizeIdentifier(name);
      if (structs.has(structName)) return structName;

      const fields: string[] = [];

      for (const [key, propVal] of Object.entries(node)) {
        const fieldType = walk(propVal, key);
        const fieldName = key.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
        fields.push(`    #[serde(rename = "${key}")]`);
        fields.push(`    pub ${fieldName}: ${fieldType},`);
      }

      const code = `#[derive(Debug, Serialize, Deserialize)]\npub struct ${structName} {\n${fields.join('\n')}\n}`;
      structs.set(structName, code);
      return structName;
    }

    if (typeof node === 'number') return Number.isInteger(node) ? 'i64' : 'f64';
    if (typeof node === 'boolean') return 'bool';
    return 'String';
  }

  walk(val, rootName);
  return 'use serde::{Serialize, Deserialize};\n\n' + Array.from(structs.values()).reverse().join('\n\n');
}

/* ==================== PYTHON PYDANTIC ==================== */
function generatePython(val: any, rootName: string, _options: GeneratorOptions): string {
  const models = new Map<string, string>();

  function walk(node: any, name: string): string {
    if (node === null) return 'Optional[Any] = None';
    if (Array.isArray(node)) {
      if (node.length === 0) return 'List[Any]';
      const itemType = walk(node[0], name + 'Item');
      return `List[${itemType}]`;
    }
    if (typeof node === 'object') {
      const modelName = sanitizeIdentifier(name);
      if (models.has(modelName)) return modelName;

      const fields: string[] = [];

      for (const [key, propVal] of Object.entries(node)) {
        const fieldType = walk(propVal, key);
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');

        if (safeKey !== key) {
          fields.push(`    ${safeKey}: ${fieldType} = Field(..., alias="${key}")`);
        } else {
          fields.push(`    ${safeKey}: ${fieldType}`);
        }
      }

      const code = `class ${modelName}(BaseModel):\n${fields.join('\n')}`;
      models.set(modelName, code);
      return modelName;
    }

    if (typeof node === 'number') return Number.isInteger(node) ? 'int' : 'float';
    if (typeof node === 'boolean') return 'bool';
    return 'str';
  }

  walk(val, rootName);
  const header = 'from typing import List, Optional, Any\nfrom pydantic import BaseModel, Field\n\n';
  return header + Array.from(models.values()).reverse().join('\n\n');
}
