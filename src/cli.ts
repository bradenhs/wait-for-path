#!/usr/bin/env node

import { waitForPath } from "./waitForPath";

enum ExitCode {
  SUCCESS = 0,
  ERROR = 1,
}

main()
  .then(() => process.exit(ExitCode.SUCCESS))
  .catch((error) => {
    console.error(error);
    process.exit(ExitCode.ERROR);
  });

async function main() {
  const path = process.argv[2] as string | undefined;

  if (path === undefined) {
    throw "Usage: wait-for-path [path]";
  }

  await waitForPath(path);
}
