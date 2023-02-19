import { assertEquals, assertThrows, describe, it } from "./_dev_deps.ts";
import {
  type Authorization,
  parseAuthorization,
  ReAuthentication,
} from "./utils.ts";
import { Regexp } from "./abnf.ts";

Deno.test("should equal generated regex", () => {
  assertEquals(ReAuthentication, Regexp);
});

describe("parseAuthorization", () => {
  it("should pass cases", () => {
    const table: [string, Authorization][] = [
      ["B", { scheme: "B", token: "" }],
      ["abc", { scheme: "abc", token: "" }],
      ["Basic ", { scheme: "Basic", token: "" }],
      ["Basic abc", { scheme: "Basic", token: "abc" }],
      ["Basic abc==", { scheme: "Basic", token: "abc==" }],
      ["Basic", { scheme: "Basic", token: "" }],
      ["Basic abc=a", { scheme: "Basic", token: "abc=a" }],
      [`Basic abc="a"`, { scheme: "Basic", token: `abc="a"` }],
      [`Basic realm="Secure ares", charset=UTF-8`, {
        scheme: "Basic",
        token: `realm="Secure ares", charset=UTF-8`,
      }],
      [`Basic   realm="Secure ares",  charset=UTF-8`, {
        scheme: "Basic",
        token: `realm="Secure ares",  charset=UTF-8`,
      }],
    ];

    table.forEach(([input, expected]) => {
      assertEquals(parseAuthorization(input), expected);
    });
  });

  it("should throw error when input is invalid syntax", () => {
    const table: string[] = [
      "",
      " ",
      "  ",
      " Basic",
      "  Basic",
      "Basic ab,c",
      "Basic abc ",
    ];

    table.forEach((input) => {
      assertThrows(() => parseAuthorization(input));
    });
  });
});
