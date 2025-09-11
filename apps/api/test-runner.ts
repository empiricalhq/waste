const server = Bun.spawn(['bun', '--env-file=../../.env.test', 'src/index.ts'], {
  stdout: 'inherit',
  stderr: 'inherit',
});

await Bun.sleep(1000);

const tests = Bun.spawn(['bun', '--env-file=../../.env.test', 'test', 'tests/*.test.ts'], {
  stdout: 'inherit',
  stderr: 'inherit',
});

const code = await tests.exited;
console.log(`Tests exited with code ${code}`);

try {
  server.kill();
} catch {}

process.exit(code ?? 1);
