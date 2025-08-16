# SecuredEnv

🔐 **Secure environment variable encryption and management for cross-platform projects**

SecuredEnv provides a simple yet powerful way to encrypt, backup, and manage environment variables across different projects and platforms. It uses military-grade AES-256-GCM encryption with enhanced key derivation to keep your sensitive data secure.

## Features

- 🔒 **Military-grade encryption** - AES-256-GCM with triple-layer PBKDF2 key derivation (650,000+ iterations)
- 🌍 **Cross-platform support** - Works on Windows, macOS, and Linux
- 📁 **Project isolation** - Each project has its own encrypted storage
- 🔄 **Backup & Restore** - Secure backup and restore of environment files
- 📤 **Import/Export** - Share encrypted environment files between machines
- 🛡️ **Strong password validation** - Enforces secure password requirements
- 📱 **CLI & Library** - Use as a command-line tool or programmatic library
- 🚀 **Auto-detection** - Automatically finds and handles all .env* files

## Installation

### As a CLI tool (global)
```bash
npm install -g securedenv
```

### As a library (local)
```bash
npm install securedenv
```

### As a dev dependency
```bash
npm install --save-dev securedenv
```

## CLI Usage

### Basic Commands

```bash
# Backup all environment files in current project
secenv backup --key "YourStrongPassword123!"

# Restore environment files for current project
secenv restore --key "YourStrongPassword123!"

# Export backup to a file
secenv export --key "YourStrongPassword123!" --file "./my-backup.secenv"

# Import backup from a file
secenv import --key "YourStrongPassword123!" --file "./my-backup.secenv"
```

### As dev dependency (with npx)

```bash
# If installed as dev dependency, use npx
npx secenv backup --key "YourStrongPassword123!"
npx secenv restore --key "YourStrongPassword123!"
npx secenv export --key "YourStrongPassword123!" --file "./backup.secenv"
npx secenv import --key "YourStrongPassword123!" --file "./backup.secenv"
```

### Real-world Workflow

```bash
# 1. In your project directory with .env files
cd /path/to/your/project

# 2. Backup your environment files
secenv backup --key "MySecurePassword123!"

# 3. Later, restore them (maybe on a different machine)
secenv restore --key "MySecurePassword123!"

# 4. Export for sharing with team
secenv export --key "MySecurePassword123!" --file "./prod-env.secenv"

# 5. On another machine, import the backup
secenv import --key "MySecurePassword123!" --file "./prod-env.secenv"
```

## Library Usage

### Basic Example

```javascript
const SecuredEnv = require('securedenv');

async function example() {
  try {
    // Backup environment files
    const backupResult = await SecuredEnv.backup('MyStrongPassword123!');
    console.log(`Backed up ${backupResult.count} files for project: ${backupResult.project}`);

    // Restore environment files
    const restoreResult = await SecuredEnv.restore('MyStrongPassword123!');
    console.log(`Restored ${restoreResult.count} files`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

example();
```

### Advanced Example

```javascript
const SecuredEnv = require('securedenv');

async function advancedExample() {
  // Check if backup exists
  const hasBackup = await SecuredEnv.hasBackup();
  console.log('Has backup:', hasBackup);

  // Get backup info without decrypting
  const backupInfo = await SecuredEnv.getBackupInfo();
  if (backupInfo) {
    console.log('Backup info:', {
      project: backupInfo.project,
      timestamp: backupInfo.timestamp,
      files: backupInfo.files
    });
  }

  // Find environment files in current directory
  const envFiles = await SecuredEnv.findEnvFiles();
  console.log('Found env files:', envFiles);

  // Validate password strength
  const validation = SecuredEnv.validatePassword('weakpass');
  console.log('Password validation:', validation);

  // Get project information
  const projectInfo = SecuredEnv.getProjectInfo();
  console.log('Project info:', projectInfo);
}

advancedExample();
```

### Export/Import Example

```javascript
const SecuredEnv = require('securedenv');

async function exportImportExample() {
  const password = 'MyStrongPassword123!';
  
  // Export backup to a specific file
  const exportResult = await SecuredEnv.export(password, './my-backup.secenv');
  console.log('Exported to:', exportResult.exportPath);

  // Import backup from file
  const importResult = await SecuredEnv.import(password, './my-backup.secenv');
  console.log('Imported', importResult.count, 'files');
  console.log('Restored files:', importResult.files);
}

exportImportExample();
```

## API Reference

### SecuredEnv Methods

#### `backup(password: string): Promise<BackupResult>`
Backs up all environment files in the current directory to encrypted storage.

#### `restore(password: string): Promise<RestoreResult>`
Restores environment files from encrypted storage to the current directory.

#### `export(password: string, exportPath: string): Promise<ExportResult>`
Exports the backup file to a specified location for sharing.

#### `import(password: string, importPath: string): Promise<ImportResult>`
Imports a backup file and restores the environment files.

#### `hasBackup(): Promise<boolean>`
Checks if a backup exists for the current project.

#### `getBackupInfo(): Promise<BackupInfo | null>`
Gets backup metadata without requiring decryption.

#### `findEnvFiles(): Promise<string[]>`
Finds all environment files in the current directory.

#### `validatePassword(password: string): PasswordValidation`
Validates password strength according to security requirements.

#### `getProjectInfo(): ProjectInfo`
Gets the current project name and hash.

#### `getStorageDir(): string`
Gets the platform-specific storage directory.

### TypeScript Support

SecuredEnv includes full TypeScript definitions:

