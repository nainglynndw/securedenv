# SecuredEnv

🔐 **Secure environment variable encryption and management for cross-platform projects**

SecuredEnv provides a simple yet powerful way to encrypt, backup, and manage environment variables across different projects and platforms. It uses military-grade AES-256-GCM encryption with enhanced key derivation to keep your sensitive data secure.

## Features

- 🔒 **Military-grade encryption** - AES-256-GCM with triple-layer PBKDF2 key derivation (650,000+ iterations)
- 🔑 **Dual key support** - Password strings OR binary key files for maximum flexibility
- 🌍 **Cross-platform support** - Works on Windows, macOS, and Linux
- 📁 **Project isolation** - Each project has its own encrypted storage
- 🔄 **Backup & Restore** - Secure backup and restore of environment files
- ☁️ **GitHub Integration** - Cloud backup/sync using private GitHub repositories
- 📤 **Import/Export** - Share encrypted environment files between machines
- 🛡️ **Strong password validation** - Enforces secure password requirements
- 🔐 **Binary key generation** - Create cryptographically secure key files
- 📱 **CLI & Library** - Use as a command-line tool or programmatic library
- 🚀 **Auto-detection** - Automatically finds and handles all .env\* files
- 🔧 **Flexible key sources** - Use any binary file (SSH keys, certificates, etc.) as encryption key

## Installation

**Requirements:** Node.js ≥ 20.0.0

> **Note**: The Node.js 20+ requirement is for release tooling compatibility only. All SecuredEnv core features use stable APIs available since Node.js 10.0.0 and work identically across versions.

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

# GitHub Integration (Cloud Backup)
# Setup GitHub integration (one-time)
secenv config --github-token ghp_xxxxxxxxxxxx
secenv config --github-repo username/my-env-backups

# Push backup to GitHub
secenv push --key "YourStrongPassword123!"

# Pull backup from GitHub
secenv pull --key "YourStrongPassword123!"
```

### 🔑 Binary Key Files (New!)

```bash
# Generate a secure binary key file
secenv generate-key --output my-project.key

# Use binary key file instead of password
secenv backup --key-file my-project.key
secenv restore --key-file my-project.key
secenv import backup.secenv --key-file my-project.key

# GitHub sync with key file
secenv push --key-file my-project.key
secenv pull --key-file my-project.key

# Use any binary file as a key (SSH keys, certificates, etc.)
secenv backup --key-file ~/.ssh/id_rsa
secenv backup --key-file /path/to/certificate.pem
secenv backup --key-file custom-binary-file.bin
```

### Key Options

**You have two options for encryption keys:**

1. **Password strings** - `--key "password"`
   - Interactive and easy to remember
   - Must meet strong password requirements
   - Suitable for personal use and team sharing

2. **Binary key files** - `--key-file path/to/file`
   - Maximum security with cryptographically random data
   - Unreadable binary format
   - Can use existing files (SSH keys, certificates, etc.)
   - Perfect for automated scripts and CI/CD

**⚠️ Important:** You cannot use both `--key` and `--key-file` simultaneously. Choose one method per operation.

### Use without installing (with npx)

```bash
# Basic commands with npx
npx secenv backup --key "YourStrongPassword123!"
npx secenv restore --key "YourStrongPassword123!"
npx secenv export --output "./backup.secenv"
npx secenv import --key "YourStrongPassword123!" "./backup.secenv"

# Key file generation and usage
npx secenv generate-key --output project.key
npx secenv backup --key-file project.key
npx secenv restore --key-file project.key

# GitHub cloud backup with npx
npx secenv config --github-token ghp_xxxxxxxxxxxx
npx secenv config --github-repo username/my-env-backups
npx secenv push --key "YourStrongPassword123!"
npx secenv pull --key "YourStrongPassword123!"
```

### Real-world Workflows

#### Password-Based Workflow
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

#### Binary Key File Workflow (Enhanced Security)
```bash
# 1. Generate a secure key file (one-time setup)
secenv generate-key --output ~/.secenv/my-project.key

# 2. Backup using key file
cd /path/to/your/project
secenv backup --key-file ~/.secenv/my-project.key

# 3. Share key file securely with team (via secure channel)
# Copy ~/.secenv/my-project.key to team members

# 4. Team members can restore using the same key file
secenv restore --key-file ~/.secenv/my-project.key

