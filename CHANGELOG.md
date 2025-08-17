# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Technical Details
- GitHub backups stored as `projectName/backup.secenv` (human-readable structure)
- Local storage continues to use hashed project names for privacy
- Full round-trip testing verified (7 environment files, 4KB encrypted backup)
- Configuration stored in platform-specific directories with existing security

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

[1.1.0]: https://github.com/nainglynndw/securedenv/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/nainglynndw/securedenv/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/nainglynndw/securedenv/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/nainglynndw/securedenv/releases/tag/v1.0.0