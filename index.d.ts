declare module 'securedenv' {
  export interface ProjectInfo {
    projectName: string;
    projectHash: string;
  }

  export interface PasswordValidation {
    isStrong: boolean;
    score: number;
    requirements: {
      minLength: boolean;
      hasUpper: boolean;
      hasLower: boolean;
      hasNumber: boolean;
      hasSpecial: boolean;
      notCommon: boolean;
    };
    message: string;
  }

  export interface EncryptedData {
    encrypted: string;
    salt: string;
    iv: string;
    authTag: string;
  }

  export interface BackupResult {
    project: string;
    files: string[];
    count: number;
    backupFile: string;
  }

  export interface RestoreResult {
    project: string;
    timestamp: string;
    files: string[];
    count: number;
  }

  export interface ExportResult {
    project: string;
    exportPath: string;
    timestamp: string;
    fileCount: number;
  }

  export interface ImportResult {
    project: string;
    currentProject: string;
    timestamp: string;
    files: string[];
    count: number;
    importPath: string;
    storedAt: string;
  }

  export interface BackupInfo {
    project: string;
    hash: string;
    timestamp: string;
    fileCount: number;
    files: string[];
  }

  export class SecuredEnv {
    /**
     * Get project information (name and hash)
     */
    static getProjectInfo(): ProjectInfo;

    /**
     * Get the SecuredEnv storage directory for the current platform
     */
    static getStorageDir(): string;

    /**
     * Get the project-specific storage directory
     */
    static getProjectDir(): string;

    /**
     * Find all environment files in the current directory
     */
    static findEnvFiles(): Promise<string[]>;

    /**
     * Validate password strength
     */
    static validatePassword(password: string): PasswordValidation;

    /**
     * Encrypt data with password
     */
    static encrypt(data: string, password: string): EncryptedData;

    /**
     * Decrypt data with password
     */
    static decrypt(encryptedData: EncryptedData, password: string): string;

    /**
     * Backup environment files to secure storage
     */
    static backup(password: string): Promise<BackupResult>;

    /**
     * Restore environment files from secure storage
     */
    static restore(password: string): Promise<RestoreResult>;

    /**
     * Export backup file to specified location
     */
    static export(password: string, exportPath: string): Promise<ExportResult>;

    /**
     * Import backup file from specified location
     */
    static import(password: string, importPath: string): Promise<ImportResult>;

    /**
     * Check if a backup exists for the current project
     */
    static hasBackup(): Promise<boolean>;

    /**
     * Get backup information without decrypting
     */
    static getBackupInfo(): Promise<BackupInfo | null>;
  }

  export class SecEnvUtils {
    static getProjectInfo(): ProjectInfo;
    static getSecEnvDir(): string;
    static getProjectDir(): string;
    static getProjectBackupFile(): string;
    static ensureProjectDir(): Promise<string>;
    static findEnvFiles(): Promise<string[]>;
    static validatePasswordStrength(password: string): PasswordValidation;
    static deriveKey(password: string, salt: Buffer, projectInfo: ProjectInfo): Buffer;
    static encrypt(data: string, password: string): EncryptedData;
    static decrypt(encryptedData: EncryptedData, password: string): string;
    static readEnvFile(filePath: string): Promise<string>;
    static writeEnvFile(filePath: string, content: string): Promise<void>;
    static serializeBinary(data: any): Buffer;
    static deserializeBinary(buffer: Buffer): any;
    static readBackupFile(filePath: string): Promise<any>;
    static writeBackupFile(filePath: string, data: any): Promise<void>;
  }

  // Default export
  export = SecuredEnv;
}