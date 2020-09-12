import fs from "fs";
import { sep } from "path";
import { parsePath } from "./parsePath";
import { sleep } from "./sleep";

/**
 * Returns a Promise which resolves to an fs.Stats object when the provided
 * path exists.
 *
 * @param path A relative or absolute path
 */
export async function waitForPath(path: string): Promise<fs.Stats> {
  const pathSegments = parsePath(path);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fs.promises.stat(sep + pathSegments.join(sep));
    } catch (error: unknown) {
      // An ENOENT or ENOTDIR error is expected here and can be
      // safely ignored. It just means the path doesn't yet exist
      // and we should wait for it.
      if (!isErrnoException(error, ["ENOENT", "ENOTDIR"])) {
        throw error;
      }
    }

    await waitForNextPathChange(pathSegments);
  }
}

function waitForNextPathChange(pathSegments: string[]) {
  return new Promise((resolve, reject) => {
    const watchers: fs.FSWatcher[] = [];
    let pathChangeReported = false;
    let watchersClosed = false;

    for (let i = 0; i <= pathSegments.length; i++) {
      const partialPath = sep + pathSegments.slice(0, i).join(sep);

      try {
        const watcher = fs.watch(partialPath, reportPathChange);

        watcher.on("close", () => {
          if (pathChangeReported === false) {
            closeWatchers();
            reject(new Error("File watcher closed unexpectedly."));
          }
        });

        watcher.on("error", async (error) => {
          // On windows watching a path that no longer exists throws this EPERM
          // error. Really it just means something has changed and its safe to
          // ignore as long as another watcher picks up that something changed.
          if (isErrnoException(error, ["EPERM"])) {
            let tries = 0;

            while (!pathChangeReported && tries++ < 5) {
              await sleep(20);
            }

            if (pathChangeReported) {
              // We know this was caused by a path change so no need to report the error.
              return;
            }
          }

          closeWatchers();
          reject(error);
        });

        watchers.push(watcher);
      } catch (error: unknown) {
        if (isErrnoException(error, ["ENOENT", "ENOTDIR"])) {
          // The file was not found meaning we've watched as
          // much of the path as is presently possible.
          break;
        } else {
          throw error;
        }
      }
    }

    if (watchers.length === 0) {
      throw new Error(`
        Unexpected condition encountered. This should never happen
        but if it somehow does its better to explicitly error out here
        instead of letting the program hang indefinitely.
      `);
    }

    if (watchers.length === pathSegments.length + 1) {
      // We were able to attach watchers for the entire path.
      // This indicates that after fs.stat threw an ENOENT error
      // and before the watchers were attached the path was
      // created i.e. changed since fs.stat was run.
      reportPathChange();
    }

    function reportPathChange() {
      // Ensure we don't try to resolve this promise and do
      // clean up more than once.
      if (pathChangeReported === true) {
        return;
      }

      pathChangeReported = true;
      closeWatchers();
      resolve();
    }

    function closeWatchers() {
      if (watchersClosed) {
        return;
      }

      watchersClosed = true;
      watchers.forEach((watcher) => watcher.close());
    }
  });
}

function isErrnoException(error: unknown, codes: string[]) {
  return (
    error !== null &&
    typeof error === "object" &&
    codes.some((code) => code === (error as NodeJS.ErrnoException).code)
  );
}
