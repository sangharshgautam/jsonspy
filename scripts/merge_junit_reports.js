import fs from 'fs';
import path from 'path';

const testResultsDir = path.resolve('test-results');
const vitestXml = path.join(testResultsDir, 'junit.xml');
const playwrightXml = path.join(testResultsDir, 'playwright-junit.xml');

if (fs.existsSync(vitestXml) && fs.existsSync(playwrightXml)) {
  const vitestContent = fs.readFileSync(vitestXml, 'utf-8');
  const playwrightContent = fs.readFileSync(playwrightXml, 'utf-8');

  const pwSuitesMatch = playwrightContent.match(/<testsuite[\s\S]*?<\/testsuite>/g);
  if (pwSuitesMatch) {
    let combined = vitestContent.replace('</testsuites>', '');
    for (const suite of pwSuitesMatch) {
      combined += '\n    ' + suite;
    }
    combined += '\n</testsuites>';
    fs.writeFileSync(vitestXml, combined);
    console.log('Successfully merged Playwright and Vitest JUnit XML reports into junit.xml!');
  }
}
