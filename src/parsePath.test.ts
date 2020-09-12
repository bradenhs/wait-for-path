import { sep } from "path";
import { parsePath } from "./parsePath";

describe("parsePath", () => {
  it("should parse simple absolute path", () => {
    const actual = parsePath("/test/test");
    const expected = ["test", "test"];

    expect(actual).toEqual(expected);
  });

  it("should work with platform specific path separators", () => {
    const actual = parsePath(`${sep}test${sep}test`);
    const expected = ["test", "test"];

    expect(actual).toEqual(expected);
  });

  it("should parse relative path", () => {
    const actual = parsePath("../test");
    const expected = [...process.cwd().split(sep).slice(1, -1), "test"];

    expect(actual).toEqual(expected);
  });
});
