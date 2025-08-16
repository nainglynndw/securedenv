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
      .requiredOption('--key <password>', 'Encryption key/password')
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
      .requiredOption('--key <password>', 'Decryption key/password')
      .action(async (options) => {
        await SecEnvCommands.restore(options);
      });

    // Import command
    program
      .command('import <file>')
      .description('Import backup file and restore .env files')
      .requiredOption('--key <password>', 'Decryption key/password')
      .action(async (file, options) => {
        await SecEnvCommands.import(file, options);
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