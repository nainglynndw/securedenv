# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-08-17

### Added
- 🔑 **Binary Key Files** - Support for secure binary key files alongside passwords
- 🔐 **New CLI Command**: `secenv generate-key --output <file>` - Create cryptographically secure 32-byte key files
- 🔧 **Dual key support** - All encryption commands now accept both `--key <password>` and `--key-file <file>` options
- ⚡ **Enhanced security** - Unreadable binary format for maximum protection
- 🛠️ **CI/CD ready** - Perfect for automated deployments and secure pipelines
- 🔒 **Flexible key sources** - Use any binary file (SSH keys, certificates, etc.) as encryption key

### Enhanced Commands
- 🔄 **backup/restore** - Now support both `--key` and `--key-file` options
- ☁️ **push/pull** - GitHub integration works with both password and key file authentication
- 📤 **import/export** - External backup handling supports key files
- 🛡️ **Mutual exclusion** - Cannot use both `--key` and `--key-file` simultaneously (security by design)

### Security Improvements
- 🔒 **Binary key format** - 32 bytes of cryptographically secure random data
- 📁 **Key file isolation** - Key files remain local, never uploaded to GitHub
- 🛡️ **Cross-key protection** - Different keys cannot decrypt each other's data
- 🔐 **Custom key support** - Any readable binary file can serve as encryption key

### Testing
- ✅ **Comprehensive test suite** - 14 automated test cases covering all scenarios
- 🧪 **Key file validation** - Tests for generation, usage, and error handling
- 🔒 **Security verification** - Cross-compatibility and isolation testing
- ☁️ **GitHub integration** - Full push/pull testing with both key types

### Technical Details
- Generated keys are 32 bytes of cryptographically secure random data
- Key files stored in binary format (unreadable as text)
- Base64 conversion used internally for encryption
- Backward compatibility maintained with existing password-based workflows
- Error handling for missing files, invalid options, and mutual exclusion

### Documentation
- 📚 **Updated README** - Complete binary key file usage guide
- 💡 **New examples** - Key file workflows for individual developers, teams, and CI/CD
- 🔧 **CLI reference** - Updated command documentation with all options
- 🛠️ **Real-world usage** - Enterprise and automation use cases

## [1.1.1] - 2025-08-17

### Fixed
- 🔧 **Node.js compatibility** - Updated requirement to ≥20.0.0 for release tooling
- 🛠️ **GitHub Actions workflow** - Fixed workflow permissions for automated releases
- 📚 **Documentation** - Enhanced README with comprehensive testing verification

### Security
- 🔒 **Branch protection** - Configured proper GitHub repository security settings
- 🤖 **Workflow permissions** - Secured CI/CD pipeline while enabling releases

### Testing
- ✅ **All commands verified** - Manual testing of backup, restore, export, import, push, pull
- 🧪 **Cross-platform compatibility** - Confirmed Node.js API stability across versions
- 🚀 **Production ready** - Full end-to-end testing completed

## [1.1.0] - 2025-08-17

### Added
- ☁️ **GitHub Integration** - Cloud backup and restore using private GitHub repositories
- 🔧 **New CLI Commands**:
  - `secenv config` - Configure GitHub token and repository
  - `secenv push` - Push encrypted backup to GitHub
  - `secenv pull` - Pull and restore backup from GitHub
- 🌐 **Cross-machine synchronization** - Push from one machine, pull from another
- 📚 **GitHub Setup Guide** - Complete documentation for GitHub integration
- 🔒 **Enhanced security** - Same AES-256-GCM encryption for cloud storage

### Changed
- 📝 **Enhanced documentation** - Added GitHub workflow examples
- 🏗️ **Extended architecture** - GitHub API client with proper authentication
- 📦 **New dependency** - Added `node-fetch` for GitHub API calls
- 🔧 **Node.js requirement** - Updated to ≥20.0.0 for release tooling compatibility

### Technical Details
- GitHub backups stored as `projectName/backup.secenv` (human-readable structure)
- Local storage continues to use hashed project names for privacy
- **Comprehensive testing verified**:
  - All 6 CLI commands tested (backup, restore, export, import, push, pull)
  - 9 environment files successfully encrypted/decrypted
  - Cross-platform GitHub API integration working
  - Node.js 20+ compatibility confirmed (core features use APIs since Node 10.0.0)
- Configuration stored in platform-specific directories with existing security
- GitHub Actions CI/CD pipeline with automated releases

## [1.0.2] - 2025-08-17

### Fixed
- Export command examples in README

## [1.0.1] - 2025-08-17

### Added
- npx usage instructions to README

### Changed
- Removed unnecessary bloated content from README

## [1.0.0] - Initial Release

### Added
- 🔒 **Military-grade encryption** - AES-256-GCM with triple-layer PBKDF2 key derivation (650,000+ iterations)
- 🌍 **Cross-platform support** - Works on Windows, macOS, and Linux
- 📁 **Project isolation** - Each project has its own encrypted storage
- 🔄 **Backup & Restore** - Secure backup and restore of environment files
- 📤 **Import/Export** - Share encrypted environment files between machines
- 🛡️ **Strong password validation** - Enforces secure password requirements
- 📱 **CLI & Library** - Use as a command-line tool or programmatic library
- 🚀 **Auto-detection** - Automatically finds and handles all .env* files

### CLI Commands
- `secenv backup --key <password>` - Backup all environment files
- `secenv restore --key <password>` - Restore environment files
- `secenv export --output <file>` - Export backup to file
- `secenv import --key <password> <file>` - Import backup from file

### Security Features
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: Triple-layer PBKDF2 with 650,000+ total iterations
- **Salt**: 32-byte random salt per encryption
- **IV**: 16-byte random initialization vector per encryption
- **Authentication**: Built-in authentication tag prevents tampering
- **Password Requirements**: Minimum 12 characters with complexity requirements

### Storage
- **Windows**: `%APPDATA%\SecuredEnv`
- **macOS**: `~/Library/Application Support/SecuredEnv`
- **Linux**: `~/.config/securedenv`
- Binary format with XOR obfuscation
- Project-specific subdirectories using SHA256 hash

[1.2.0]: https://github.com/nainglynndw/securedenv/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/nainglynndw/securedenv/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/nainglynndw/securedenv/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/nainglynndw/securedenv/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/nainglynndw/securedenv/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/nainglynndw/securedenv/releases/tag/v1.0.0