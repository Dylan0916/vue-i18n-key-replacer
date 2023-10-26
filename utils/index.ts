import fs from 'fs';

export function getFilesPath(dir: string, files: string[] = []) {
  const fileList = fs.readdirSync(dir);

  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFilesPath(name, files);
    } else {
      files.push(name);
    }
  }

  return files;
}

export function getFileContent(filePath: string) {
  return Bun.file(filePath).text();
}

export function reverseObject(object: Record<string, any>) {
  return Object.entries(object).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {} as Record<string, any>);
}

export async function replaceByPath(
  path: string,
  cb: (fileContent: string) => string
) {
  const filesPath = getFilesPath(path);

  for (const filePath of filesPath) {
    const fileContent = await getFileContent(filePath);
    const replacedText = cb(fileContent);

    Bun.write(filePath, replacedText);
  }
}
