import {
  assert,
  assertSpyCall,
  assertSpyCalls,
  describe,
  equalsResponse,
  it,
  spy,
  Status,
} from "./_dev_deps.ts";
import auth from "./mod.ts";
import { Field } from "./utils.ts";

describe("auth", () => {
  it("should return unauthenticated response when the authorization header is none. The handler and authenticate should not call", async () => {
    const handler = spy(() => new Response());
    const authenticate = spy(() => true);

    const middleware = auth({
      scheme: "a",
      authenticate,
    });
    const response = await middleware(
      new Request("http://localhost"),
      handler,
    );

    assertSpyCalls(handler, 0);
    assertSpyCalls(authenticate, 0);
    assert(
      equalsResponse(
        response,
        new Response(null, {
          status: Status.Unauthorized,
          headers: {
            [Field.WWWAuthenticate]: "a",
          },
        }),
      ),
    );
  });

  it("should return unauthenticated response when the authorization header is invalid. The handler and authenticate should not call", async () => {
    const handler = spy(() => new Response());
    const authenticate = spy(() => true);

    const middleware = auth({
      scheme: "a",
      authenticate,
    });
    const response = await middleware(
      new Request("http://localhost", {
        headers: { [Field.Authorization]: "" },
      }),
      handler,
    );

    assertSpyCalls(handler, 0);
    assertSpyCalls(authenticate, 0);
    assert(
      equalsResponse(
        response,
        new Response(null, {
          status: Status.Unauthorized,
          headers: {
            [Field.WWWAuthenticate]: "a",
          },
        }),
      ),
    );
  });

  it("should return unauthenticated response when the authorization is false. The handler should not call", async () => {
    const handler = spy(() => new Response());
    const authenticate = spy(() => false);

    const middleware = auth({
      scheme: "a",
      authenticate: authenticate,
    });
    const response = await middleware(
      new Request("http://localhost", {
        headers: { [Field.Authorization]: "a" },
      }),
      handler,
    );

    assertSpyCalls(handler, 0);
    assertSpyCall(authenticate, 0, { args: [""] });

    assert(
      equalsResponse(
        response,
        new Response(null, {
          status: Status.Unauthorized,
          headers: {
            [Field.WWWAuthenticate]: "a",
          },
        }),
      ),
    );
  });

  it("should return handler response when the authorization is valid", async () => {
    const authenticate = spy(() => true);
    const handler = spy(() => new Response());

    const middleware = auth({
      scheme: "a",
      authenticate,
    });
    const response = await middleware(
      new Request("http://localhost", {
        headers: { [Field.Authorization]: "a   token" },
      }),
      handler,
    );

    assertSpyCall(authenticate, 0, { args: ["token"] });
    assertSpyCalls(handler, 1);
    assert(equalsResponse(
      response,
      new Response(null, {
        status: 200,
      }),
    ));
  });

  it("should return handler response when the authorization case insensitive scheme is same", async () => {
    const authenticate = spy(() => true);
    const handler = spy(() => new Response());

    const middleware = auth({
      scheme: "A",
      authenticate,
    });
    const response = await middleware(
      new Request("http://localhost", {
        headers: { [Field.Authorization]: "a   token" },
      }),
      handler,
    );

    assertSpyCall(authenticate, 0, { args: ["token"] });
    assertSpyCalls(handler, 1);
    assert(equalsResponse(
      response,
      new Response(null, {
        status: 200,
      }),
    ));
  });

  it("should return handler response when the authorization case insensitive scheme is same", async () => {
    const middleware = auth({
      scheme: "Basic",
      authenticate: () => false,
      params: {
        realm: `"Secure area"`,
      },
    });
    const response = await middleware(
      new Request("http://localhost"),
      () => new Response(),
    );

    assert(equalsResponse(
      response,
      new Response(null, {
        status: 401,
        headers: {
          "www-authenticate": `Basic realm="Secure area"`,
        },
      }),
    ));
  });
});
