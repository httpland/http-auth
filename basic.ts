import { parseUserPass, timingSafeEqual, type UserPass } from "./utils.ts";
import type { Authentication } from "./types.ts";

/** Map of username and password. */
export interface Users {
  readonly [k: string]: string;
}

export interface Options {
  /** Realm.
   * @default "Secure area"
   */
  readonly realm: string;
}

const DEFAULT_REALM = `Secure area`;
const SCHEME = "Basic";

/** HTTP Basic Authentication.
 *
 * @example
 * ```ts
 * import auth from "https://deno.land/x/http_auth@$VERSION/mod.ts";
 * import Basic from "https://deno.land/x/http_auth@$VERSION/basic.ts";
 * import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
 *
 * const middleware = auth(
 *   new Basic({ "<user-id>": "<password>", admin: "123456" }),
 * );
 * const response = await middleware(
 *   new Request("http://localhost"),
 *   () => new Response(),
 * );
 *
 * assertEquals(
 *   response.headers.get("www-authenticate"),
 *   `Basic realm="Secure aria"`,
 * );
 * ```
 */
export default class Basic implements Authentication {
  #users: UserPass[];
  #realm: string;

  constructor(users: Users, options?: Options) {
    const userList = Object.entries(users).map(([userId, password]) => ({
      userId,
      password,
    }));
    const { realm = DEFAULT_REALM } = options ?? {};

    this.#users = userList;
    this.#realm = realm;
  }

  scheme = SCHEME;

  async authenticate(token: string): Promise<boolean> {
    const b64Token = atob(token);

    try {
      const userPass = parseUserPass(b64Token);
      const settledResult = await Promise.allSettled(
        this.#users.map((user) => equalsUserPass(user, userPass)),
      );

      const result = settledResult.some((result) =>
        result.status === "fulfilled" && result.value
      );

      return result;
    } catch {
      return false;
    }
  }

  get params() {
    return {
      realm: this.#realm,
    };
  }
}

async function equalsUserPass(
  left: UserPass,
  right: UserPass,
): Promise<boolean> {
  const [isUserIdOk, isPasswordOk] = await Promise.all([
    timingSafeEqual(left.userId, right.userId),
    timingSafeEqual(left.password, right.password),
  ]);

  return isUserIdOk && isPasswordOk;
}
