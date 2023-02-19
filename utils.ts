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
 * ```abnf
 * Authorization = credentials
 * credentials = auth-scheme [ 1*SP ( token68 / #auth-param ) ]
 * ```
 * @see https://www.rfc-editor.org/rfc/rfc9110.html#section-11.6.2 */
const ReAuthentication =
  /^(?<scheme>[A-Za-z0-9!#$%&'*+-.^_`|~]+)(?: +(?<token>[A-Za-z0-9-._~+/]+=*))?$/;

/** Parse string as authorization value.
 *
 * @throws {Error} If the input is invalid syntax
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
