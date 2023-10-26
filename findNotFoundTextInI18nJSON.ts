import { getFilesPath, getFileContent } from './utils';
import {
  pagesDirPath,
  componentsDirPath,
  layoutsDirPath,
  composablesDirPath,
  constantsDirPath,
  middlewareDirPath,
  pluginsDirPath,
  storeDirPath,
  typesDirPath,
  utilsDirPath,
} from './constants';
import i18nJSON from './zh.json';

const collectorSet = new Set<string>();

function findNotReplaceText(str: string) {
  const regexAry = [
    />([^<|cons]+)<\//g,
    /"([\u4e00-\u9fa5]+)"/g,
    /'([\u4e00-\u9fa5]+[^']*)'/g,
  ];

  for (const regex of regexAry) {
    let temp: RegExpExecArray | null = null;

    while ((temp = regex.exec(str)) !== null) {
      collectorSet.add(temp[1].trim());
    }
  }
}

async function fundProcess(dirPath: string) {
  const filesPath = getFilesPath(dirPath);

  for (const filePath of filesPath) {
    const fileContent = await getFileContent(filePath);

    findNotReplaceText(fileContent);
  }
}

await Promise.all([
  fundProcess(pagesDirPath),
  fundProcess(componentsDirPath),
  fundProcess(layoutsDirPath),
  fundProcess(composablesDirPath),
  fundProcess(constantsDirPath),
  fundProcess(middlewareDirPath),
  fundProcess(pluginsDirPath),
  fundProcess(storeDirPath),
  fundProcess(typesDirPath),
  fundProcess(utilsDirPath),
]);

function sortOutCollector() {
  const i18nValuesSet = new Set(Object.values(i18nJSON));
  const ary = [...collectorSet].filter(Boolean);
  const hasAnyChinese = (text: string) => /[\u4e00-\u9fa5]+/.test(text);
  const result = ary.filter(
    (text) => !i18nValuesSet.has(text) && hasAnyChinese(text)
  );

  return result;
}

console.log(sortOutCollector());
