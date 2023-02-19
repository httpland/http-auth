export function group(regExp: RegExp): RegExp {
  return new RegExp(`(?:${regExp.source})`);
}

export function either(...regexps: readonly RegExp[]): RegExp {
  const sources = regexps.map((regExp) => regExp.source);

  return new RegExp(sources.join("|"));
}

export function namedCapture(label: string, regExp: RegExp): RegExp {
  const patternStr = `(?<${label}>${regExp.source})`;

  return new RegExp(patternStr, regExp.flags);
}

export function suffix(input: string, regExp: RegExp): RegExp {
  return new RegExp(`(?:${regExp.source})${input}`, regExp.flags);
}

export function oneOrMore(regExp: RegExp): RegExp {
  return suffix("+", regExp);
}

export function zeroOrMore(regExp: RegExp): RegExp {
  return suffix("*", regExp);
}

export function sequence(...regExps: readonly RegExp[]): RegExp {
  const sources = regExps.reduce((acc, cur) => acc + cur.source, "");

  return new RegExp(sources);
}

export function exact(regExp: RegExp): RegExp {
  return new RegExp(`^${regExp.source}$`, regExp.flags);
}

export function optional(regExp: RegExp): RegExp {
  return new RegExp(`(?:${regExp.source})?`, regExp.flags);
}
