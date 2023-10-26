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
