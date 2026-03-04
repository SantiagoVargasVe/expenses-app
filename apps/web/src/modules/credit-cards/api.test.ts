import { describe, expect, it, vi } from "vitest";
import {
  cancelInstallments,
  getInstallments,
  getStatement,
  prepayInstallments,
} from "./api";
import { apiRequest } from "../../lib/api-client";

vi.mock("../../lib/api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("credit cards api", () => {
  it("requests statement", async () => {
    await getStatement("acc-1");
    expect(apiRequest).toHaveBeenCalledWith("/credit-cards/acc-1/statement");
  });

  it("requests installments", async () => {
    await getInstallments("acc-1");
    expect(apiRequest).toHaveBeenCalledWith(
      "/credit-cards/acc-1/installments",
    );
  });

  it("prepays installments", async () => {
    await prepayInstallments("plan-1");
    expect(apiRequest).toHaveBeenCalledWith(
      "/credit-cards/installments/plan-1/prepay",
      { method: "POST" },
    );
  });

  it("cancels installments", async () => {
    await cancelInstallments("plan-1");
    expect(apiRequest).toHaveBeenCalledWith(
      "/credit-cards/installments/plan-1/cancel",
      { method: "POST" },
    );
  });
});
