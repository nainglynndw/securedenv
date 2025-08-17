const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const glob = require('glob');
const fetch = require('node-fetch');

class SecEnvUtils {
  static getProjectInfo() {
    const projectName = path.basename(process.cwd());
    const projectHash = crypto.createHash('sha256')
      .update(projectName)
      .digest('hex')
      .substring(0, 16);
    
    return { projectName, projectHash };
  }

  static getSecEnvDir() {
    const platform = process.platform;
    
    switch (platform) {
      case 'win32':
        // Windows: %APPDATA%\SecuredEnv
        const appDataPath = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
        return path.join(appDataPath, 'SecuredEnv');
      
      case 'darwin':
        // macOS: ~/Library/Application Support/SecuredEnv
        return path.join(os.homedir(), 'Library', 'Application Support', 'SecuredEnv');
      
      case 'linux':
      default:
        // Linux: ~/.config/securedenv (XDG Base Directory)
        const configHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
        return path.join(configHome, 'securedenv');
    }
  }

  static getProjectDir() {
    const { projectHash } = this.getProjectInfo();
    return path.join(this.getSecEnvDir(), projectHash);
  }

  static getProjectBackupFile() {
    return path.join(this.getProjectDir(), '.secenv');
  }

  static async ensureProjectDir() {
    const projectDir = this.getProjectDir();
    await fs.mkdir(projectDir, { recursive: true });
    return projectDir;
  }

  static async findEnvFiles() {
    return new Promise((resolve, reject) => {
      glob('.env*', { 
        cwd: process.cwd(),
        ignore: ['.env.example', '.env.template']
      }, (err, files) => {
        if (err) reject(err);
        else resolve(files.filter(file => !file.endsWith('.secenv')));
      });
    });
  }

  static validatePasswordStrength(password) {
    const requirements = {
      minLength: password.length >= 12,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      notCommon: !['password', 'password123', '123456789', 'qwerty'].some(common => 
        password.toLowerCase().includes(common))
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const isStrong = score >= 5;

    return {
      isStrong,
      score,
      requirements,
      message: isStrong ? 'Strong password' : 
        `Weak password. Requirements: ${Object.entries(requirements)
          .filter(([, met]) => !met)
          .map(([req]) => req.replace(/([A-Z])/g, ' $1').toLowerCase())
          .join(', ')}`
    };
  }

  static deriveKey(password, salt, projectInfo) {
    // Multi-layer key derivation for enhanced security
    
    // Step 1: Validate password strength
    const validation = this.validatePasswordStrength(password);
    if (!validation.isStrong) {
      throw new Error(`Security Error: ${validation.message}`);
    }

    // Step 2: Create project-specific additional entropy (portable across users/platforms)
    const projectEntropy = crypto.createHash('sha256')
      .update(projectInfo.projectName)
      .update('securedenv-v1')
      .digest();

    // Step 3: Multiple rounds of key stretching
    // Round 1: Standard PBKDF2 with high iterations
    let key = crypto.pbkdf2Sync(password, salt, 500000, 32, 'sha256'); // Increased to 500k
    
    // Round 2: Additional stretching with project entropy
    key = crypto.pbkdf2Sync(key, Buffer.concat([salt, projectEntropy]), 100000, 32, 'sha256');
    
    // Round 3: Final hardening
    const finalSalt = crypto.createHash('sha256').update(salt).update(projectEntropy).digest();
    key = crypto.pbkdf2Sync(key, finalSalt, 50000, 32, 'sha256');
    
    return key;
  }

  static encrypt(data, password) {
    const salt = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const projectInfo = this.getProjectInfo();
    
    // Enhanced key derivation
    const key = this.deriveKey(password, salt, projectInfo);
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
      // No algorithm field - always AES-256-GCM
    };
  }

