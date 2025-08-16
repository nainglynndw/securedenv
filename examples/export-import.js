#!/usr/bin/env node

/**
 * SecuredEnv Export/Import Example
 * 
 * This example demonstrates how to:
 * - Export backup files for sharing
 * - Import backup files from external sources
 * - Handle cross-project sharing scenarios
 */

const SecuredEnv = require('../index');
const path = require('path');
const fs = require('fs').promises;

async function exportImportExample() {
  console.log('📤 SecuredEnv Export/Import Example\n');

  const password = 'ShareablePassword123!';
  const exportPath = './shared-backup.secenv';

  try {
    // 1. Ensure we have environment files to work with
    console.log('1. Setting up environment files...');
    await fs.writeFile('.env', 'SHARED_VAR=exported-value\nAPI_URL=https://api.example.com\n');
    await fs.writeFile('.env.production', 'NODE_ENV=production\nDATABASE_URL=prod-db-url\n');
    console.log('   ✅ Created sample environment files\n');

    // 2. Create initial backup
    console.log('2. Creating initial backup...');
    const backupResult = await SecuredEnv.backup(password);
    console.log(`   ✅ Backup created for: ${backupResult.project}`);
    console.log(`   📁 Files: ${backupResult.files.join(', ')}\n`);

    // 3. Export backup to shareable file
    console.log('3. Exporting backup to shareable file...');
    const exportResult = await SecuredEnv.export(password, exportPath);
    console.log(`   ✅ Exported to: ${exportResult.exportPath}`);
    console.log(`   📅 Backup date: ${new Date(exportResult.timestamp).toLocaleString()}`);
    console.log(`   📄 File count: ${exportResult.fileCount}\n`);

    // 4. Verify export file exists
    console.log('4. Verifying export file...');
    const stats = await fs.stat(exportPath);
    console.log(`   📦 File size: ${stats.size} bytes`);
    console.log(`   🕒 Created: ${stats.birthtime.toLocaleString()}\n`);

    // 5. Simulate moving to different project/machine
    console.log('5. Simulating project migration...');
    console.log('   🗑️  Removing local environment files...');
    for (const file of backupResult.files) {
      await fs.unlink(file);
      console.log(`      Removed: ${file}`);
    }
    console.log();

    // 6. Import from the shared file
    console.log('6. Importing from shared backup file...');
    const importResult = await SecuredEnv.import(password, exportPath);
    console.log(`   ✅ Imported project: ${importResult.project}`);
    console.log(`   📁 Current project: ${importResult.currentProject}`);
    console.log(`   📄 Files restored: ${importResult.files.join(', ')}`);
    console.log(`   💾 Stored internally at: ${importResult.storedAt}`);
    console.log(`   📅 Original backup: ${new Date(importResult.timestamp).toLocaleString()}\n`);

    // 7. Verify files were restored
    console.log('7. Verifying restored files...');
    for (const file of importResult.files) {
      const content = await fs.readFile(file, 'utf8');
      console.log(`   📄 ${file}:`);
      console.log(`      ${content.trim().replace(/\n/g, '\\n      ')}`);
    }
    console.log();

    // 8. Clean up (remove shared backup file)
    console.log('8. Cleaning up...');
    await fs.unlink(exportPath);
    console.log(`   🗑️  Removed: ${exportPath}\n`);

    // 9. Demonstrate that internal backup still works
    console.log('9. Testing internal backup after import...');
    const hasBackup = await SecuredEnv.hasBackup();
    console.log(`   Has internal backup: ${hasBackup ? '✅' : '❌'}`);
    
    if (hasBackup) {
      const backupInfo = await SecuredEnv.getBackupInfo();
      console.log(`   📄 Files available: ${backupInfo.files.join(', ')}`);
    }

    console.log('\n✅ Export/Import example completed successfully!');
    console.log('\n💡 Key points:');
    console.log('   • Export creates a portable .secenv file');
    console.log('   • Import restores files AND saves backup internally');
    console.log('   • Same password works across different machines');
    console.log('   • Project identity preserved through folder name');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Cleanup on error
    try {
      await fs.unlink(exportPath);
    } catch {}
    
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  exportImportExample();
}

module.exports = exportImportExample;