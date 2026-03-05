import fs from 'fs';
import path from 'path';

const docsDir = path.join(process.cwd(), 'docs');

const apiDocs = `
## API Reference

### Authentication

### POST /api/auth/login
Login with email and password.

### POST /api/auth/register
Register new user.

### GET /api/auth/google/callback
Google OAuth callback.

### Design

### GET /api/design-optimized
Get available design styles.

### POST /api/design-optimized
Generate transformed room design.
`;

function generateAPIDocs() {
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(docsDir, 'api.md'),
    apiDocs
  );
  
  console.log('✅ API docs generated in docs/api.md');
}

generateAPIDocs();
