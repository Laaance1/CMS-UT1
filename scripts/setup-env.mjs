import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const template = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
const password = randomBytes(24).toString('hex');
const values = {
  POSTGRES_PASSWORD: password, DB_PASSWORD: password,
  ADMIN_PASSWORD: randomBytes(24).toString('hex'),
  DIRECTUS_KEY: randomBytes(24).toString('hex'),
  DIRECTUS_SECRET: randomBytes(32).toString('hex')
};
const output = template.replace(/^(\w+)=(.*)$/gm, (line, key) => key in values ? `${key}=${values[key]}` : line);
try {
  await writeFile(new URL('../.env', import.meta.url), output, { flag: 'wx', mode: 0o600 });
  console.log('Created .env with separate random database and administrator passwords. Edit ADMIN_EMAIL before first startup. Credentials were not printed.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('.env already exists; no credentials changed.');
}
