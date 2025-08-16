#!/usr/bin/env node

/**
 * SecuredEnv TypeScript Usage Example
 * 
 * This example demonstrates how to use SecuredEnv with TypeScript,
 * including proper type annotations and error handling.
 */

import SecuredEnv, { 
  BackupResult, 
  RestoreResult, 
  ExportResult, 
  ImportResult, 
  ProjectInfo,
  BackupInfo,
  PasswordValidation 
} from '../index';

async function typeScriptExample(): Promise<void> {
  console.log('📘 SecuredEnv TypeScript Usage Example\n');

  const password: string = 'TypeScriptExample123!';

  try {
    // 1. Get project information with proper typing
    console.log('1. Getting project information...');
    const projectInfo: ProjectInfo = SecuredEnv.getProjectInfo();
    console.log(`   Project: ${projectInfo.projectName}`);
    console.log(`   Hash: ${projectInfo.projectHash}\n`);

    // 2. Validate password with typed response
    console.log('2. Validating password...');
    const validation: PasswordValidation = SecuredEnv.validatePassword(password);
    console.log(`   Strong: ${validation.isStrong}`);
    console.log(`   Score: ${validation.score}/6`);
    if (!validation.isStrong) {
      console.log(`   Issues: ${validation.message}`);
    }
    console.log();

    // 3. Find environment files
    console.log('3. Finding environment files...');
    const envFiles: string[] = await SecuredEnv.findEnvFiles();
    console.log(`   Found: ${envFiles.join(', ') || 'none'}\n`);

    // Create sample files if none exist
    if (envFiles.length === 0) {
      const fs = await import('fs/promises');
      await fs.writeFile('.env', 'TS_EXAMPLE=true\nAPI_VERSION=v2\n');
      console.log('   Created sample .env file\n');
    }

    // 4. Backup with proper typing
    console.log('4. Creating backup...');
    const backupResult: BackupResult = await SecuredEnv.backup(password);
    console.log(`   ✅ Backup created`);
    console.log(`   Project: ${backupResult.project}`);
    console.log(`   Files: ${backupResult.files.join(', ')}`);
    console.log(`   Count: ${backupResult.count}`);
    console.log(`   Location: ${backupResult.backupFile}\n`);

    // 5. Get backup info with optional typing
    console.log('5. Getting backup information...');
    const backupInfo: BackupInfo | null = await SecuredEnv.getBackupInfo();
    if (backupInfo) {
      console.log(`   Project: ${backupInfo.project}`);
      console.log(`   Hash: ${backupInfo.hash}`);
      console.log(`   Timestamp: ${backupInfo.timestamp}`);
      console.log(`   File count: ${backupInfo.fileCount}`);
      console.log(`   Files: ${backupInfo.files.join(', ')}\n`);
    } else {
      console.log('   No backup information available\n');
    }

    // 6. Export with proper error handling
    console.log('6. Exporting backup...');
    const exportPath: string = './typescript-backup.secenv';
    
    try {
      const exportResult: ExportResult = await SecuredEnv.export(password, exportPath);
      console.log(`   ✅ Exported to: ${exportResult.exportPath}`);
      console.log(`   Project: ${exportResult.project}`);
      console.log(`   Timestamp: ${exportResult.timestamp}`);
      console.log(`   File count: ${exportResult.fileCount}\n`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`   ❌ Export failed: ${error.message}\n`);
      } else {
        console.error(`   ❌ Unknown export error\n`);
      }
      throw error;
    }

    // 7. Test restore functionality
    console.log('7. Testing restore...');
    const restoreResult: RestoreResult = await SecuredEnv.restore(password);
    console.log(`   ✅ Restore successful`);
    console.log(`   Project: ${restoreResult.project}`);
    console.log(`   Timestamp: ${restoreResult.timestamp}`);
    console.log(`   Files: ${restoreResult.files.join(', ')}`);
    console.log(`   Count: ${restoreResult.count}\n`);

    // 8. Import functionality
    console.log('8. Testing import...');
    const importResult: ImportResult = await SecuredEnv.import(password, exportPath);
    console.log(`   ✅ Import successful`);
    console.log(`   Original project: ${importResult.project}`);
    console.log(`   Current project: ${importResult.currentProject}`);
    console.log(`   Files: ${importResult.files.join(', ')}`);
    console.log(`   Import path: ${importResult.importPath}`);
    console.log(`   Stored at: ${importResult.storedAt}\n`);

    // 9. Boolean checks
    console.log('9. Final checks...');
    const hasBackup: boolean = await SecuredEnv.hasBackup();
    console.log(`   Has backup: ${hasBackup}`);
    
    const storageDir: string = SecuredEnv.getStorageDir();
    console.log(`   Storage directory: ${storageDir}\n`);

    // Cleanup
    const fs = await import('fs/promises');
    await fs.unlink(exportPath);
    console.log('✅ TypeScript example completed successfully!');

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
      if (error.stack) {
        console.error(`Stack: ${error.stack}`);
      }
    } else {
      console.error('❌ Unknown error occurred');
    }
    process.exit(1);
  }
}

// Advanced TypeScript patterns
interface ConfigBackup {
  password: string;
  exportPath: string;
  projectName: string;
}

class SecuredEnvManager {
  private config: ConfigBackup;

  constructor(config: ConfigBackup) {
    this.config = config;
  }

  async createBackup(): Promise<BackupResult> {
    console.log(`🔧 Creating backup for ${this.config.projectName}...`);
    return await SecuredEnv.backup(this.config.password);
  }

  async exportBackup(): Promise<ExportResult> {
    console.log(`📤 Exporting to ${this.config.exportPath}...`);
    return await SecuredEnv.export(this.config.password, this.config.exportPath);
  }

  async getProjectInfo(): Promise<ProjectInfo> {
    return SecuredEnv.getProjectInfo();
  }
}

// Example of class usage
async function advancedTypeScriptExample(): Promise<void> {
  console.log('\n🚀 Advanced TypeScript Example\n');

  const config: ConfigBackup = {
    password: 'AdvancedExample123!',
    exportPath: './advanced-backup.secenv',
    projectName: 'TypeScript-Project'
  };

  const manager = new SecuredEnvManager(config);

  try {
    const projectInfo: ProjectInfo = await manager.getProjectInfo();
    console.log(`   Managing project: ${projectInfo.projectName}`);

    // Note: These would work if we had actual .env files
    // const backup: BackupResult = await manager.createBackup();
    // const exported: ExportResult = await manager.exportBackup();
    
    console.log('   ✅ Advanced example setup complete');
  } catch (error) {
    console.log('   ℹ️  Advanced example skipped (no .env files)');
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  (async () => {
    await typeScriptExample();
    await advancedTypeScriptExample();
  })();
}

export { typeScriptExample, advancedTypeScriptExample };