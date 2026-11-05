import { SmartFixReport } from '../types/jsonspy';

/**
 * SmartFix Engine — Automatically repairs common JSON syntax errors:
 * - Single-line and multi-line comments
 * - Trailing commas in arrays and objects
 * - Unquoted property keys
 * - Single-quoted strings and keys
 * - JS/Python primitive keywords (True, False, None, undefined, NaN)
 * - Trailing semicolons
 */
export function smartFixJSON(rawContent: string): SmartFixReport {
  const fixesApplied: string[] = [];
  let current = rawContent.trim();

  // First check if it's already valid JSON
  try {
    JSON.parse(current);
    return {
      repairedText: JSON.stringify(JSON.parse(current), null, 2),
      fixesApplied: ['Already valid JSON (formatted)'],
      fixedCount: 0,
      isValidJson: true,
    };
  } catch (e: any) {
    // Continue with repair attempts
  }

  // 1. Remove trailing semicolons
  if (current.endsWith(';')) {
    current = current.replace(/;+$/, '');
    fixesApplied.push('Removed trailing semicolon(s)');
  }

  // 2. Remove comments (// and /* */)
  const commentRegex = /(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm;
  if (commentRegex.test(current)) {
    current = current.replace(commentRegex, '');
    fixesApplied.push('Stripped JavaScript comments (// and /* */)');
  }

  // 3. Replace Python / JS keywords: True, False, None, undefined, NaN, Infinity
  const keywordReplacements: [RegExp, string, string][] = [
    [/\bTrue\b/g, 'true', 'Replaced "True" with "true"'],
    [/\bFalse\b/g, 'false', 'Replaced "False" with "false"'],
    [/\bNone\b/g, 'null', 'Replaced "None" with "null"'],
    [/\bundefined\b/g, 'null', 'Replaced "undefined" with "null"'],
    [/\bNaN\b/g, 'null', 'Replaced "NaN" with "null"'],
    [/\bInfinity\b/g, 'null', 'Replaced "Infinity" with "null"'],
  ];

  for (const [regex, replacement, logMessage] of keywordReplacements) {
    if (regex.test(current)) {
      current = current.replace(regex, replacement);
      fixesApplied.push(logMessage);
    }
  }

  // 4. Fix single-quoted strings and keys
  // Handle single quote key-values e.g. 'foo': 'bar' or 'foo': "bar" or "foo": 'bar'
  const singleQuoteRegex = /'([^'\\]*(?:\\.[^'\\]*)*)'/g;
  if (singleQuoteRegex.test(current)) {
    current = current.replace(singleQuoteRegex, (_match, group1) => {
      // Escape any unescaped double quotes inside group1
      const escaped = group1.replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    fixesApplied.push('Converted single quotes to double quotes');
  }

  // 5. Fix unquoted keys e.g. { name: "John", age: 30, is_active: true }
  // Match unquoted identifier keys followed by a colon
  const unquotedKeyRegex = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g;
  if (unquotedKeyRegex.test(current)) {
    current = current.replace(unquotedKeyRegex, '$1"$2"$3');
    fixesApplied.push('Enclosed unquoted property keys in double quotes');
  }

  // 6. Fix trailing commas in objects and arrays:
  // e.g., { "a": 1, "b": 2, } -> { "a": 1, "b": 2 }
  // e.g., [ 1, 2, 3, ] -> [ 1, 2, 3 ]
  const trailingCommaRegex = /,\s*([}\]])/g;
  if (trailingCommaRegex.test(current)) {
    current = current.replace(trailingCommaRegex, '$1');
    fixesApplied.push('Removed trailing commas in objects and arrays');
  }

  // Final validation attempt
  let isValid = false;
  let errorDetail: string | undefined = undefined;
  let repairedText = current;

  try {
    const parsed = JSON.parse(current);
    repairedText = JSON.stringify(parsed, null, 2);
    isValid = true;
  } catch (e: any) {
    errorDetail = e.message || 'Syntax error remaining';
    // Even if JSON.parse failed, attempt a secondary regex pass for consecutive commas
    const doubleCommasRegex = /,\s*,/g;
    if (doubleCommasRegex.test(current)) {
      current = current.replace(doubleCommasRegex, ',');
      fixesApplied.push('Removed duplicate consecutive commas');
      try {
        const parsed2 = JSON.parse(current);
        repairedText = JSON.stringify(parsed2, null, 2);
        isValid = true;
        errorDetail = undefined;
      } catch (err2: any) {
        errorDetail = err2.message;
      }
    }
  }

  return {
    repairedText,
    fixesApplied,
    fixedCount: fixesApplied.length,
    isValidJson: isValid,
    errorDetail,
  };
}
