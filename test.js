#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing SecuredEnv CLI...\n');

const testPassword = 'SecureTest2024!@#';
const testKeyFile = 'test-key.bin';
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

// Test helper functions
function cleanupTestFiles() {
  const filesToClean = ['.env.test', '.env.prod', 'test-backup.secenv', testKeyFile, 'custom-key.bin'];
  filesToClean.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}

function fileExists(filename) {
  return fs.existsSync(filename);
}

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

// === KEY FILE TESTS ===

runTest('Generate Key Command', () => {
  const output = execSync(`node bin/secenv.js generate-key --output ${testKeyFile}`, { encoding: 'utf8' });
  if (!output.includes('✅ Key file generated successfully!')) throw new Error('Key generation failed');
  if (!fileExists(testKeyFile)) throw new Error('Key file not created');
  
  // Verify key file is binary and correct size
  const keyStats = fs.statSync(testKeyFile);
  if (keyStats.size !== 32) throw new Error(`Key file size incorrect: ${keyStats.size} bytes, expected 32`);
});

runTest('Backup with Key File', () => {
  // Only clean env files, not the key file we just generated
  if (fs.existsSync('.env.test')) fs.unlinkSync('.env.test');
  if (fs.existsSync('.env.prod')) fs.unlinkSync('.env.prod');
  fs.writeFileSync('.env.test', 'TEST_VAR=keyfile123\nAPI_KEY=keyfilesecret\n');
  fs.writeFileSync('.env.prod', 'PROD_VAR=keyfileprod456\nDB_URL=postgres://keyfileprod\n');
  
  const output = execSync(`node bin/secenv.js backup --key-file ${testKeyFile}`, { encoding: 'utf8' });
  if (!output.includes('✅ Backup completed!')) throw new Error('Backup with key file failed');
});

runTest('Restore with Key File', () => {
  // Remove env files
  fs.unlinkSync('.env.test');
  fs.unlinkSync('.env.prod');
  
  const output = execSync(`node bin/secenv.js restore --key-file ${testKeyFile}`, { encoding: 'utf8' });
  if (!output.includes('✅ Restore completed!')) throw new Error('Restore with key file failed');
  if (!fileExists('.env.test')) throw new Error('.env.test not restored with key file');
  if (!fileExists('.env.prod')) throw new Error('.env.prod not restored with key file');
  
  // Verify content
  const testContent = fs.readFileSync('.env.test', 'utf8');
  if (!testContent.includes('TEST_VAR=keyfile123')) throw new Error('Key file restore content incorrect');
});

runTest('Export and Import with Key File', () => {
  const exportOutput = execSync('node bin/secenv.js export --output keyfile-backup.secenv', { encoding: 'utf8' });
  if (!exportOutput.includes('✅ Export completed!')) throw new Error('Export failed');
  if (!fileExists('keyfile-backup.secenv')) throw new Error('Export file not created');
  
  // Clean env files and internal backup
  if (fs.existsSync('.env.test')) fs.unlinkSync('.env.test');
  if (fs.existsSync('.env.prod')) fs.unlinkSync('.env.prod');
  execSync('rm -rf ~/.config/securedenv 2>/dev/null || rm -rf ~/Library/Application\\ Support/SecuredEnv 2>/dev/null || true');
  
  const importOutput = execSync(`node bin/secenv.js import keyfile-backup.secenv --key-file ${testKeyFile}`, { encoding: 'utf8' });
  if (!importOutput.includes('✅ Import completed!')) throw new Error('Import with key file failed');
  if (!fileExists('.env.test')) throw new Error('.env.test not imported with key file');
  if (!fileExists('.env.prod')) throw new Error('.env.prod not imported with key file');
  
  // Cleanup export file
  fs.unlinkSync('keyfile-backup.secenv');
});

runTest('Custom Binary Key File', () => {
  // Create a custom binary key file
  const customKey = Buffer.from('mycustomsecretkey1234567890123456', 'utf8').slice(0, 32);
  fs.writeFileSync('custom-key.bin', customKey);
  
  // Clean and create new test files (but keep our key files)
  if (fs.existsSync('.env.test')) fs.unlinkSync('.env.test');
  if (fs.existsSync('.env.prod')) fs.unlinkSync('.env.prod');
  fs.writeFileSync('.env.test', 'TEST_VAR=custom123\nAPI_KEY=customsecret\n');
  
  // Test backup and restore with custom key
  const backupOutput = execSync('node bin/secenv.js backup --key-file custom-key.bin', { encoding: 'utf8' });
  if (!backupOutput.includes('✅ Backup completed!')) throw new Error('Backup with custom key failed');
  
  fs.unlinkSync('.env.test');
  
  const restoreOutput = execSync('node bin/secenv.js restore --key-file custom-key.bin', { encoding: 'utf8' });
  if (!restoreOutput.includes('✅ Restore completed!')) throw new Error('Restore with custom key failed');
  
  const content = fs.readFileSync('.env.test', 'utf8');
  if (!content.includes('TEST_VAR=custom123')) throw new Error('Custom key restore content incorrect');
});

// === ERROR HANDLING TESTS ===

runTest('Error: Both Key and Key File', () => {
  try {
    execSync(`node bin/secenv.js backup --key ${testPassword} --key-file ${testKeyFile}`, { encoding: 'utf8' });
    throw new Error('Should have failed with both key options');
  } catch (error) {
    if (!error.message.includes('Cannot specify both --key and --key-file options')) {
      throw new Error('Wrong error message for both key options');
    }
  }
});

runTest('Error: Nonexistent Key File', () => {
  try {
    execSync('node bin/secenv.js backup --key-file nonexistent.key', { encoding: 'utf8' });
    throw new Error('Should have failed with nonexistent key file');
  } catch (error) {
    if (!error.message.includes('Cannot read key file')) {
      throw new Error('Wrong error message for nonexistent key file');
    }
  }
});

runTest('Error: No Key Provided', () => {
  try {
    execSync('node bin/secenv.js backup', { encoding: 'utf8' });
    throw new Error('Should have failed with no key provided');
  } catch (error) {
    if (!error.message.includes('Encryption key is required')) {
      throw new Error('Wrong error message for no key provided');
    }
  }
});

runTest('Key File Cross-Compatibility', () => {
  // Test that a backup made with password can't be restored with key file and vice versa
  if (fs.existsSync('.env.test')) fs.unlinkSync('.env.test');
  if (fs.existsSync('.env.prod')) fs.unlinkSync('.env.prod');
  fs.writeFileSync('.env.test', 'TEST_VAR=crosstest\n');
  
  // Backup with password
  execSync(`node bin/secenv.js backup --key ${testPassword}`, { encoding: 'utf8' });
  fs.unlinkSync('.env.test');
  
  // Try to restore with key file (should fail)
  try {
    execSync(`node bin/secenv.js restore --key-file ${testKeyFile}`, { encoding: 'utf8' });
    throw new Error('Should have failed with wrong key');
  } catch (error) {
    // Expected to fail due to wrong decryption key
    if (error.status === 0) {
      throw new Error('Cross-compatibility test failed - should not have succeeded');
    }
  }
});

// Cleanup
cleanupTestFiles();

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