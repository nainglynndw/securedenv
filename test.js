#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing SecuredEnv CLI...\n');

const testPassword = 'SecureTest2024!@#';
let testsPass = 0;
let testsFail = 0;

function runTest(name, fn) {
  try {
    console.log(`🔬 ${name}`);
    fn();
    console.log('✅ PASS\n');
    testsPass++;
  } catch (error) {
    console.log('❌ FAIL:', error.message, '\n');
    testsFail++;
  }
}

// Setup test files
fs.writeFileSync('.env.test', 'TEST_VAR=test123\nAPI_KEY=secret\n');
fs.writeFileSync('.env.prod', 'PROD_VAR=prod456\nDB_URL=postgres://prod\n');

runTest('Backup Command', () => {
  const output = execSync(`node bin/secenv.js backup --key ${testPassword}`, { encoding: 'utf8' });
  if (!output.includes('✅ Backup completed!')) throw new Error('Backup failed');
});

runTest('Export Command', () => {
  const output = execSync('node bin/secenv.js export --output test-backup.secenv', { encoding: 'utf8' });
  if (!output.includes('✅ Export completed!')) throw new Error('Export failed');
  if (!fs.existsSync('test-backup.secenv')) throw new Error('Backup file not created');
});

runTest('Restore Command', () => {
  fs.unlinkSync('.env.test');
  fs.unlinkSync('.env.prod');
  
  const output = execSync(`node bin/secenv.js restore --key ${testPassword}`, { encoding: 'utf8' });
  if (!output.includes('✅ Restore completed!')) throw new Error('Restore failed');
  if (!fs.existsSync('.env.test')) throw new Error('.env.test not restored');
  if (!fs.existsSync('.env.prod')) throw new Error('.env.prod not restored');
});

runTest('Import Command', () => {
  fs.unlinkSync('.env.test');
  fs.unlinkSync('.env.prod');
  execSync('rm -rf ~/.secenv');
  
  const output = execSync(`node bin/secenv.js import test-backup.secenv --key ${testPassword}`, { encoding: 'utf8' });
  if (!output.includes('✅ Import completed!')) throw new Error('Import failed');
  if (!fs.existsSync('.env.test')) throw new Error('.env.test not imported');
  if (!fs.existsSync('.env.prod')) throw new Error('.env.prod not imported');
});

runTest('File Content Verification', () => {
  const testContent = fs.readFileSync('.env.test', 'utf8');
  const prodContent = fs.readFileSync('.env.prod', 'utf8');
  
  if (!testContent.includes('TEST_VAR=test123')) throw new Error('Test file content incorrect');
  if (!prodContent.includes('PROD_VAR=prod456')) throw new Error('Prod file content incorrect');
});

// Cleanup
fs.unlinkSync('.env.test');
fs.unlinkSync('.env.prod');
fs.unlinkSync('test-backup.secenv');

console.log('='.repeat(50));
console.log(`✅ Tests Passed: ${testsPass}`);
console.log(`❌ Tests Failed: ${testsFail}`);
console.log(`📊 Total: ${testsPass + testsFail}`);

if (testsFail > 0) {
  console.log('\n❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed! SecuredEnv is working correctly.');
}