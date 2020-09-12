import { ensureDir, rename, ensureFile, move, remove } from "fs-extra";
import { sleep } from "./sleep";
import { waitForPath } from "./waitForPath";
import fs from "fs";
import { sep } from "path";

describe("waitForPath", () => {
  // Clean up any artifacts of the last test before each test
  beforeEach(() => remove("./tmp"));

  // Remove tmp directory after test suite has finished
  afterAll(() => remove("./tmp"));

  it("should work with directory", async () => {
    const { tryGetResult } = createPathAwaiterUtil("./tmp/foo/bar");

    expect(await tryGetResult()).toBe(false);
    await ensureDir("./tmp/foo/bar");
    expect(await tryGetResult()).toBeInstanceOf(fs.Stats);
  });

  it("should work with file", async () => {
    const { tryGetResult } = createPathAwaiterUtil("./tmp/foo/bar");

    expect(await tryGetResult()).toBe(false);
    await ensureFile("./tmp/foo/bar");
    expect(await tryGetResult()).toBeInstanceOf(fs.Stats);
  });

  it("should work with absolute path", async () => {
    const { tryGetResult } = createPathAwaiterUtil(
      process.cwd() + "/tmp/foo/bar"
    );

    expect(await tryGetResult()).toBe(false);
    await ensureFile("./tmp/foo/bar");
    expect(await tryGetResult()).toBeInstanceOf(fs.Stats);
  });

  it("should work with relative path", async () => {
    const directoryName = process.cwd().split(sep).slice(-1);
    const { tryGetResult } = createPathAwaiterUtil(
      `../${directoryName}/tmp/foo/bar`
    );

    expect(await tryGetResult()).toBe(false);
    await ensureFile("./tmp/foo/bar");
    expect(await tryGetResult()).toBeInstanceOf(fs.Stats);
  });

  it("should work with path being modified while waiting", async () => {
    const { tryGetResult } = createPathAwaiterUtil("./tmp/foo/bar");

    expect(await tryGetResult()).toBe(false);
    await ensureDir("./tmp/foo");
    expect(await tryGetResult()).toBe(false);
    await remove("./tmp/foo");
    expect(await tryGetResult()).toBe(false);
    await ensureDir("./tmp/foo");
    expect(await tryGetResult()).toBe(false);
    await ensureDir("./tmp/foo/bar");
    expect(await tryGetResult()).toBeInstanceOf(fs.Stats);
  });

  it("should work when path already exists", async () => {
    await ensureDir("./tmp/foo/bar");
    const { tryGetResult } = createPathAwaiterUtil("./tmp/foo/bar");
    expect(await tryGetResult()).toBeInstanceOf(fs.Stats);
  });

  it("should work when moving files", async () => {
    const { tryGetResult } = createPathAwaiterUtil("./tmp/bar/foo/hi");
    await ensureDir("./tmp/foo/bar/hi");
    expect(await tryGetResult()).toBe(false);
    await move("./tmp/foo/bar", "./tmp/bar");
    expect(await tryGetResult()).toBe(false);
    await move("./tmp/bar/hi", "./tmp/foo/hi");
    expect(await tryGetResult()).toBe(false);
    await move("./tmp/foo", "./tmp/bar/foo");
    expect(await tryGetResult()).toBeInstanceOf(fs.Stats);
  });

  it("should work with renames", async () => {
    const { tryGetResult } = createPathAwaiterUtil("./tmp/foo");
    await ensureDir("./tmp/bar");
    expect(await tryGetResult()).toBe(false);
    await rename("./tmp/bar", "./tmp/foo");
    expect(await tryGetResult()).toBeInstanceOf(fs.Stats);
  });

  it.only("should work with a really long path", async () => {
    const { tryGetResult } = createPathAwaiterUtil(
      "./tmp/foo/bar/baz/hello/world"
    );
    await ensureDir("./tmp/foo/bar/baz/hello");
    expect(await tryGetResult()).toBe(false);
    await remove("./tmp/foo");
    expect(await tryGetResult()).toBe(false);
    await ensureFile("./tmp/foo/bar/baz/hello/world");
    expect(await tryGetResult()).toBeInstanceOf(fs.Stats);
  });
});

function createPathAwaiterUtil(path: string) {
  let error: unknown = null;
  let result: fs.Stats | false = false;

  waitForPath(path)
    .then((stats) => {
      result = stats;
    })
    .catch((e) => {
      error = e;
    });

  /**
   * The result of ensureDir or ensureFile may not be visible
   * immediately after they've finished but should be shortly
   * after. This utility will poll the result of waitForPath
   * for a small amount of time before returning that the
   * path still does not exist.
   */
  return {
    async tryGetResult() {
      let tries = 0;

      while (result === false && tries++ < 3) {
        await sleep(20);
      }

      if (error !== null) {
        throw error;
      }

      return result;
    },
  };
}
