import { describe, expect, it, vi } from "vitest";
import { createDummyContact, getContacts } from "./api";
import { apiRequest } from "../../lib/api-client";

vi.mock("../../lib/api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("people api", () => {
  it("requests contacts", async () => {
    await getContacts();
    expect(apiRequest).toHaveBeenCalledWith("/people");
  });

  it("creates dummy contact", async () => {
    await createDummyContact({ name: "Alex" });
    expect(apiRequest).toHaveBeenCalledWith("/people/dummy", {
      method: "POST",
      body: { name: "Alex" },
    });
  });
});
