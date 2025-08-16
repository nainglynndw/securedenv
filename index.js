const SecEnvUtils = require('./src/utils');

/**
 * SecuredEnv - Secure environment variable encryption and management
 * 
 * @example
 * const SecuredEnv = require('securedenv');
 * 
 * // Backup environment files
 * await SecuredEnv.backup('myPassword123!');
 * 
 * // Restore environment files
 * await SecuredEnv.restore('myPassword123!');
 * 
 * // Export backup file
 * await SecuredEnv.export('myPassword123!', './my-backup.secenv');
 * 
 * // Import backup file
 * await SecuredEnv.import('myPassword123!', './my-backup.secenv');
 */
class SecuredEnv {
  /**
   * Get project information (name and hash)
   * @returns {Object} Project info with name and hash
   */
  static getProjectInfo() {
    return SecEnvUtils.getProjectInfo();
  }

  /**
   * Get the SecuredEnv storage directory for the current platform
   * @returns {string} Storage directory path
   */
  static getStorageDir() {
    return SecEnvUtils.getSecEnvDir();
  }

  /**
   * Get the project-specific storage directory
   * @returns {string} Project directory path
   */
  static getProjectDir() {
    return SecEnvUtils.getProjectDir();
  }

  /**
   * Find all environment files in the current directory
   * @returns {Promise<string[]>} Array of environment file names
   */
  static async findEnvFiles() {
    return await SecEnvUtils.findEnvFiles();
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with isStrong, score, and requirements
   */
  static validatePassword(password) {
    return SecEnvUtils.validatePasswordStrength(password);
  }

  /**
   * Encrypt data with password
   * @param {string} data - Data to encrypt
   * @param {string} password - Encryption password
   * @returns {Object} Encrypted data object
   */
  static encrypt(data, password) {
    return SecEnvUtils.encrypt(data, password);
  }

  /**
   * Decrypt data with password
   * @param {Object} encryptedData - Encrypted data object
   * @param {string} password - Decryption password
   * @returns {string} Decrypted data
   */
  static decrypt(encryptedData, password) {
    return SecEnvUtils.decrypt(encryptedData, password);
  }

  /**
   * Backup environment files to secure storage
   * @param {string} password - Encryption password
   * @returns {Promise<Object>} Backup result with project info and file count
   */
  static async backup(password) {
    const projectInfo = this.getProjectInfo();
    const envFiles = await this.findEnvFiles();
    
    if (envFiles.length === 0) {
      throw new Error('No environment files found in current directory');
    }

    // Validate password
    const validation = this.validatePassword(password);
    if (!validation.isStrong) {
      throw new Error(`Weak password: ${validation.message}`);
    }

    // Ensure project directory exists
    await SecEnvUtils.ensureProjectDir();

    // Read and encrypt all environment files
    const encryptedFiles = {};
    for (const file of envFiles) {
      const content = await SecEnvUtils.readEnvFile(file);
      encryptedFiles[file] = this.encrypt(content, password);
    }

    // Create backup data
    const backupData = {
      project: projectInfo.projectName,
      hash: projectInfo.projectHash,
      timestamp: new Date().toISOString(),
      files: encryptedFiles
    };

    // Save to secure storage
    const backupFile = SecEnvUtils.getProjectBackupFile();
    await SecEnvUtils.writeBackupFile(backupFile, backupData);

    return {
      project: projectInfo.projectName,
      files: envFiles,
      count: envFiles.length,
      backupFile
    };
  }

  /**
   * Restore environment files from secure storage
   * @param {string} password - Decryption password
   * @returns {Promise<Object>} Restore result with project info and restored files
   */
  static async restore(password) {
    const projectInfo = this.getProjectInfo();
    const backupFile = SecEnvUtils.getProjectBackupFile();

    try {
      // Read backup data
      const backupData = await SecEnvUtils.readBackupFile(backupFile);
      
      // Verify project matches
      if (backupData.hash !== projectInfo.projectHash) {
        throw new Error(`Project mismatch. Backup is for project "${backupData.project}" but current project is "${projectInfo.projectName}"`);
      }

      // Decrypt and restore files
      const restoredFiles = [];
      for (const [filename, encryptedData] of Object.entries(backupData.files)) {
        const content = this.decrypt(encryptedData, password);
        await SecEnvUtils.writeEnvFile(filename, content);
        restoredFiles.push(filename);
      }

      return {
        project: backupData.project,
        timestamp: backupData.timestamp,
        files: restoredFiles,
        count: restoredFiles.length
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`No backup found for project "${projectInfo.projectName}"`);
      }
      throw error;
    }
  }

