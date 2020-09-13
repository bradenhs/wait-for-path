import { normalize, sep, resolve } from "path";

/**
 * Normalizes the input path, converts it to an absolute path if
 * it is not already one, and returns and array of path segments.
 */
export function parsePath(path: string): string[] {
  // Since the leading part of the resolved path will be "/"
  // the first element of the array will always be an empty string
  // and we don't want to return an array where the first element
  // is an empty string.
  const [, ...pathSegments] = resolve(normalize(path)).split(sep);

  // Handle the case where the given path is "/"
  if (pathSegments.length === 1 && pathSegments[0] === "") {
    return [];
  }

  return pathSegments;
}