  static decrypt(encryptedData, password) {
    const { encrypted, salt, iv, authTag } = encryptedData;
    const projectInfo = this.getProjectInfo();
    
    // Enhanced key derivation (same process as encrypt)
    const key = this.deriveKey(password, Buffer.from(salt, 'hex'), projectInfo);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static async readEnvFile(filePath) {
    return await fs.readFile(filePath, 'utf8');
  }

  static async writeEnvFile(filePath, content) {
    await fs.writeFile(filePath, content, 'utf8');
  }

  static serializeBinary(data) {
    // Convert data to binary format (unreadable)
    const jsonString = JSON.stringify(data);
    const jsonBuffer = Buffer.from(jsonString, 'utf8');
    
    // Add magic header to identify SecuredEnv files
    const magicHeader = Buffer.from('SECENV01', 'ascii'); // 8 bytes
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32BE(jsonBuffer.length, 0);
    
    // Obfuscate the data (simple XOR with repeating key)
    const obfuscationKey = Buffer.from('SecuredEnvObfuscation2024', 'utf8');
    const obfuscatedData = Buffer.alloc(jsonBuffer.length);
    
    for (let i = 0; i < jsonBuffer.length; i++) {
      obfuscatedData[i] = jsonBuffer[i] ^ obfuscationKey[i % obfuscationKey.length];
    }
    
    // Combine: header + length + obfuscated data
    return Buffer.concat([magicHeader, lengthBuffer, obfuscatedData]);
  }

  static deserializeBinary(buffer) {
    if (buffer.length < 12) {
      throw new Error('Invalid backup file format');
    }
    
    // Check magic header
    const magicHeader = buffer.slice(0, 8);
    if (magicHeader.toString('ascii') !== 'SECENV01') {
      throw new Error('Invalid backup file format - not a SecuredEnv file');
    }
    
    // Read data length
    const lengthBuffer = buffer.slice(8, 12);
    const dataLength = lengthBuffer.readUInt32BE(0);
    
    if (buffer.length !== 12 + dataLength) {
      throw new Error('Corrupted backup file - invalid length');
    }
    
    // Deobfuscate data
    const obfuscatedData = buffer.slice(12);
    const obfuscationKey = Buffer.from('SecuredEnvObfuscation2024', 'utf8');
    const jsonBuffer = Buffer.alloc(dataLength);
    
    for (let i = 0; i < dataLength; i++) {
      jsonBuffer[i] = obfuscatedData[i] ^ obfuscationKey[i % obfuscationKey.length];
    }
    
    // Parse JSON
    const jsonString = jsonBuffer.toString('utf8');
    return JSON.parse(jsonString);
  }

  static async readBackupFile(filePath) {
    const buffer = await fs.readFile(filePath);
    return this.deserializeBinary(buffer);
  }

  static async writeBackupFile(filePath, data) {
    const binaryData = this.serializeBinary(data);
    await fs.writeFile(filePath, binaryData);
  }

  // GitHub Configuration
  static getConfigDir() {
    const secEnvDir = this.getSecEnvDir();
    return path.join(secEnvDir, 'config');
  }

  static getConfigFile() {
    return path.join(this.getConfigDir(), 'config.json');
  }

  static async ensureConfigDir() {
    const configDir = this.getConfigDir();
    await fs.mkdir(configDir, { recursive: true });
    return configDir;
  }

  static async readConfig() {
    try {
      const configFile = this.getConfigFile();
      const configData = await fs.readFile(configFile, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      return {}; // Return empty config if file doesn't exist
    }
  }

  static async writeConfig(config) {
    await this.ensureConfigDir();
    const configFile = this.getConfigFile();
    await fs.writeFile(configFile, JSON.stringify(config, null, 2), 'utf8');
  }

  static async setGitHubConfig(token, repo) {
    const config = await this.readConfig();
    config.github = { token, repo };
    await this.writeConfig(config);
  }

  static async getGitHubConfig() {
    const config = await this.readConfig();
    return config.github || {};
  }

  // GitHub API functions
  static async githubApiRequest(endpoint, options = {}) {
    const { token } = await this.getGitHubConfig();
    if (!token) {
      throw new Error('GitHub token not configured. Run: secenv config --github-token <token>');
    }

    const url = `https://api.github.com${endpoint}`;
    const headers = {
      'Authorization': `token ${token}`,
      'User-Agent': 'SecuredEnv/1.0.0',
      'Accept': 'application/vnd.github.v3+json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${error}`);
    }

    return response;
  }

  static async uploadToGitHub(projectName, backupData) {
    const { repo } = await this.getGitHubConfig();
    if (!repo) {
      throw new Error('GitHub repo not configured. Run: secenv config --github-repo owner/repo');
    }

    const filePath = `${projectName}/backup.secenv`;
    const content = this.serializeBinary(backupData).toString('base64');

    // Check if file exists to get SHA for update
    let sha = null;
    try {
      const existingResponse = await this.githubApiRequest(`/repos/${repo}/contents/${filePath}`);
      const existingData = await existingResponse.json();
      sha = existingData.sha;
    } catch (error) {
      // File doesn't exist, that's okay
    }

    // Upload/update file
    const payload = {
      message: `Update environment backup for ${projectName}`,
      content,
      ...(sha && { sha })
    };

    await this.githubApiRequest(`/repos/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  static async downloadFromGitHub(projectName) {
    const { repo } = await this.getGitHubConfig();
    if (!repo) {
      throw new Error('GitHub repo not configured. Run: secenv config --github-repo owner/repo');
    }

    const filePath = `${projectName}/backup.secenv`;
    
    const response = await this.githubApiRequest(`/repos/${repo}/contents/${filePath}`);
    const data = await response.json();
    
    if (data.type !== 'file') {
      throw new Error(`No backup found for project '${projectName}' in GitHub repo`);
    }

    const content = Buffer.from(data.content, 'base64');
    return this.deserializeBinary(content);
  }
}

module.exports = SecEnvUtils;