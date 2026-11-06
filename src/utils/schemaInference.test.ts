import { describe, it, expect } from 'vitest';
import { inferJsonSchema } from './schemaInference';

describe('JSON Schema Inference Engine', () => {
  it('should infer correct types for object and fields', () => {
    const sample = {
      name: 'Alice',
      age: 30,
      active: true,
      email: 'alice@example.com',
    };

    const schema: any = inferJsonSchema(sample, 'UserSchema');
    expect(schema.title).toBe('UserSchema');
    expect(schema.type).toBe('object');
    expect(schema.properties.name.type).toBe('string');
    expect(schema.properties.age.type).toBe('integer');
    expect(schema.properties.active.type).toBe('boolean');
    expect(schema.properties.email.format).toBe('email');
  });
});
