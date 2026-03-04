import { describe, expect, it } from "vitest";
import { ApiError } from "./api-client";
import { getFieldErrors } from "./api-errors";

describe("getFieldErrors", () => {
  it("extracts mapped errors", () => {
    const error = new ApiError("Validation failed", 400, {
      errors: { email: "Invalid email" },
    });

    expect(getFieldErrors(error)).toEqual({ email: "Invalid email" });
  });
});
