import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const port = process.env.PORT;
const clientUrl = process.env.CLIENT_URL;

if (!port || !clientUrl) {
  throw new Error('PORT and CLIENT_URL must be defined in backend environment variables');
}

const backendHealthUrl = `http://localhost:${port}/api/health`;
const frontendJwksUrl = `${clientUrl}/api/auth/jwks`;

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url: string, timeoutMs = 35000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200 || res.status === 404) {
        return true;
      }
    } catch (e) {
      // server not up yet
    }
    await wait(1500);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function main(): Promise<void> {
  console.log('1. Starting Backend TypeScript API server on port ' + port + '...');
  const backend: ChildProcess = spawn('npx', ['tsx', 'index.ts'], {
    cwd: path.resolve(__dirname, '../..'),
    stdio: 'inherit',
    shell: true
  });

  console.log('2. Starting Frontend Next.js server on port 3000...');
  const frontend: ChildProcess = spawn('npx', ['next', 'start', '-p', '3000'], {
    cwd: path.resolve(__dirname, '../../../frontend'),
    stdio: 'inherit',
    shell: true
  });

  let e2eExitCode = 0;
  try {
    console.log('3. Waiting for servers to be ready...');
    await waitForServer(backendHealthUrl);
    console.log('[OK] Backend is ready!');
    await waitForServer(frontendJwksUrl);
    console.log('[OK] Frontend JWKS is ready!');

    console.log('\n4. Executing TypeScript End-to-End Test Suite...\n');
    const e2e: ChildProcess = spawn('npx', ['tsx', 'src/scripts/verifyE2E.ts'], {
      cwd: path.resolve(__dirname, '../..'),
      stdio: 'inherit',
      shell: true
    });

    await new Promise<void>((resolve, reject) => {
      e2e.on('close', (code) => {
        e2eExitCode = code ?? 0;
        if (code === 0) resolve();
        else reject(new Error(`E2E script exited with code ${code}`));
      });
    });

    console.log('\n[SUCCESS] ALL INTEGRATION TESTS PASSED!');
  } catch (err: any) {
    console.error('Test execution error:', err.message);
    process.exit(1);
  } finally {
    console.log('Shutting down servers...');
    try {
      if (backend.pid) spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t']);
      if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t']);
    } catch (e) { }
    process.exit(e2eExitCode);
  }
}

main();

