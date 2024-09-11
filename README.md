# Download Love Executable(s)

Downloads the love2d executable. Likely to be used for packaging executables and pipelines.

## Install

```sh
npm install get-love --save
```

## Usage

```ts
import { download_love, all_platforms, } from "get-love2d";


// download love 11.5 for macos/linux, win32, win64
await download_love("./some/dir/", "11.5", all_platforms);

// download for current platform
await download_love("./some/dir/", "11.5");


// use the result to do more operations
const [err, downloads]: [Error|null, string[]] = await download_love("./some/dir/", "11.5");

if (err === null) {
    // copy, move, etc
    downloads.forEach( ... )
}

```
