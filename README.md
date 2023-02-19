# http-auth

HTTP authentication middleware framework for standard `Request` and `Response`.

Compliant with
[RFC 9110, 11 HTTP Authentication](https://www.rfc-editor.org/rfc/rfc9110.html#name-http-authentication).

## Middleware

For a definition of Universal HTTP middleware, see the
[http-middleware](https://github.com/httpland/http-middleware) project.

## What

Handles `Authorization` and `WWW-Authenticate` HTTP headers. Called before the
handler, it acts as a filter/guard for the handler.

You can focus solely on authenticate the integrity of the token.

More specifically:

- Secure parsing of the `Authorization` header
- Manage the HTTP Authentication header
- Control the handler

## Usage

You specify the Authenticate scheme and provide the authentication function for
token.

```ts
import auth from "https://deno.land/x/http_auth@$VERSION/mod.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.177.0/testing/mock.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";

const handler = spy(() => new Response());
const authenticate = spy(() => false);
const middleware = auth({ scheme: "<auth-scheme>", authenticate });
const response = await middleware(
  new Request("http://localhost", {
    headers: { authorization: "<auth-scheme> <token>" },
  }),
  handler,
);

assertSpyCalls(handler, 0);
assertSpyCall(authenticate, 0, { args: ["<token>"] });
assertEquals(response.status, 401);
assertEquals(response.headers.get("www-authenticate"), "<auth-scheme>");
```

## Authentication headers

It is helpful to know about HTTP authentication headers.

```http
Authorization: <auth-scheme> <token>
WWW-Authenticate: <auth-scheme> [*<auth-param>]
```

- auth-scheme - Authentication scheme. e.g. Basic
- token - Authentication token

## Authentication

Authentication is an object that defines an authentication type and
authentication method. It has the following structure:

```ts
interface Authentication {
  readonly scheme: string;
  readonly authenticate: Authenticate;
}

interface Authenticate {
  (token: string): boolean | Promise<boolean>;
}
```

The `scheme` represent `<auth-scheme>`.

The `authenticate` receives `<token>` from the `Authorization` header. It
interprets the token is valid or not.

## License

Copyright © 2023-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
