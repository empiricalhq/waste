const server = Bun.spawn(
  ["bun", "src/index.ts"],
  {
    stdout: "inherit",
    stderr: "inherit",
    env: {
      ...process.env,
      BUN_ENV_FILE: "../../.env.test",
    },
    onExit(proc, exitCode, signalCode, error) {
      console.log(`Server exited with code ${exitCode}`);
    },
  }
);

await Bun.sleep(1000);

const tests = Bun.spawn(
  ["bun", "test", "tests/*.test.ts"],
  {
    stdout: "inherit",
    stderr: "inherit",
    env: {
      ...process.env,
      BUN_ENV_FILE: "../../.env.test",
    },
    onExit(proc, exitCode, signalCode, error) {
      console.log(`Tests exited with code ${exitCode}`);
      server.kill();
      process.exit(exitCode ?? 1);
    },
  }
);

await tests.exited;
