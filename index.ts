import {
  pagesDirPath,
  componentsDirPath,
  layoutsDirPath,
  composablesDirPath,
} from './constants';
import { replaceByPath, reverseObject } from './utils';
// @ts-ignore
import i18nJSON from './zh.json';

function replaceTextInTemplate(str: string) {
  const findTemplateRegex = /<template[^>]*>([\s\S]*?)<\/template>/;

  const replacer =
    (type: 'htmlContent' | 'htmlAttr') => (matched: string, group: string) => {
      const trimmedText = group.trim();
      const i18nKey = reversedI18nJSON[trimmedText];

      if (!i18nKey) return matched;

      const isHTML = type === 'htmlContent';

      return matched.replace(
        trimmedText,
        isHTML ? `{{ $t('${i18nKey}') }}` : `$t('${i18nKey}')`
      );
    };

  const transformSingleQuoteReplacer = (matched: string, group: string) => {
    const trimmedText = group.trim();
    const i18nKey = reversedI18nJSON[trimmedText];

    return i18nKey
      ? matched.replace(`'${trimmedText}'`, `t('${i18nKey}')`)
      : matched;
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

    if (!i18nKey) return matched;

    shouldInsertUseI18n = true;

    return matched.replace(`'${trimmedText}'`, `t('${i18nKey}')`);
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

function replaceVueFiles() {
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

function replaceComposables() {
  function replaceTextInScript(str: string) {
    const functionStartRegex =
      /export\s(default\s)?(async\s)?function\s.+\(\)\s*\{/;

    let shouldInsertUseI18n = false;

    const transformToI18nKeyReplacer = (matched: string, group: string) => {
      const trimmedText = group.trim();
      const i18nKey = reversedI18nJSON[trimmedText];

      if (!i18nKey) return matched;

      shouldInsertUseI18n = true;

      return matched.replace(`'${trimmedText}'`, `t('${i18nKey}')`);
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

  return replaceByPath(composablesDirPath, replaceCB);
}

const reversedI18nJSON = reverseObject(i18nJSON);

await Promise.all([replaceVueFiles(), replaceComposables()]);

console.log('==== DONE ====');
