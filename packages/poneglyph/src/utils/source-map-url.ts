const innerRegex = /[#@] sourceMappingURL=([^\s'"]*)/;

const regex = RegExp(
  `${'(?:'
      + '/\\*'
      + '(?:\\s*\r?\n(?://)?)?'
      + '(?:'}${innerRegex.source})`
      + '\\s*'
      + '\\*/'
      + '|'
      + `//(?:${innerRegex.source})`
    + ')'
    + '\\s*',
);

export function getSourceMap(code: string): string | null {
  const match = regex.exec(code);
  return (match ? match[1] || match[2] || '' : null);
}

export function sourceMapExists(code: string): boolean {
  return regex.test(code);
}
