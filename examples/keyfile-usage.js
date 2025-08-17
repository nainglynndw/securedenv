#!/usr/bin/env node

/**
 * SecuredEnv Binary Key File Usage Example
 * 
 * This example demonstrates the new binary key file functionality:
 * - Generating secure binary key files
 * - Using key files for backup and restore operations
 * - CLI integration with key files
 * - Security best practices
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function keyfileExample() {
  console.log('🔑 SecuredEnv Binary Key File Usage Example\n');

  const keyFile = 'example-project.key';
  const testEnvFile = '.env.example-test';

  try {
    // 1. Generate a secure binary key file
    console.log('1. Generating secure binary key file...');
    execSync(`node ../bin/secenv.js generate-key --output ${keyFile}`, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log(`   ✅ Generated: ${keyFile}\n`);

    // 2. Create sample environment file
    console.log('2. Creating sample environment file...');
    await fs.writeFile(path.join(__dirname, testEnvFile), 
      'KEYFILE_EXAMPLE=true\nAPI_ENDPOINT=https://api.example.com\nSECRET_TOKEN=sk_live_example123\n'
    );
    console.log(`   ✅ Created: ${testEnvFile}\n`);

    // 3. Backup using key file
    console.log('3. Creating backup with key file...');
    execSync(`node ../bin/secenv.js backup --key-file ${keyFile}`, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('   ✅ Backup completed with key file\n');

    // 4. Simulate file loss
    console.log('4. Simulating file loss...');
    await fs.unlink(path.join(__dirname, testEnvFile));
    console.log(`   🗑️  Removed: ${testEnvFile}\n`);

    // 5. Restore using key file
    console.log('5. Restoring with key file...');
    execSync(`node ../bin/secenv.js restore --key-file ${keyFile}`, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('   ✅ Restore completed with key file\n');

    // 6. Verify restoration
    console.log('6. Verifying restored content...');
    const restoredContent = await fs.readFile(path.join(__dirname, testEnvFile), 'utf8');
    console.log('   📄 Restored content:');
    console.log('   ' + restoredContent.split('\n').join('\n   '));

    // 7. Export and import example
    console.log('7. Testing export/import with key file...');
    const exportFile = 'keyfile-backup.secenv';
    
    execSync(`node ../bin/secenv.js export --output ${exportFile}`, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    
    // Remove env file again
    await fs.unlink(path.join(__dirname, testEnvFile));
    
    execSync(`node ../bin/secenv.js import ${exportFile} --key-file ${keyFile}`, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    
    console.log('   ✅ Export/Import with key file successful\n');

    // 8. Security demonstration
    console.log('8. Security demonstration...');
    const keyStats = await fs.stat(path.join(__dirname, keyFile));
    console.log(`   🔒 Key file size: ${keyStats.size} bytes (cryptographically secure)`);
    
    const keyContent = await fs.readFile(path.join(__dirname, keyFile));
    console.log(`   🔐 Key file is binary (unreadable): ${keyContent.toString('hex').substring(0, 16)}...`);
    console.log('   💡 Key file never uploaded to GitHub (stays local)\n');

    // 9. Custom key file example
    console.log('9. Using custom binary file as key...');
    const customKey = Buffer.from('MyCustomSecretKey123456789012345', 'utf8').slice(0, 32);
    await fs.writeFile(path.join(__dirname, 'custom.key'), customKey);
    
    execSync(`node ../bin/secenv.js backup --key-file custom.key`, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('   ✅ Custom key file works too!\n');

    console.log('✅ Binary key file example completed successfully!');
    console.log('\n💡 Key File Best Practices:');
    console.log('   • Keep key files secure and private');
    console.log('   • Share key files through secure channels only');
    console.log('   • Use different key files for different projects/environments');
    console.log('   • Key files work great for CI/CD automation');
    console.log('   • Key files never get uploaded to GitHub (security by design)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    try {
      await fs.unlink(path.join(__dirname, keyFile));
      await fs.unlink(path.join(__dirname, 'custom.key'));
      await fs.unlink(path.join(__dirname, testEnvFile));
      await fs.unlink(path.join(__dirname, 'keyfile-backup.secenv'));
      console.log('\n🧹 Cleanup completed');
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  keyfileExample();
}

module.exports = keyfileExample;