#!/usr/bin/env node

/**
 * Basic SecuredEnv Library Usage Example
 * 
 * This example demonstrates the core functionality of SecuredEnv:
 * - Backing up environment files
 * - Restoring environment files
 * - Checking for existing backups
 * - Getting backup information
 */

const SecuredEnv = require('../index');

async function basicExample() {
  console.log('🔐 SecuredEnv Basic Usage Example\n');

  const password = 'ExamplePassword123!';

  try {
    // 1. Check if backup exists
    console.log('1. Checking for existing backup...');
    const hasBackup = await SecuredEnv.hasBackup();
    console.log(`   Has backup: ${hasBackup ? '✅' : '❌'}\n`);

    // 2. Get project information
    console.log('2. Project information:');
    const projectInfo = SecuredEnv.getProjectInfo();
    console.log(`   Project: ${projectInfo.projectName}`);
    console.log(`   Hash: ${projectInfo.projectHash}\n`);

    // 3. Find environment files
    console.log('3. Finding environment files...');
    const envFiles = await SecuredEnv.findEnvFiles();
    console.log(`   Found files: ${envFiles.join(', ') || 'none'}\n`);

    if (envFiles.length === 0) {
      console.log('⚠️  No environment files found. Creating a sample .env file...');
      const fs = require('fs').promises;
      await fs.writeFile('.env', 'EXAMPLE_VAR=hello-world\nAPI_KEY=sample-key-123\n');
      console.log('   Created sample .env file\n');
    }

    // 4. Validate password
    console.log('4. Validating password strength...');
    const validation = SecuredEnv.validatePassword(password);
    console.log(`   Password strength: ${validation.isStrong ? '✅ Strong' : '❌ Weak'}`);
    console.log(`   Score: ${validation.score}/6\n`);

    // 5. Create backup
    console.log('5. Creating backup...');
    const backupResult = await SecuredEnv.backup(password);
    console.log(`   ✅ Backup created for project: ${backupResult.project}`);
    console.log(`   📁 Files backed up: ${backupResult.files.join(', ')}`);
    console.log(`   💾 Stored at: ${backupResult.backupFile}\n`);

    // 6. Get backup info
    console.log('6. Getting backup information...');
    const backupInfo = await SecuredEnv.getBackupInfo();
    if (backupInfo) {
      console.log(`   📅 Backup date: ${new Date(backupInfo.timestamp).toLocaleString()}`);
      console.log(`   📄 File count: ${backupInfo.fileCount}`);
      console.log(`   📋 Files: ${backupInfo.files.join(', ')}\n`);
    }

    // 7. Simulate file loss (remove .env files)
    console.log('7. Simulating file loss (removing .env files)...');
    const fs = require('fs').promises;
    for (const file of backupResult.files) {
      await fs.unlink(file);
      console.log(`   🗑️  Removed: ${file}`);
    }
    console.log();

    // 8. Restore from backup
    console.log('8. Restoring from backup...');
    const restoreResult = await SecuredEnv.restore(password);
    console.log(`   ✅ Restored project: ${restoreResult.project}`);
    console.log(`   📁 Files restored: ${restoreResult.files.join(', ')}`);
    console.log(`   🕒 Original backup date: ${new Date(restoreResult.timestamp).toLocaleString()}\n`);

    console.log('✅ Basic usage example completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  basicExample();
}

module.exports = basicExample;