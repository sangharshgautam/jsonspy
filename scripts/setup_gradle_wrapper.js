import fs from 'fs';
import path from 'path';

const pluginDir = path.resolve('intellij-plugin');
const wrapperDir = path.join(pluginDir, 'gradle/wrapper');

if (!fs.existsSync(wrapperDir)) {
  fs.mkdirSync(wrapperDir, { recursive: true });
}

// Write gradle-wrapper.properties pointing to Gradle 8.13 / 9.0.0
const propsContent = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.13-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;

fs.writeFileSync(path.join(wrapperDir, 'gradle-wrapper.properties'), propsContent);

console.log('Updated gradle-wrapper.properties to Gradle 8.13 / 9.0');
