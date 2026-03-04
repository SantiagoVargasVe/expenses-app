import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./api-client";

describe("apiRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retries after refreshing the session on 401", async () => {
    let protectedCallCount = 0;

    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const urlText = String(url);

      if (urlText.includes("/auth/refresh")) {
        return new Response(JSON.stringify({ user: { id: "u1", email: "a@b.com", role: "user" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (urlText.includes("/protected")) {
        protectedCallCount += 1;
        if (protectedCallCount === 1) {
          return new Response(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(null, { status: 404 });
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await apiRequest<{ ok: boolean }>("/protected");

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
