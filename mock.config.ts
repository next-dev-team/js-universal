import { defineConfig } from '@liangskyli/mock';
import process from 'node:process';
import { loadEnv } from 'vite';

const env = loadEnv('dev-mock', process.cwd());
const port = parseInt(env.VITE_MOCK_APP_PORT);

export default defineConfig({
  port: port,
});
