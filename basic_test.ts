import Basic from "./basic.ts";
import { assert, assertEquals, describe, it } from "./_dev_deps.ts";

describe("Basic", () => {
  it("should contain property", () => {
    const basic = new Basic({});

    assertEquals(basic.scheme, "Basic");
    assertEquals(basic.params, { realm: "Secure area" });
  });

  it("should change realm", () => {
    const basic = new Basic({}, { realm: "area" });

    assertEquals(basic.params, { realm: "area" });
  });

  it("should return true when the user pass matched", async () => {
    const basic = new Basic({ admin: "123456" });

    assert(await basic.authenticate(btoa("admin:123456")));
  });

  it("should return false when the user pass matched", async () => {
    const basic = new Basic({ admin: "1234567" });

    assert(!await basic.authenticate(btoa("admin:123456")));
  });

  it("should return true when the users pass matched", async () => {
    const basic = new Basic({ user1: "1", user2: "2", user3: "3" });

    assert(await basic.authenticate(btoa("user2:2")));
  });

  it("should return false when the users pass does not match", async () => {
    const basic = new Basic({ user1: "1", user2: "2", user3: "3" });

    assert(!await basic.authenticate(btoa("user4:2")));
  });
});
