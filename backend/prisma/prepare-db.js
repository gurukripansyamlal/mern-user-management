const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = process.env.DATABASE_URL || '';
const isProd = process.env.NODE_ENV === 'production';

if (isProd || dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  console.log('🔄 Detected Production / PostgreSQL. Setting Prisma provider to "postgresql"...');
  schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema);
} else {
  console.log('ℹ️ Using SQLite for local development...');
  schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, schema);
}
