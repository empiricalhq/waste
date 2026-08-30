import process from 'node:process';

const SERVER_STARTUP_DELAY_MS = 6000;
const TIMEOUT_MS = process.env.CI === 'true' ? 25_000 : 15_000;

const server = Bun.spawn(['bun', '--env-file=../../.env.test', 'src/cmd/server.ts'], {
  stderr: 'inherit',
  stdout: 'inherit',
});

await Bun.sleep(SERVER_STARTUP_DELAY_MS);

const tests = Bun.spawn(
  ['bun', '--env-file=../../.env.test', 'test', '--sequential', '--timeout', TIMEOUT_MS.toString()],
  {
    stderr: 'inherit',
    stdout: 'inherit',
  },
);

const code = await tests.exited;

try {
  server.kill();
} catch {
  // Cleanup can race with a server that has already exited.
}

process.exit(code ?? 1);