# 5. Export and import also work with key files
secenv export --output "./prod-env.secenv"
secenv import "./prod-env.secenv" --key-file ~/.secenv/my-project.key
```

#### CI/CD Integration
```bash
# In your CI/CD pipeline
# Store binary key file as a secure CI/CD secret

# Restore environment in build pipeline
secenv restore --key-file "$CI_SECRET_KEY_FILE"

# Or use existing SSH key as encryption key
secenv restore --key-file ~/.ssh/id_rsa
```

### GitHub Cloud Backup Workflow

```bash
# Setup (one-time configuration)
secenv config --github-token ghp_xxxxxxxxxxxx
secenv config --github-repo username/my-env-backups

# Daily workflow in your project
cd /path/to/your/project

# Push to GitHub (backup + upload) - with password
secenv push --key "MySecurePassword123!"

# Or push with key file
secenv push --key-file ~/.secenv/my-project.key

# On another machine, pull from GitHub
secenv pull --key "MySecurePassword123!"
secenv pull --key-file ~/.secenv/my-project.key

# Check current configuration
secenv config
```

## GitHub Setup Guide

### 1. Create a Private Repository
```bash
# On GitHub, create a new private repository for your environment backups
# Example: username/my-env-backups
```

### 2. Generate Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "SecuredEnv Backup"
4. Select scopes: **repo** (Full control of private repositories)
5. Copy the generated token (starts with `ghp_`)

### 3. Configure SecuredEnv
```bash
# Set your GitHub token (one-time setup)
secenv config --github-token ghp_xxxxxxxxxxxx

# Set your repository (one-time setup)
secenv config --github-repo username/my-env-backups

# Verify configuration
secenv config
```

### 4. GitHub Repository Structure
After your first push, your repository will look like:
```
username/my-env-backups/
├── my-react-app/
│   └── backup.secenv
├── api-server/
│   └── backup.secenv
└── mobile-app/
    └── backup.secenv
```

## Security Features

### Encryption Details

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: Triple-layer PBKDF2 with 650,000+ total iterations
- **Salt**: 32-byte random salt per encryption
- **IV**: 16-byte random initialization vector per encryption
- **Authentication**: Built-in authentication tag prevents tampering

### Key Requirements

#### Password Requirements (--key option)

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

#### Binary Key File Requirements (--key-file option)

- Any readable binary file works as a key
- Recommended: 32+ bytes for optimal security
- Generated keys are cryptographically secure (32 bytes)
- Can reuse existing secure files (SSH keys, certificates)

```bash
# ✅ Supported key file types
--key-file project.key           # Generated key file
--key-file ~/.ssh/id_rsa         # SSH private key
--key-file /path/to/cert.pem     # Certificate file
--key-file custom-binary.bin     # Any binary file
--key-file secure-random.dat     # Random data file

# ✅ Generate secure key files
secenv generate-key --output secure.key
openssl rand 32 > random.key
dd if=/dev/urandom of=entropy.key bs=32 count=1
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

**Local Storage:**
- Encrypted backups stored in platform-specific directories
- Each project gets isolated storage using SHA256 hash
- No conflicts between different projects
- Binary format for enhanced security

**GitHub Cloud Storage:**
- Projects stored as human-readable folder names (e.g., `my-project/backup.secenv`)
- Same AES-256-GCM encryption applied before upload
- Version history maintained by GitHub
- Cross-machine synchronization enabled

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

## All CLI Commands Reference

### Core Commands

```bash
# Generate secure binary key file
secenv generate-key --output <filename>

# Backup environment files
secenv backup --key <password>           # Using password
secenv backup --key-file <file>          # Using binary key file

# Restore environment files
secenv restore --key <password>          # Using password  
secenv restore --key-file <file>         # Using binary key file

# Export backup to external file
secenv export --output <filename>

# Import backup from external file
secenv import <file> --key <password>    # Using password
secenv import <file> --key-file <file>   # Using binary key file
```

### GitHub Integration Commands

```bash
# Configure GitHub integration
secenv config --github-token <token>     # Set GitHub token
secenv config --github-repo <owner/repo> # Set repository
secenv config                            # Show current config

# Cloud backup sync
secenv push --key <password>             # Push with password
secenv push --key-file <file>            # Push with key file

secenv pull --key <password>             # Pull with password
secenv pull --key-file <file>            # Pull with key file
```

### Help and Information

```bash
secenv --help                            # Show general help
secenv <command> --help                  # Show command-specific help
secenv --version                         # Show version
```

