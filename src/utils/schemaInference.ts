/**
 * Automated JSON Schema Inference Utility
 * Generates JSON Schema draft 2020-12 from raw sample JSON data.
 */

export function inferJsonSchema(value: any, title = 'RootSchema'): object {
  const rootSchema: Record<string, any> = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title,
    type: getItemType(value),
  };

  const body = buildTypeSchema(value);
  return { ...rootSchema, ...body };
}

function getItemType(val: any): string {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'number') return Number.isInteger(val) ? 'integer' : 'number';
  return typeof val;
}

function detectStringFormat(str: string): string | undefined {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return 'email';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) return 'date-time';
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return 'date';
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str)) return 'uuid';
  if (/^https?:\/\/[^\s]+$/.test(str)) return 'uri';
  return undefined;
}

function buildTypeSchema(val: any): Record<string, any> {
  if (val === null) return { type: 'null' };
  if (typeof val === 'boolean') return { type: 'boolean' };
  if (typeof val === 'number') {
    return { type: Number.isInteger(val) ? 'integer' : 'number' };
  }
  if (typeof val === 'string') {
    const format = detectStringFormat(val);
    const schema: Record<string, any> = { type: 'string' };
    if (format) schema.format = format;
    return schema;
  }

  if (Array.isArray(val)) {
    if (val.length === 0) {
      return { type: 'array', items: {} };
    }
    // Infer items schema based on first item or merged schema
    const firstItem = val[0];
    return {
      type: 'array',
      items: buildTypeSchema(firstItem),
    };
  }

  if (typeof val === 'object') {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [key, propVal] of Object.entries(val)) {
      properties[key] = buildTypeSchema(propVal);
      required.push(key);
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }

  return {};
}
