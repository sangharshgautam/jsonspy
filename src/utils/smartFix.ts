import { SmartFixReport } from '../types/jsonspy';

/**
 * SmartFix Engine — Automatically repairs common JSON syntax errors:
 * - Single-line and multi-line comments
 * - Trailing commas in arrays and objects
 * - Unquoted property keys and string values
 * - Single-quoted strings and keys
 * - Missing opening or closing string quotes
 * - JS/Python primitive keywords (True, False, None, undefined, NaN)
 * - Trailing semicolons and auto-closing missing brackets/braces
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
  const singleQuoteRegex = /'([^'\\]*(?:\\.[^'\\]*)*)'/g;
  if (singleQuoteRegex.test(current)) {
    current = current.replace(singleQuoteRegex, (_match, group1) => {
      const escaped = group1.replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    fixesApplied.push('Converted single quotes to double quotes');
  }

  // 5. Fix unquoted keys e.g. { name: "John", age: 30 }
  const unquotedKeyRegex = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g;
  if (unquotedKeyRegex.test(current)) {
    current = current.replace(unquotedKeyRegex, '$1"$2"$3');
    fixesApplied.push('Enclosed unquoted property keys in double quotes');
  }

  // 6. Fix unclosed string literals before comma, brace, or bracket
  // e.g. "key": "value } -> "key": "value" }
  const unclosedStringRegex = /(:\s*")([^"\r\n,}\]]+)(\s*[,}\]])/g;
  if (unclosedStringRegex.test(current)) {
    current = current.replace(unclosedStringRegex, '$1$2"$3');
    fixesApplied.push('Closed unclosed string literal');
  }

  // 7. Fix missing opening quote on string values
  // e.g. "key": value" -> "key": "value"
  const missingOpenQuoteRegex = /(:\s*)([a-zA-Z0-9_$]+)"(\s*[,}\]])/g;
  if (missingOpenQuoteRegex.test(current)) {
    current = current.replace(missingOpenQuoteRegex, '$1"$2"$3');
    fixesApplied.push('Added missing opening quote on string value');
  }

  // 8. Fix unquoted string values (identifiers that are not boolean/null/number)
  // e.g. "key": Alice -> "key": "Alice"
  const unquotedValueRegex = /(:\s*)(?!(?:true|false|null|-?\d+(?:\.\d+)?)\b)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*[,}\]])/g;
  if (unquotedValueRegex.test(current)) {
    current = current.replace(unquotedValueRegex, '$1"$2"$3');
    fixesApplied.push('Enclosed unquoted string value in double quotes');
  }

  // 9. Fix trailing commas in objects and arrays
  const trailingCommaRegex = /,\s*([}\]])/g;
  if (trailingCommaRegex.test(current)) {
    current = current.replace(trailingCommaRegex, '$1');
    fixesApplied.push('Removed trailing commas in objects and arrays');
  }

  // 10. Auto-close missing braces / brackets at the end
  let openBraces = (current.match(/\{/g) || []).length - (current.match(/\}/g) || []).length;
  let openBrackets = (current.match(/\[/g) || []).length - (current.match(/\]/g) || []).length;
  if (openBraces > 0 || openBrackets > 0) {
    let appended = '';
    while (openBrackets > 0) { appended += ']'; openBrackets--; }
    while (openBraces > 0) { appended += '}'; openBraces--; }
    current = current + appended;
    fixesApplied.push('Auto-closed unclosed brackets/braces');
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