## GitHub Integration Benefits

### ✅ **Free for Solo Developers**
- Uses GitHub's free private repositories
- No additional cloud storage costs
- 1GB repository limit (more than enough for env files)

### ✅ **Cross-Machine Synchronization**
```bash
# On Machine A
secenv push --key "password"

# On Machine B  
secenv pull --key "password"
```

### ✅ **Version History & Recovery**
- GitHub maintains complete backup history
- Rollback to previous versions if needed
- Commit messages show backup timestamps

### ✅ **Team Collaboration**
- Share private repository with team members
- Each developer uses same encryption password
- Consistent environment setup across team

### ✅ **Fully Tested & Production Ready**
```
✅ All Core Commands Verified:
  • backup/restore: Multiple environment files encrypted/decrypted
  • export/import: Portable backup creation & restoration
  • config: GitHub token & repository configuration
  • push/pull: Cloud sync with encrypted backup
  • generate-key: Cryptographically secure key file generation

✅ Key Management Verified:
  • Password-based encryption (strong password validation)
  • Binary key file encryption (32-byte secure keys)
  • Custom key files (SSH keys, certificates, etc.)
  • Cross-compatibility protection (different keys isolated)
  • Error handling (missing files, invalid options, etc.)

✅ Node.js Compatibility Verified:
  • Node.js 20+ requirement (for release tooling only)
  • All core APIs stable since Node.js 10.0.0
  • Cross-platform testing (Ubuntu, Windows, macOS)
  • Zero feature impact from Node.js update

✅ Security & Encryption:
  • AES-256-GCM encryption maintained
  • 650,000+ PBKDF2 iterations working
  • Binary format with XOR obfuscation
  • GitHub API authentication secure
  • Binary key files unreadable and secure

✅ Comprehensive Testing:
  • 14/14 test cases passing
  • Password and key file scenarios covered
  • Error handling and edge cases tested
  • CI/CD pipeline validated
  • Manual verification completed
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Automated Releases

This project uses GitHub Actions for automated releases and NPM publishing.

### 🚀 **GitHub Actions Workflow**
- **Manual Release Only**: Go to Actions → Release → Run workflow
- **CI/CD**: Cross-platform testing on every push/PR
- **No Auto-Release**: All releases must be manually triggered

### 📦 **Release Options**

**Option 1: GitHub Actions (Recommended)**
1. Go to your repo → Actions → "Release" workflow
2. Click "Run workflow" → Choose version type (patch/minor/major) → Run
3. Automatically creates GitHub release + publishes to NPM

**Option 2: Local Release**
```bash
npm run release          # Interactive release
npm run release:patch    # Patch version  
npm run release:minor    # Minor version
npm run release:major    # Major version
```

### ⚙️ **Setup Requirements**
- Add `NPM_TOKEN` secret to GitHub repository settings
- See [.github/SETUP.md](.github/SETUP.md) for detailed setup guide

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/nainglynndw/securedenv/issues)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/nainglynndw/securedenv/issues)
- 📚 **Documentation**: [GitHub Repository](https://github.com/nainglynndw/securedenv)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.

### v1.2.0 (Latest)

- 🔑 **Binary Key Files** - Support for secure binary key files alongside passwords
- 🔐 **generate-key command** - Create cryptographically secure 32-byte key files
- 🔧 **Flexible key sources** - Use any binary file (SSH keys, certificates, etc.) as encryption key
- ⚡ **Enhanced security** - Unreadable binary format for maximum protection
- 🛠️ **CI/CD ready** - Perfect for automated deployments and secure pipelines
- ✅ **Comprehensive testing** - 14 test cases covering all key file scenarios
- 📚 **Updated documentation** - Complete binary key file usage guide

### v1.1.0

- ☁️ **GitHub Integration** - Cloud backup using private repositories
- 🔧 **New Commands**: `config`, `push`, `pull` for GitHub sync
- 🌐 **Cross-machine sync** - Push from one machine, pull from another
- 📚 **Enhanced documentation** - Complete GitHub setup guide
- ✅ **Production tested** - Full round-trip verification

### v1.0.0

- Initial release
- CLI tool with backup, restore, export, import commands
- Library API for programmatic usage
- Cross-platform support (Windows, macOS, Linux)
- AES-256-GCM encryption with enhanced key derivation
- TypeScript definitions included

## License

MIT License - see [LICENSE](LICENSE) file for details.
