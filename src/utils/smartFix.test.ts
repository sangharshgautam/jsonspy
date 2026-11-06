import { smartFixJSON } from './smartFix';

export function runSmartFixTests() {
  console.log('Running SmartFix TypeScript Unit Tests...');
  const malformed = "{ name: 'JSONSpy', active: True, }";
  const report = smartFixJSON(malformed);

  if (report.isValidJson) {
    console.log('✅ SmartFix test passed! Repaired text:', report.repairedText);
  } else {
    console.error('❌ SmartFix test failed:', report.errorDetail);
  }
}

// Run test if invoked directly
runSmartFixTests();
