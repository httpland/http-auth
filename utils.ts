import { isString, timingSafeEqual as _timingSafeEqual } from "./deps.ts";

/** Header field name. */
export enum Field {
  Authorization = "authorization",
  WWWAuthenticate = "www-authenticate",
}

const encoder = new TextEncoder();

interface Hash {
  (data: BufferSource): BufferSource | Promise<BufferSource>;
}

const sha256: Hash = (data) => crypto.subtle.digest("sha-256", data);

export async function timingSafeEqual(
  left: BufferSource | string,
  right: BufferSource | string,
  hash?: Hash,
): Promise<boolean> {
  hash ??= sha256;
  left = isString(left) ? encoder.encode(left) : left;
  right = isString(right) ? encoder.encode(right) : right;

  const [hashLeft, hashRight] = await Promise.all([hash(left), hash(right)]);

  return _timingSafeEqual(hashLeft, hashRight);
}

export interface Authorization {
  readonly scheme: string;
  readonly token: string;
}

/**
 * Generate from `abnf.ts`.
 */
export const ReAuthentication =
  /^(?<scheme>(?:[A-Za-z0-9!#$%&'*+-.^_`|~])+)(?:(?:\x20)+(?<token>(?:[A-Za-z0-9-._~+/]+=*|(?:(?:[A-Za-z0-9!#$%&'*+-.^_`|~])+\s*=\s*(?:(?:[A-Za-z0-9!#$%&'*+-.^_`|~])+|\x22(?:\t|\x20|!|[\x23-\x5B]|[\x5D-\x7E]|[\x80-\xFF]|\\(?:\t|\x20|[\x21-\x7E]|[\x80-\xFF]))*\x22)(?:\s*,\s*(?:[A-Za-z0-9!#$%&'*+-.^_`|~])+\s*=\s*(?:(?:[A-Za-z0-9!#$%&'*+-.^_`|~])+|\x22(?:\t|\x20|!|[\x23-\x5B]|[\x5D-\x7E]|[\x80-\xFF]|\\(?:\t|\x20|[\x21-\x7E]|[\x80-\xFF]))*\x22))*)?)))?$/;

/** Parse string as authorization value.
 *
 * @throws {TypeError} If the input is invalid syntax
 */
export function parseAuthorization(input: string): Authorization {
  const result = input.match(ReAuthentication);

  if (
    !result ||
    !result.groups ||
    !result.groups.scheme
  ) throw TypeError("invalid syntax");

  const scheme = result.groups.scheme;
  const token = result.groups.token ?? "";

  return { scheme, token };
}

/** Whether the inputs same as case insensitive or not. */
export function equalsCaseInsensitive(left: string, right: string): boolean {
  return !left.localeCompare(right, undefined, { sensitivity: "base" });
}
