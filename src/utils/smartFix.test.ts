import { describe, it, expect } from 'vitest';
import { smartFixJSON } from './smartFix';

describe('SmartFix JSON Engine', () => {
  it('should pass valid JSON without changes', () => {
    const valid = '{"name": "JSONSpy", "version": 1}';
    const report = smartFixJSON(valid);
    expect(report.isValidJson).toBe(true);
    expect(report.fixedCount).toBe(0);
  });

  it('should repair trailing commas, unquoted keys, and single quotes', () => {
    const malformed = "{ name: 'JSONSpy', active: True, }";
    const report = smartFixJSON(malformed);
    expect(report.isValidJson).toBe(true);
    const parsed = JSON.parse(report.repairedText);
    expect(parsed.name).toBe('JSONSpy');
    expect(parsed.active).toBe(true);
  });

  it('should repair unclosed string values and unquoted string values', () => {
    const malformed = '{"title": "JSONSpy, "author": Alice}';
    const report = smartFixJSON(malformed);
    expect(report.isValidJson).toBe(true);
    const parsed = JSON.parse(report.repairedText);
    expect(parsed.title).toBe('JSONSpy');
    expect(parsed.author).toBe('Alice');
  });
});
