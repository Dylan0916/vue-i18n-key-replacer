import fs from 'fs';

// @ts-ignore
import i18nJSON from './zh.json';

function getFilesPath(dir: string, files: string[] = []) {
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

function getFileContent(filePath: string) {
  return Bun.file(filePath).text();
}

function reverseObject(object: Record<string, any>) {
  return Object.entries(object).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {} as Record<string, any>);
}

function replaceTextInTemplate(str: string) {
  const findTemplateRegex = /<template[^>]*>([\s\S]*?)<\/template>/;

  const replacer =
    (type: 'htmlContent' | 'htmlAttr') => (matched: string, group: string) => {
      const trimmedText = group.trim();
      const i18nKey = reversedI18nJSON[trimmedText];

      if (notFoundTextCollectorSet.has(trimmedText)) {
        notFoundTextCollectorSet.delete(trimmedText);
      }

      if (i18nKey) {
        const isHTML = type === 'htmlContent';

        return matched.replace(
          trimmedText,
          isHTML ? `{{ $t('${i18nKey}') }}` : `$t('${i18nKey}')`
        );
      }

      notFoundTextCollectorSet.add(trimmedText);

      return matched;
    };

  const transformSingleQuoteReplacer = (matched: string, group: string) => {
    const trimmedText = group.trim();
    const i18nKey = reversedI18nJSON[trimmedText];

    if (notFoundTextCollectorSet.has(trimmedText)) {
      notFoundTextCollectorSet.delete(trimmedText);
    }

    if (i18nKey) {
      return matched.replace(`'${trimmedText}'`, `t('${i18nKey}')`);
    }

    notFoundTextCollectorSet.add(trimmedText);

    return matched;
  };

  return str.replace(findTemplateRegex, (matchedScriptContent) => {
    return (
      matchedScriptContent
        .replace(/>([^<]+)<\//g, replacer('htmlContent'))
        //   @FIXME: need to add v-bind before attr
        .replace(/"([\u4e00-\u9fa5]+)"/g, replacer('htmlAttr'))
        .replace(/'([\u4e00-\u9fa5]+[^']*)'/g, transformSingleQuoteReplacer)
    );
  });
}

function replaceTextInScript(str: string) {
  const findScriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/;
  let shouldInsertUseI18n = false;

  const transformToI18nKeyReplacer = (matched: string, group: string) => {
    const trimmedText = group.trim();
    const i18nKey = reversedI18nJSON[trimmedText];

    if (notFoundTextCollectorSet.has(trimmedText)) {
      notFoundTextCollectorSet.delete(trimmedText);
    }

    if (i18nKey) {
      shouldInsertUseI18n = true;

      return matched.replace(`'${trimmedText}'`, `t('${i18nKey}')`);
    }

    notFoundTextCollectorSet.add(trimmedText);

    return matched;
  };

  const insertUseI18nReplacer = (matched: string) => {
    return shouldInsertUseI18n
      ? `${matched}\nconst { t } = useI18n();`
      : matched;
  };

  return str.replace(findScriptRegex, (matchedScriptContent) => {
    return matchedScriptContent
      .replace(/'([\u4e00-\u9fa5]+)'/g, transformToI18nKeyReplacer)
      .replace(/<script.+>/, insertUseI18nReplacer);
  });
}

async function replaceByPath(
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

function replaceVueFiles(rootDir: string) {
  const pagesDirPath = `${rootDir}/src/pages`;
  const componentsDirPath = `${rootDir}/src/components`;
  const layoutsDirPath = `${rootDir}/src/layouts`;

  const replaceCB = (fileContent: string) => {
    const replacedText = replaceTextInScript(
      replaceTextInTemplate(fileContent)
    );

    return replacedText;
  };

  return Promise.all([
    replaceByPath(pagesDirPath, replaceCB),
    replaceByPath(componentsDirPath, replaceCB),
    replaceByPath(layoutsDirPath, replaceCB),
  ]);
}

function replaceComposables(rootDir: string) {
  function replaceTextInScript(str: string) {
    const functionStartRegex =
      /export\s(default\s)?(async\s)?function\s.+\(\)\s*\{/;

    let shouldInsertUseI18n = false;

    const transformToI18nKeyReplacer = (matched: string, group: string) => {
      const trimmedText = group.trim();
      const i18nKey = reversedI18nJSON[trimmedText];

      if (notFoundTextCollectorSet.has(trimmedText)) {
        notFoundTextCollectorSet.delete(trimmedText);
      }

      if (i18nKey) {
        shouldInsertUseI18n = true;

        return matched.replace(`'${trimmedText}'`, `t('${i18nKey}')`);
      }

      notFoundTextCollectorSet.add(trimmedText);

      return matched;
    };

    const insertUseI18nReplacer = (matched: string) => {
      return shouldInsertUseI18n
        ? `${matched}\n  const { t } = useI18n();`
        : matched;
    };

    return str
      .replace(/'([\u4e00-\u9fa5]+)'/g, transformToI18nKeyReplacer)
      .replace(functionStartRegex, insertUseI18nReplacer);
  }

  const replaceCB = (fileContent: string) => {
    return replaceTextInScript(fileContent);
  };

  return replaceByPath(`${rootDir}/src/composables`, replaceCB);
}

const notFoundTextCollectorSet = new Set<string>();
const reversedI18nJSON = reverseObject(i18nJSON);
const FUNNOW_NICEDAY_DIR_PATH = '../../funnow/niceday.web';
const TEST_DIR_PATH = '.';

await Promise.all([
  replaceVueFiles(TEST_DIR_PATH),
  replaceComposables(TEST_DIR_PATH),
]);

console.log(notFoundTextCollectorSet);
console.log('==== DONE ====');
