import { describe, expect, it, vi } from "vitest";
import { createCreditCard, getAccount, getAccounts } from "./api";
import { apiRequest } from "../../lib/api-client";

vi.mock("../../lib/api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("accounts api", () => {
  it("requests accounts list", async () => {
    await getAccounts();
    expect(apiRequest).toHaveBeenCalledWith("/accounts");
  });

  it("requests account detail", async () => {
    await getAccount("acc-1");
    expect(apiRequest).toHaveBeenCalledWith("/accounts/acc-1");
  });

  it("creates a credit card", async () => {
    await createCreditCard({
      name: "Visa",
      creditLimit: 5000,
      statementCutoffDay: 20,
      statementDueDay: 5,
    });

    expect(apiRequest).toHaveBeenCalledWith("/accounts", {
      method: "POST",
      body: {
        name: "Visa",
        creditLimit: 5000,
        statementCutoffDay: 20,
        statementDueDay: 5,
        type: "credit_card",
      },
    });
  });
});