```typescript
import SecuredEnv, { BackupResult, RestoreResult, ProjectInfo } from 'securedenv';

const backup: BackupResult = await SecuredEnv.backup('password123!');
const projectInfo: ProjectInfo = SecuredEnv.getProjectInfo();
```

## Cross-Platform Usage

### Team Workflow Example

**Developer 1 (Windows):**
```bash
# Create backup
secenv backup --key "TeamPassword123!"

# Export for sharing
secenv export --key "TeamPassword123!" --file "./team-env.secenv"
# Share team-env.secenv file with team
```

**Developer 2 (macOS):**
```bash
# Import shared backup
secenv import --key "TeamPassword123!" --file "./team-env.secenv"

# Now can restore anytime
secenv restore --key "TeamPassword123!"
```

**Developer 3 (Linux):**
```bash
# Same commands work on all platforms
secenv import --key "TeamPassword123!" --file "./team-env.secenv"
```

### Project Migration Workflow

```bash
# Machine 1 (old laptop)
cd my-project
secenv backup --key "MySecurePassword123!"
secenv export --key "MySecurePassword123!" --file "./my-project-backup.secenv"
# Transfer my-project-backup.secenv to new machine

# Machine 2 (new laptop)  
git clone my-project
cd my-project  # Same folder name = same project
npm install -g securedenv  # or use npx
secenv import --key "MySecurePassword123!" --file "./my-project-backup.secenv"
rm my-project-backup.secenv  # Clean up for security
npm run dev  # .env files are ready!
```

### Dev Dependency Workflow

```bash
# Install as dev dependency in your project
npm install --save-dev securedenv

# Add to package.json scripts
{
  "scripts": {
    "env:backup": "secenv backup --key $ENV_PASSWORD",
    "env:restore": "secenv restore --key $ENV_PASSWORD",
    "env:export": "secenv export --key $ENV_PASSWORD --file ./envs.secenv"
  }
}

# Use with environment variable
export ENV_PASSWORD="MyProject2024!Backup#Secure"
npm run env:backup
npm run env:restore
```

## Security Features

### Encryption Details
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: Triple-layer PBKDF2 with 650,000+ total iterations
- **Salt**: 32-byte random salt per encryption
- **IV**: 16-byte random initialization vector per encryption
- **Authentication**: Built-in authentication tag prevents tampering

### Password Requirements
- Minimum 12 characters
- Must contain uppercase letters
- Must contain lowercase letters  
- Must contain numbers
- Must contain special characters
- Cannot contain common passwords

```bash
# ✅ Strong passwords (accepted)
--key "MyProject2024!Backup#789"
--key "Secure&Environment$Keys2024"
--key "Company!Production@Secrets#2024"

# ❌ Weak passwords (rejected)
--key "password123"          # Too common
--key "mypassword"           # No numbers/symbols  
--key "SHORT1!"              # Too short
```

### Storage Security
- Binary format prevents casual inspection
- XOR obfuscation adds additional layer
- Magic headers for file format validation
- Platform-specific secure storage locations

### Attack Resistance
```
Dictionary Attack Time with Enhanced Security:
├── Weak password blocked by validation
├── Strong password: ~10^18 years to crack  
├── Project-specific entropy: Can't reuse attacks across projects
├── 650,000 iterations: 6.5x slower than standard PBKDF2
└── Cross-platform compatible: Same project, same key (any OS/user)
```

## Storage Locations

SecuredEnv stores encrypted backups in platform-appropriate locations:

- **Windows**: `%APPDATA%\SecuredEnv`
- **macOS**: `~/Library/Application Support/SecuredEnv`
- **Linux**: `~/.config/securedenv`

Each project gets its own subdirectory based on a hash of the project name.

## How It Works

### Project Identity
- Projects are identified by **folder name** (not full path)
- `my-project` folder = same project regardless of location
- Works across different machines/paths

### Storage Architecture
- Encrypted backups stored in platform-specific directories
- Each project gets isolated storage using SHA256 hash
- No conflicts between different projects
- Binary format for enhanced security

## Environment File Detection

SecuredEnv automatically detects these environment file patterns:
- `.env`
- `.env.local`
- `.env.development`
- `.env.staging`
- `.env.production`
- `.env.test`
- Any `.env.*` pattern

**Excluded files:**
- `.env.example`
- `.env.template`
- `*.secenv` (backup files)

## Error Handling

```javascript
const SecuredEnv = require('securedenv');

async function handleErrors() {
  try {
    await SecuredEnv.backup('weak'); // Will throw for weak password
  } catch (error) {
    if (error.message.includes('Weak password')) {
      console.log('Password does not meet security requirements');
    }
  }

  try {
    await SecuredEnv.restore('wrongpassword');
  } catch (error) {
    if (error.message.includes('decrypt')) {
      console.log('Wrong password or corrupted backup');
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Publishing to NPM

To publish this package to npm:

```bash
# 1. Update version in package.json
npm version patch  # or minor/major

# 2. Build and test
npm test

# 3. Login to npm (if not already logged in)
npm login

# 4. Publish to npm
npm publish

# 5. Tag the release
git tag v1.0.0
git push origin v1.0.0
```

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/nainglynndw/securedenv/issues)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/nainglynndw/securedenv/issues)
- 📚 **Documentation**: [GitHub Repository](https://github.com/nainglynndw/securedenv)

## Changelog

### v1.0.0
- Initial release
- CLI tool with backup, restore, export, import commands
- Library API for programmatic usage
- Cross-platform support (Windows, macOS, Linux)
- AES-256-GCM encryption with enhanced key derivation
- TypeScript definitions included

## License

MIT License - see [LICENSE](LICENSE) file for details.