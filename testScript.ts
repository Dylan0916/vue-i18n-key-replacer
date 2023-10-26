str
  .replace(/>([^<]+)<\//g, (matched, group) => {
    const matchedChinese = group.trim();

    console.log({ group, matchedChinese: matchedChinese });

    return matched;
  })
  .replace(/"([\u4e00-\u9fa5]+)"/g, (matched, group) => {
    const matchedChinese = group.trim();

    console.log({ group, matchedChinese: matchedChinese });

    return matched;
  });

function findNotReplaceText(str: string) {
  const regexAry = [
    />([^<|cons]+)<\//g,
    /"([\u4e00-\u9fa5]+)"/g,
    /'([\u4e00-\u9fa5]+[^']*)'/g,
  ];
  const resultSet = new Set<string>();

  for (const regex of regexAry) {
    let temp: RegExpExecArray | null = null;

    while ((temp = regex.exec(str)) !== null) {
      resultSet.add(temp[1].trim());
    }
  }

  return Array.from(resultSet).filter(Boolean);
}

console.log(findNotReplaceText(str));
