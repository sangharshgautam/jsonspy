import fs from 'fs';
import path from 'path';

const testResultsDir = path.resolve('test-results');
const vitestXml = path.join(testResultsDir, 'junit.xml');
const playwrightXml = path.join(testResultsDir, 'playwright-junit.xml');

if (fs.existsSync(vitestXml) && fs.existsSync(playwrightXml)) {
  let vitestContent = fs.readFileSync(vitestXml, 'utf-8');
  const playwrightContent = fs.readFileSync(playwrightXml, 'utf-8');

  // Extract all individual <testsuite ...>...</testsuite> blocks
  const suiteMatches = playwrightContent.match(/<testsuite\b[^>]*>[\s\S]*?<\/testsuite>/g);
  if (suiteMatches) {
    const closingTag = '</testsuites>';
    const lastIndex = vitestContent.lastIndexOf(closingTag);
    if (lastIndex !== -1) {
      let combined = vitestContent.substring(0, lastIndex);
      for (const suite of suiteMatches) {
        combined += '\n    ' + suite;
      }
      combined += '\n' + closingTag;
      fs.writeFileSync(vitestXml, combined);

      // Remove playwright-junit.xml so Allure parses a single clean file
      fs.unlinkSync(playwrightXml);
      console.log('Successfully merged Playwright testsuites into junit.xml and cleaned up playwright-junit.xml!');
    }
  }
}
