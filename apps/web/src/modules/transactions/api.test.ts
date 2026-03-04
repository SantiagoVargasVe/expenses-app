import { describe, expect, it, vi } from "vitest";
import { createTransaction, getTransactions } from "./api";
import { apiRequest } from "../../lib/api-client";

vi.mock("../../lib/api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("transactions api", () => {
  it("requests transactions list", async () => {
    await getTransactions();
    expect(apiRequest).toHaveBeenCalledWith("/transactions");
  });

  it("creates a transaction", async () => {
    await createTransaction({
      kind: "income",
      amount: 1200,
      accountId: "acc-1",
      description: "Salary",
    });

    expect(apiRequest).toHaveBeenCalledWith("/transactions", {
      method: "POST",
      body: {
        kind: "income",
        amount: 1200,
        accountId: "acc-1",
        description: "Salary",
      },
    });
  });
});
