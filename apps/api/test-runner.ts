import process from 'node:process';

const SERVER_STARTUP_DELAY_MS = 6000;

const server = Bun.spawn(['bun', '--env-file=../../.env.test', 'src/cmd/server.ts'], {
  stdout: 'inherit',
  stderr: 'inherit',
});

await Bun.sleep(SERVER_STARTUP_DELAY_MS);

const tests = Bun.spawn(['bun', '--env-file=../../.env.test', 'test', '--sequential'], {
  stdout: 'inherit',
  stderr: 'inherit',
});

const code = await tests.exited;

try {
  server.kill();
} catch {
  // ignore errors if the server is already dead
}

process.exit(code ?? 1);
