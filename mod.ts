import { isString, type Middleware } from "./deps.ts";
import type { Authentication } from "./types.ts";
import { equalsCaseInsensitive, Field, parseAuthorization } from "./utils.ts";

/** Create authentication middleware with authorization.
 *
 * @example
 * ```ts
 * import auth from "https://deno.land/x/http_auth@$VERSION/mod.ts";
 * import {
 *   assertSpyCall,
 *   assertSpyCalls,
 *   spy,
 * } from "https://deno.land/std@0.177.0/testing/mock.ts";
 * import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
 *
 * const handler = spy(() => new Response());
 * const authenticate = spy(() => false);
 * const middleware = auth({ scheme: "<auth-scheme>", authenticate });
 * const response = await middleware(
 *   new Request("http://localhost", {
 *     headers: { authorization: "<auth-scheme> <token>" },
 *   }),
 *   handler,
 * );
 *
 * assertSpyCalls(handler, 0);
 * assertSpyCall(authenticate, 0, { args: ["<token>"] });
 * assertEquals(response.status, 401);
 * assertEquals(response.headers.get("www-authenticate"), "<auth-scheme>");
 * ```
 */
export default function auth(authentication: Authentication): Middleware {
  const authenticate = `${authentication.scheme}`;
  const headers = { [Field.WWWAuthenticate]: authenticate };
  const init: ResponseInit = { status: 401, headers };

  const unauth = (): Response => new Response(null, init);

  const authMiddleware: Middleware = async (request, next) => {
    const authorizationValue = request.headers.get(Field.Authorization);

    if (!isString(authorizationValue)) return unauth();

    try {
      const { scheme, token } = parseAuthorization(authorizationValue);

      // Case insensitive @see https://www.rfc-editor.org/rfc/rfc9110.html#section-11.1
      if (!equalsCaseInsensitive(authentication.scheme, scheme)) {
        return unauth();
      }

      const pass = await authentication.authenticate(token);

      if (pass) return next(request);

      return unauth();
    } catch {
      return unauth();
    }
  };

  return authMiddleware;
}
