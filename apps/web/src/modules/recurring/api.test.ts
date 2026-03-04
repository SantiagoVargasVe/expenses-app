import { describe, expect, it, vi } from "vitest";
import {
  createRecurringRule,
  getRecurringRules,
  markRecurringPaid,
  runRecurringRule,
  updateRecurringRule,
} from "./api";
import { apiRequest } from "../../lib/api-client";

vi.mock("../../lib/api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("recurring api", () => {
  it("requests recurring list", async () => {
    await getRecurringRules();
    expect(apiRequest).toHaveBeenCalledWith("/recurring");
  });

  it("creates recurring rule", async () => {
    await createRecurringRule({
      name: "Rent",
      type: "auto_post",
      frequency: "monthly",
      dayOfMonth: 1,
      kind: "expense",
      amount: 1000,
      accountId: "acc-1",
    });

    expect(apiRequest).toHaveBeenCalledWith("/recurring", {
      method: "POST",
      body: {
        name: "Rent",
        type: "auto_post",
        frequency: "monthly",
        dayOfMonth: 1,
        kind: "expense",
        amount: 1000,
        accountId: "acc-1",
      },
    });
  });

  it("updates recurring rule", async () => {
    await updateRecurringRule("rule-1", { status: "paused" });
    expect(apiRequest).toHaveBeenCalledWith("/recurring/rule-1", {
      method: "PATCH",
      body: { status: "paused" },
    });
  });

  it("runs recurring rule", async () => {
    await runRecurringRule("rule-1");
    expect(apiRequest).toHaveBeenCalledWith("/recurring/rule-1/run", {
      method: "POST",
    });
  });

  it("marks recurring paid", async () => {
    await markRecurringPaid("rule-1");
    expect(apiRequest).toHaveBeenCalledWith("/recurring/rule-1/mark-paid", {
      method: "POST",
    });
  });
});
