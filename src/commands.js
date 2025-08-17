const chalk = require('chalk');
const SecEnvUtils = require('./utils');

class SecEnvCommands {
  
  static async backup(options) {
    try {
      const { projectName } = SecEnvUtils.getProjectInfo();
      
      const key = await SecEnvUtils.resolveKey(options);

      console.log(chalk.blue(`🔍 Finding environment files in project: ${projectName}`));
      
      // Find all .env files
      const envFiles = await SecEnvUtils.findEnvFiles();
      
      if (envFiles.length === 0) {
        console.log(chalk.yellow('No .env files found in current directory'));
        return;
      }

      console.log(chalk.gray(`Found: ${envFiles.join(', ')}`));

      // Read and encrypt all .env files
      const backupData = {
        projectName,
        timestamp: new Date().toISOString(),
        environments: {}
      };

      for (const envFile of envFiles) {
        console.log(chalk.gray(`📖 Reading ${envFile}...`));
        const content = await SecEnvUtils.readEnvFile(envFile);
        
        console.log(chalk.gray(`🔒 Encrypting ${envFile}...`));
        const encrypted = SecEnvUtils.encrypt(content, key);
        
        backupData.environments[envFile] = {
          encrypted,
          size: content.length,
          lines: content.split('\n').length
        };
      }

      // Ensure project directory exists
      await SecEnvUtils.ensureProjectDir();
      
      // Save backup file
      const backupFile = SecEnvUtils.getProjectBackupFile();
      await SecEnvUtils.writeBackupFile(backupFile, backupData);

      console.log(chalk.green(`✅ Backup completed!`));
      console.log(chalk.gray(`📁 Project: ${projectName}`));
      console.log(chalk.gray(`📄 Files: ${envFiles.length} environment files`));
      console.log(chalk.gray(`💾 Stored: ${backupFile}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Backup failed:'), error.message);
      process.exit(1);
    }
  }

  static async export(options) {
    try {
      const { projectName } = SecEnvUtils.getProjectInfo();
      
      if (!options.output) {
        throw new Error('Output file is required. Use --output <filename>');
      }

      console.log(chalk.blue(`📤 Exporting backup for project: ${projectName}`));

      // Check if internal backup exists
      const backupFile = SecEnvUtils.getProjectBackupFile();
      
      try {
        await SecEnvUtils.readBackupFile(backupFile);
      } catch (error) {
        throw new Error(`No backup found for project '${projectName}'. Run 'secenv backup --key <password>' first.`);
      }

      // Copy internal backup to current directory
      const fs = require('fs').promises;
      await fs.copyFile(backupFile, options.output);

      console.log(chalk.green(`✅ Export completed!`));
      console.log(chalk.gray(`📁 Project: ${projectName}`));
      console.log(chalk.gray(`📄 File: ${options.output}`));
      console.log(chalk.yellow(`💡 You can now copy ${options.output} to another machine`));
      
    } catch (error) {
      console.error(chalk.red('❌ Export failed:'), error.message);
      process.exit(1);
    }
  }

  static async restore(options) {
    try {
      const { projectName } = SecEnvUtils.getProjectInfo();
      
      const key = await SecEnvUtils.resolveKey(options);

      console.log(chalk.blue(`📥 Restoring environments for project: ${projectName}`));

      // Read internal backup
      const backupFile = SecEnvUtils.getProjectBackupFile();
      let backupData;
      
      try {
        backupData = await SecEnvUtils.readBackupFile(backupFile);
      } catch (error) {
        throw new Error(`No backup found for project '${projectName}'. Use 'secenv import' to restore from external file.`);
      }

      console.log(chalk.gray(`📂 Original project: ${backupData.projectName}`));
      console.log(chalk.gray(`📅 Backup date: ${new Date(backupData.timestamp).toLocaleString()}`));

      // Decrypt and restore each environment file
      const envFiles = Object.keys(backupData.environments);
      
      for (const envFile of envFiles) {
        console.log(chalk.gray(`🔓 Decrypting ${envFile}...`));
        
        const envData = backupData.environments[envFile];
        const decryptedContent = SecEnvUtils.decrypt(envData.encrypted, key);
        
        console.log(chalk.gray(`📝 Creating ${envFile}...`));
        await SecEnvUtils.writeEnvFile(envFile, decryptedContent);
      }

      console.log(chalk.green(`✅ Restore completed!`));
      console.log(chalk.gray(`📁 Project: ${projectName}`));
      console.log(chalk.gray(`📄 Files: ${envFiles.join(', ')}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Restore failed:'), error.message);
      process.exit(1);
    }
  }

  static async import(file, options) {
    try {
      const { projectName } = SecEnvUtils.getProjectInfo();
      
      const key = await SecEnvUtils.resolveKey(options);

      console.log(chalk.blue(`📥 Importing environments to project: ${projectName}`));

      // Read external backup file
      let backupData;
      try {
        backupData = await SecEnvUtils.readBackupFile(file);
      } catch (error) {
        throw new Error(`Cannot read backup file: ${file}`);
      }

      console.log(chalk.gray(`📂 Original project: ${backupData.projectName}`));
      console.log(chalk.gray(`📅 Backup date: ${new Date(backupData.timestamp).toLocaleString()}`));

      // Ensure project directory exists
      await SecEnvUtils.ensureProjectDir();

      // Save backup to internal storage
      const internalBackupFile = SecEnvUtils.getProjectBackupFile();
      await SecEnvUtils.writeBackupFile(internalBackupFile, backupData);

      // Decrypt and create .env files
      const envFiles = Object.keys(backupData.environments);
      
      for (const envFile of envFiles) {
        console.log(chalk.gray(`🔓 Decrypting ${envFile}...`));
        
        const envData = backupData.environments[envFile];
        const decryptedContent = SecEnvUtils.decrypt(envData.encrypted, key);
        
        console.log(chalk.gray(`📝 Creating ${envFile}...`));
        await SecEnvUtils.writeEnvFile(envFile, decryptedContent);
      }

      console.log(chalk.green(`✅ Import completed!`));
      console.log(chalk.gray(`📁 Project: ${projectName}`));
      console.log(chalk.gray(`📄 Files: ${envFiles.join(', ')}`));
      console.log(chalk.gray(`💾 Stored: ${internalBackupFile}`));
      console.log(chalk.yellow(`🗑️  Please delete ${file} from current directory for security`));
      
    } catch (error) {
      console.error(chalk.red('❌ Import failed:'), error.message);
      process.exit(1);
    }
  }

  static async config(options) {
    try {
      if (options.githubToken) {
        const existingConfig = await SecEnvUtils.getGitHubConfig();
        await SecEnvUtils.setGitHubConfig(options.githubToken, existingConfig.repo || '');
        console.log(chalk.green('✅ GitHub token configured'));
        return;
      }

      if (options.githubRepo) {
        const existingConfig = await SecEnvUtils.getGitHubConfig();
        await SecEnvUtils.setGitHubConfig(existingConfig.token || '', options.githubRepo);
        console.log(chalk.green(`✅ GitHub repo configured: ${options.githubRepo}`));
        return;
      }

      // Show current config
      const config = await SecEnvUtils.getGitHubConfig();
      console.log(chalk.blue('📋 Current Configuration:'));
      console.log(chalk.gray(`GitHub Token: ${config.token ? '***configured***' : 'not set'}`));
      console.log(chalk.gray(`GitHub Repo: ${config.repo || 'not set'}`));

    } catch (error) {
      console.error(chalk.red('❌ Config failed:'), error.message);
      process.exit(1);
    }
  }

  static async push(options) {
    try {
      const { projectName } = SecEnvUtils.getProjectInfo();
      
      const key = await SecEnvUtils.resolveKey(options);

      console.log(chalk.blue(`☁️  Pushing backup to GitHub for project: ${projectName}`));

      // First create local backup
      console.log(chalk.gray('📦 Creating local backup...'));
      await this.backup(options);

      // Read the backup data
      const backupFile = SecEnvUtils.getProjectBackupFile();
      const backupData = await SecEnvUtils.readBackupFile(backupFile);

      // Upload to GitHub
      console.log(chalk.gray('⬆️  Uploading to GitHub...'));
      await SecEnvUtils.uploadToGitHub(projectName, backupData);

      console.log(chalk.green('✅ Push completed!'));
      console.log(chalk.gray(`📁 Project: ${projectName}`));
      console.log(chalk.gray(`☁️  Uploaded to GitHub repo`));

    } catch (error) {
      console.error(chalk.red('❌ Push failed:'), error.message);
      process.exit(1);
    }
  }

  static async pull(options) {
    try {
      const { projectName } = SecEnvUtils.getProjectInfo();
      
      const key = await SecEnvUtils.resolveKey(options);

      console.log(chalk.blue(`☁️  Pulling backup from GitHub for project: ${projectName}`));

      // Download from GitHub
      console.log(chalk.gray('⬇️  Downloading from GitHub...'));
      const backupData = await SecEnvUtils.downloadFromGitHub(projectName);

      console.log(chalk.gray(`📂 Original project: ${backupData.projectName}`));
      console.log(chalk.gray(`📅 Backup date: ${new Date(backupData.timestamp).toLocaleString()}`));

      // Save to local storage
      await SecEnvUtils.ensureProjectDir();
      const backupFile = SecEnvUtils.getProjectBackupFile();
      await SecEnvUtils.writeBackupFile(backupFile, backupData);

      // Decrypt and restore environment files
      const envFiles = Object.keys(backupData.environments);
      
      for (const envFile of envFiles) {
        console.log(chalk.gray(`🔓 Decrypting ${envFile}...`));
        
        const envData = backupData.environments[envFile];
        const decryptedContent = SecEnvUtils.decrypt(envData.encrypted, key);
        
        console.log(chalk.gray(`📝 Creating ${envFile}...`));
        await SecEnvUtils.writeEnvFile(envFile, decryptedContent);
      }

      console.log(chalk.green('✅ Pull completed!'));
      console.log(chalk.gray(`📁 Project: ${projectName}`));
      console.log(chalk.gray(`📄 Files: ${envFiles.join(', ')}`));
      console.log(chalk.gray(`💾 Stored: ${backupFile}`));

    } catch (error) {
      console.error(chalk.red('❌ Pull failed:'), error.message);
      process.exit(1);
    }
  }

  static async generateKey(options) {
    try {
      if (!options.output) {
        throw new Error('Output file is required. Use --output <filename>');
      }

      console.log(chalk.blue('🔑 Generating new encryption key file...'));

      // Generate cryptographically secure random key
      const keyData = SecEnvUtils.generateKeyFile();
      
      // Write binary key file
      await SecEnvUtils.writeKeyFile(options.output, keyData);

      console.log(chalk.green('✅ Key file generated successfully!'));
      console.log(chalk.gray(`📄 File: ${options.output}`));
      console.log(chalk.yellow('⚠️  Keep this file secure and do not share it'));
      console.log(chalk.yellow('💡 Use with: secenv backup --key-file ' + options.output));
      
    } catch (error) {
      console.error(chalk.red('❌ Key generation failed:'), error.message);
      process.exit(1);
    }
  }
}

module.exports = SecEnvCommands;