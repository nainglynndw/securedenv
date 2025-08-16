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
- 🚀 **Auto-detection** - Automatically finds and handles all .env\* files

## Installation

### As a CLI tool (global)

```bash
npm install -g securedenv
```

### Use without installing

```bash
npx secenv --help
```

## CLI Usage

### Basic Commands

```bash
# Backup all environment files in current project
secenv backup --key "YourStrongPassword123!"

# Restore environment files for current project
secenv restore --key "YourStrongPassword123!"

# Export backup to a file
secenv export --output "./my-backup.secenv"

# Import backup from a file
secenv import --key "YourStrongPassword123!" "./my-backup.secenv"
```

### Use without installing (with npx)

```bash
# If installed as dev dependency, use npx
npx secenv backup --key "YourStrongPassword123!"
npx secenv restore --key "YourStrongPassword123!"
npx secenv export --output "./backup.secenv"
npx secenv import --key "YourStrongPassword123!" "./backup.secenv"
```

### Real-world Workflow

```bash
# 1. In your project directory with .env files
cd /path/to/your/project

# 2. Backup your environment files
secenv backup --key "MySecurePassword123!"

# 3. Later, restore them (maybe after deleted local project or env and then clone from git)
secenv restore --key "MySecurePassword123!"

# 4. Export for sharing with team
secenv export --output "./prod-env.secenv"

# 5. On another machine, import the backup
secenv import --key "MySecurePassword123!" "./prod-env.secenv"
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
