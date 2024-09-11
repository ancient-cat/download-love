import * as https from "node:https";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import axios from "axios";
import kleur from "kleur";

export type Platform = "win32" | "win64" | "macos";

export const loveReleasesBaseUrl =
  "https://github.com/love2d/love/releases/download";

function mkdir_p(directory_path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdir(directory_path, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export const get_download_urls = (version: string, platforms: Platform[]) => {
  return platforms.map(
    (platform) =>
      `${loveReleasesBaseUrl}/${version}/love-${version}-${platform}.zip`,
  );
};

// Check if file exists
function file_exists(filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.access(filepath, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });
}

// Download file using axios (handles redirects automatically)
async function download_file(url: string, dest: string): Promise<void> {
  const writer = fs.createWriteStream(dest);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

export const all_platforms: Platform[] = ["macos", "win32", "win64"];

// Download all files
export async function download_love(
  destination: string,
  version: string,
  platforms: Platform[] = [],
): Promise<readonly [error: Error | null, downloads: string[]]> {
  if (platforms.length === 0) {
    const build_platform = os.platform();
    console.log(
      kleur.gray(`Using current platform: ${kleur.blue(build_platform)}`),
    );
    if (build_platform === "win32") {
      platforms = ["win32"];
    } else if (build_platform === "darwin" || build_platform === "linux") {
      // i'm not actually sure if this is suitable
      platforms = ["macos"];
    }
  }

  const urls = get_download_urls(version, platforms);

  try {
    if (path.isAbsolute(destination)) {
      await mkdir_p(path.join(destination));
    } else {
      await mkdir_p(path.join(process.cwd(), destination));
    }

    let result: string[] = [];
    for (const url of urls) {
      const fileName = path.basename(url);
      const dest = path.join(destination, fileName);

      const exists = await file_exists(dest);
      if (exists) {
        result.push(dest);
        console.log(
          kleur.gray(
            `${kleur.underline(kleur.white(fileName))} already exists, skipping download.`,
          ),
        );
        continue;
      }

      console.log(`Downloading ${fileName}...`);
      await download_file(url, dest);
      result.push(dest);
      console.log(`${fileName} downloaded successfully!`);
    }

    if (urls.length === result.length) {
      console.log(kleur.green("All downloads complete!"));
    } else {
      console.log(kleur.cyan("Some downloads didn't complete:"));
      urls
        .filter((a) => !result.includes(a))
        .forEach((a) => {
          console.log(kleur.yellow("Not downloaded:"), "\t", a);
        });
    }
    return [null, result];
  } catch (err) {
    console.error("Error downloading files:", err);
    return [err as Error, []];
  }
}
