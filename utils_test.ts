import { assertEquals, assertThrows, describe, it } from "./_dev_deps.ts";
import { type Authorization, parseAuthorization } from "./utils.ts";

describe("parseAuthorization", () => {
  it("should pass cases", () => {
    const table: [string, Authorization][] = [
      ["Basic abc", { scheme: "Basic", token: "abc" }],
      ["Basic abc==", { scheme: "Basic", token: "abc==" }],
      ["Basic", { scheme: "Basic", token: "" }],
      ["abc", { scheme: "abc", token: "" }],
    ];

    table.forEach(([input, expected]) => {
      assertEquals(parseAuthorization(input), expected);
    });
  });

  it("should throw error when input is invalid syntax", () => {
    const table: string[] = [
      "",
      "Basic ",
      "Basic  ",
      " Basic",
      "  Basic",
      "Basic ab,c",
      "Basic abc ",
      "Basic abc=a",
    ];

    table.forEach((input) => {
      assertThrows(() => parseAuthorization(input));
    });
  });
});