  /**
   * Export backup file to specified location
   * @param {string} password - Decryption password to verify backup
   * @param {string} exportPath - Path where to export the backup file
   * @returns {Promise<Object>} Export result
   */
  static async export(password, exportPath) {
    const projectInfo = this.getProjectInfo();
    const backupFile = SecEnvUtils.getProjectBackupFile();

    try {
      // Verify backup exists and password is correct
      const backupData = await SecEnvUtils.readBackupFile(backupFile);
      
      // Test decryption to verify password
      const firstFile = Object.values(backupData.files)[0];
      if (firstFile) {
        this.decrypt(firstFile, password); // Will throw if wrong password
      }

      // Copy backup file to export location
      const fs = require('fs').promises;
      await fs.copyFile(backupFile, exportPath);

      return {
        project: backupData.project,
        exportPath,
        timestamp: backupData.timestamp,
        fileCount: Object.keys(backupData.files).length
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`No backup found for project "${projectInfo.projectName}"`);
      }
      throw error;
    }
  }

  /**
   * Import backup file from specified location
   * @param {string} password - Decryption password
   * @param {string} importPath - Path to the backup file to import
   * @returns {Promise<Object>} Import result
   */
  static async import(password, importPath) {
    const projectInfo = this.getProjectInfo();

    try {
      // Read backup file
      const backupData = await SecEnvUtils.readBackupFile(importPath);
      
      // Ensure project directory exists
      await SecEnvUtils.ensureProjectDir();

      // Save to internal storage
      const internalBackupFile = SecEnvUtils.getProjectBackupFile();
      const fs = require('fs').promises;
      await fs.copyFile(importPath, internalBackupFile);

      // Decrypt and create environment files
      const restoredFiles = [];
      for (const [filename, encryptedData] of Object.entries(backupData.files)) {
        const content = this.decrypt(encryptedData, password);
        await SecEnvUtils.writeEnvFile(filename, content);
        restoredFiles.push(filename);
      }

      return {
        project: backupData.project,
        currentProject: projectInfo.projectName,
        timestamp: backupData.timestamp,
        files: restoredFiles,
        count: restoredFiles.length,
        importPath,
        storedAt: internalBackupFile
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Backup file not found at "${importPath}"`);
      }
      throw error;
    }
  }

  /**
   * Check if a backup exists for the current project
   * @returns {Promise<boolean>} True if backup exists
   */
  static async hasBackup() {
    const backupFile = SecEnvUtils.getProjectBackupFile();
    const fs = require('fs').promises;
    try {
      await fs.access(backupFile);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get backup information without decrypting
   * @returns {Promise<Object|null>} Backup metadata or null if no backup
   */
  static async getBackupInfo() {
    if (!(await this.hasBackup())) {
      return null;
    }

    try {
      const backupFile = SecEnvUtils.getProjectBackupFile();
      const backupData = await SecEnvUtils.readBackupFile(backupFile);
      
      return {
        project: backupData.project,
        hash: backupData.hash,
        timestamp: backupData.timestamp,
        fileCount: Object.keys(backupData.files).length,
        files: Object.keys(backupData.files)
      };
    } catch {
      return null;
    }
  }
}

// Export both the class and individual utilities
module.exports = SecuredEnv;
module.exports.SecuredEnv = SecuredEnv;
module.exports.SecEnvUtils = SecEnvUtils;