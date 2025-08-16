# SecuredEnv Examples

This directory contains practical examples of how to use SecuredEnv as a library.

## Examples

### 1. Basic Usage (`basic-usage.js`)

Demonstrates the core functionality:
- Checking for existing backups
- Creating backups
- Restoring from backups
- Getting project information
- Password validation

```bash
cd examples
node basic-usage.js
```

### 2. Export/Import (`export-import.js`)

Shows how to share encrypted environment files:
- Exporting backups to portable files
- Importing backups from external sources
- Cross-machine/project sharing workflows

```bash
cd examples
node export-import.js
```

### 3. TypeScript Usage (`typescript-usage.ts`)

TypeScript example with proper type annotations:
- Type-safe SecuredEnv usage
- Error handling with types
- Advanced patterns and classes

```bash
cd examples
npx ts-node typescript-usage.ts
# or compile and run:
npx tsc typescript-usage.ts && node typescript-usage.js
```

## Running Examples

All examples are self-contained and will:
1. Create sample environment files if needed
2. Demonstrate the functionality
3. Clean up after themselves

### Prerequisites

Make sure SecuredEnv is installed:

```bash
# If running from the project directory
npm install

# If using published package
npm install securedenv
```

### Example Output

Each example provides detailed console output showing:
- ✅ Successful operations
- ❌ Errors and how to handle them
- 📁 File operations
- 🔐 Security validations
- 💡 Key learning points

## Integration Examples

### Express.js App

```javascript
const SecuredEnv = require('securedenv');
const express = require('express');

async function startApp() {
  // Restore environment before starting server
  try {
    await SecuredEnv.restore(process.env.ENV_PASSWORD);
    console.log('✅ Environment restored');
  } catch (error) {
    console.log('ℹ️  No backup found, using existing .env');
  }

  const app = express();
  // ... rest of your app
}
```

### Docker Deployment

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Restore environment during build
ARG ENV_PASSWORD
RUN npx secenv restore --key "$ENV_PASSWORD" || echo "No backup to restore"

CMD ["npm", "start"]
```

### GitHub Actions

```yaml
- name: Restore Environment
  run: |
    npm install -g securedenv
    secenv restore --key "${{ secrets.ENV_PASSWORD }}"
  env:
    ENV_PASSWORD: ${{ secrets.ENV_PASSWORD }}
```

## Best Practices

1. **Password Management**: Use strong passwords and store them securely
2. **File Cleanup**: Always clean up exported .secenv files after use
3. **Error Handling**: Wrap SecuredEnv calls in try/catch blocks
4. **TypeScript**: Use the provided type definitions for better development experience
5. **Testing**: Test backup/restore workflows in your CI/CD pipeline