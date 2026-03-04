import { describe, expect, it, vi } from "vitest";
import { createDebt, getDebtHistory, getDebts, settleDebt } from "./api";
import { apiRequest } from "../../lib/api-client";

vi.mock("../../lib/api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("debts api", () => {
  it("requests debts", async () => {
    await getDebts();
    expect(apiRequest).toHaveBeenCalledWith("/debts");
  });

  it("creates debt", async () => {
    await createDebt({
      contactId: "contact-1",
      direction: "owed_by_me",
      amount: 100,
    });

    expect(apiRequest).toHaveBeenCalledWith("/debts", {
      method: "POST",
      body: {
        contactId: "contact-1",
        direction: "owed_by_me",
        amount: 100,
      },
    });
  });

  it("settles debt", async () => {
    await settleDebt("debt-1", { amount: 50, accountId: "acc-1" });
    expect(apiRequest).toHaveBeenCalledWith("/debts/debt-1/settle", {
      method: "POST",
      body: { amount: 50, accountId: "acc-1" },
    });
  });

  it("requests history", async () => {
    await getDebtHistory("debt-1");
    expect(apiRequest).toHaveBeenCalledWith("/debts/debt-1/history");
  });
});
