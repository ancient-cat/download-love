import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const urls: string[] = [
  'https://github.com/love2d/love/releases/download/11.5/love-11.5-win64.zip',
  'https://github.com/love2d/love/releases/download/11.5/love-11.5-win32.zip',
  'https://github.com/love2d/love/releases/download/11.5/love-11.5-macos.zip'
];

// Check if file exists
function fileExists(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });
}

// Download file
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

// Download all files
async function downloadAll(): Promise<void> {
  try {
    for (const url of urls) {
      const fileName = path.basename(url);
      const dest = path.join(__dirname, fileName);

      const exists = await fileExists(dest);
      if (exists) {
        console.log(`${fileName} already exists, skipping download.`);
        continue;
      }

      console.log(`Downloading ${fileName}...`);
      await downloadFile(url, dest);
      console.log(`${fileName} downloaded successfully!`);
    }

    console.log('All downloads complete!');
  } catch (err) {
    console.error('Error downloading files:', err);
  }
}

downloadAll();
