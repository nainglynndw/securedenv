#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');
const SecEnvCommands = require('../src/commands');

async function main() {
  try {
    const program = new Command();

    program
      .name('secenv')
      .description('Simple environment variable encryption for projects')
      .version(packageJson.version);

    // Backup command
    program
      .command('backup')
      .description('Backup all .env files in current project')
      .option('--key <password>', 'Encryption key/password')
      .option('--key-file <file>', 'Path to binary key file')
      .action(async (options) => {
        await SecEnvCommands.backup(options);
      });

    // Export command
    program
      .command('export')
      .description('Export backup file to current directory')
      .requiredOption('--output <file>', 'Output file name (e.g., backup.secenv)')
      .action(async (options) => {
        await SecEnvCommands.export(options);
      });

    // Restore command
    program
      .command('restore')
      .description('Restore .env files from internal backup')
      .option('--key <password>', 'Decryption key/password')
      .option('--key-file <file>', 'Path to binary key file')
      .action(async (options) => {
        await SecEnvCommands.restore(options);
      });

    // Import command
    program
      .command('import <file>')
      .description('Import backup file and restore .env files')
      .option('--key <password>', 'Decryption key/password')
      .option('--key-file <file>', 'Path to binary key file')
      .action(async (file, options) => {
        await SecEnvCommands.import(file, options);
      });

    // Config command
    program
      .command('config')
      .description('Configure GitHub integration')
      .option('--github-token <token>', 'Set GitHub personal access token')
      .option('--github-repo <repo>', 'Set GitHub repository (owner/repo)')
      .action(async (options) => {
        await SecEnvCommands.config(options);
      });

    // Push command
    program
      .command('push')
      .description('Push backup to GitHub repository')
      .option('--key <password>', 'Encryption key/password')
      .option('--key-file <file>', 'Path to binary key file')
      .action(async (options) => {
        await SecEnvCommands.push(options);
      });

    // Pull command
    program
      .command('pull')
      .description('Pull backup from GitHub repository')
      .option('--key <password>', 'Decryption key/password')
      .option('--key-file <file>', 'Path to binary key file')
      .action(async (options) => {
        await SecEnvCommands.pull(options);
      });

    // Generate key command
    program
      .command('generate-key')
      .description('Generate a new binary encryption key file')
      .requiredOption('--output <file>', 'Output key file path')
      .action(async (options) => {
        await SecEnvCommands.generateKey(options);
      });

    // Show help if no command provided
    if (process.argv.length <= 2) {
      program.help();
    }

    await program.parseAsync(process.argv);

  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    
    if (process.env.DEBUG) {
      console.error(chalk.gray(error.stack));
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main;