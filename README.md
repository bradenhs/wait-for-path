<br/>
<br/>
<p align="center">
  <img src="https://raw.githubusercontent.com/bradenhs/wait-for-path/master/artwork/logo.svg" width="400" alt="Wait for Path"/>
</p>
<br/>
<br/>
<p align="center">
  <b>Efficiently wait for a path to exist (cross-platform)</b>
</p>
<br/>
<br/>

> 🚨 **Use at your own risk** 🚨 I'm not super committed to maintaining this package. If you
> want the `wait-for-path` package name please reach out. I would be happy to transfer ownership.

<br/>

# Usage

### CLI

```bash
npx wait-for-path [path] && echo "Path exists!"
```

or

```bash
npm install wait-for-path --global
```

```bash
wait-for-path [path] && echo "Path exists!"
```

### Programmatic

```bash
npm install wait-for-path
```

```ts
import { waitForPath } from "wait-for-path";

waitForPath("./foo/bar/baz").then(stat => {
  console.log(stat); // fs.Stat object
});
```

# Contributing

### How its Implemented

No polling. This library uses the `fs.watch` API Node.js provides which is an abstraction
over `inotify(7)` on Linux, `kqueue(2)` and `FSEvents` on MacOS, and `ReadDirectoryChangesW`
on Windows systems. Read more about it here in the official NodeJS documentation:
https://nodejs.org/docs/latest/api/fs.html#fs_caveats. Platforms which do not support
the `fs.watch` API at all will not work with this library. Eventually a fallback polling approach
could be implemented for those platforms.

`wait-for-path` attaches a listener for each segment of the path until it encounters a path segment
that does not exist. Whenever any of these watchers reports a change, all watchers are closed,
`fs.stat` is attempted on the full path and if the path still does not exist watchers are added
again starting at the root directory.

### Development

`npm install` - to install dependencies.

`npm test` - to run all tests. [CI is setup with GitHub actions](https://github.com/bradenhs/wait-for-path/actions) to run the tests against Windows, MacOS, and Ubuntu if you
want to do some cross platform testing and don't have access to each OS.

`npm run lint` - to run the linter.

`npm run build:lib` - to build the library version of the package.

`npm run build:cli` - to build the cli version of the package.

`npm run build` - to build both versions of the package.

### Creating Releases

This project has been configured with an automated release process controlled by GitHub actions
(the approach is copied almost exactly from [Type Route](https://github.com/typehero/type-route)). Anytime a
git tag is created through the GitHub releases UI the package will be published with a new version
corresponding to the tag created. All pushes to any branch will also automatically
be published to NPM and tagged with name of the branch the action was run against.

### Future Work

- Use something like `rollup` along with the `rollup-dts` plugin to ensure only the public API is
exposed via tooling to the user (as done in [Type Route](https://github.com/typehero/type-route)).
- Implement polling fallback mechanism for platforms that don't support the `fs.watch` API.
- Expand API to allow users to cancel the `waitForPath` promise and clean up any file system
watchers.
- Setup code coverage reporting.
- Consider more efficient implementation that does not involved reattaching watchers for the
entire path every time anything changes.
