import { Test, TestingModule } from '@nestjs/testing';
import { DrizzleService } from '../database/drizzle.service';
import { TransactionsService } from './transactions.service';
import type {
  Account,
  CreditCardProfile,
  CreditCardInstallmentPlan,
  Transaction,
} from '../database/schema';

const createDrizzleMock = () => {
  const selectWhereMock = jest.fn();
  const selectFromMock = jest.fn(() => ({ where: selectWhereMock }));
  const selectMock = jest.fn(() => ({ from: selectFromMock }));

  const returningMock = jest.fn();
  const valuesMock = jest.fn(() => ({ returning: returningMock }));
  const insertMock = jest.fn(() => ({ values: valuesMock }));

  const updateWhereMock = jest.fn();
  const updateSetMock = jest.fn(() => ({ where: updateWhereMock }));
  const updateMock = jest.fn(() => ({ set: updateSetMock }));

  const transactionMock = jest.fn((callback: (tx: unknown) => unknown) =>
    callback({
      select: selectMock,
      insert: insertMock,
      update: updateMock,
    }),
  );

  return {
    db: {
      select: selectMock,
      insert: insertMock,
      update: updateMock,
      transaction: transactionMock,
    },
    selectWhereMock,
    returningMock,
    valuesMock,
    updateSetMock,
  };
};

describe('TransactionsService', () => {
  let service: TransactionsService;
  let drizzleMock: ReturnType<typeof createDrizzleMock>;

  beforeEach(async () => {
    drizzleMock = createDrizzleMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: DrizzleService, useValue: drizzleMock },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates an income transaction and updates balance', async () => {
    const account: Account = {
      id: 'acc-1',
      userId: 'user-1',
      name: 'Savings',
      type: 'savings',
      balance: '1000.00',
      currency: 'COP',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const created: Transaction = {
      id: 'txn-1',
      userId: 'user-1',
      kind: 'income',
      amount: '500.00',
      accountId: 'acc-1',
      fromAccountId: null,
      toAccountId: null,
      categoryId: null,
      description: null,
      occurredAt: new Date('2024-01-03'),
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      deletedAt: null,
      reversedAt: null,
      reversalOfId: null,
      isReversal: false,
    };

    drizzleMock.selectWhereMock.mockResolvedValueOnce([account]);
    drizzleMock.selectWhereMock.mockResolvedValueOnce([]);
    drizzleMock.returningMock.mockResolvedValueOnce([created]);

    const result = await service.createTransaction('user-1', {
      kind: 'income',
      amount: 500,
      accountId: 'acc-1',
    });

    expect(result.amount).toBe(500);
    expect(drizzleMock.updateSetMock).toHaveBeenCalled();
  });

  it('creates a credit card expense and adjusts available credit', async () => {
    const account: Account = {
      id: 'acc-2',
      userId: 'user-1',
      name: 'Card',
      type: 'credit_card',
      balance: '0',
      currency: 'COP',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const profile: CreditCardProfile = {
      accountId: 'acc-2',
      creditLimit: '1000.00',
      availableCredit: '1000.00',
      statementCutoffDay: 20,
      statementDueDay: 5,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const created: Transaction = {
      id: 'txn-2',
      userId: 'user-1',
      kind: 'expense',
      amount: '200.00',
      accountId: 'acc-2',
      fromAccountId: null,
      toAccountId: null,
      categoryId: null,
      description: null,
      occurredAt: new Date('2024-01-03'),
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      deletedAt: null,
      reversedAt: null,
      reversalOfId: null,
      isReversal: false,
    };

    drizzleMock.selectWhereMock
      .mockResolvedValueOnce([account])
      .mockResolvedValueOnce([profile]);
    drizzleMock.returningMock.mockResolvedValueOnce([created]);

    const result = await service.createTransaction('user-1', {
      kind: 'expense',
      amount: 200,
      accountId: 'acc-2',
    });

    expect(result.kind).toBe('expense');
    expect(drizzleMock.updateSetMock).toHaveBeenCalled();
  });

  it('creates installment plan for credit card expense with installments', async () => {
    const account: Account = {
      id: 'acc-3',
      userId: 'user-1',
      name: 'Card',
      type: 'credit_card',
      balance: '0',
      currency: 'COP',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const profile: CreditCardProfile = {
      accountId: 'acc-3',
      creditLimit: '2000.00',
      availableCredit: '2000.00',
      statementCutoffDay: 20,
      statementDueDay: 5,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const created: Transaction = {
      id: 'txn-3',
      userId: 'user-1',
      kind: 'expense',
      amount: '600.00',
      accountId: 'acc-3',
      fromAccountId: null,
      toAccountId: null,
      categoryId: null,
      description: null,
      occurredAt: new Date('2024-01-03'),
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      deletedAt: null,
      reversedAt: null,
      reversalOfId: null,
      isReversal: false,
    };

    const plan: CreditCardInstallmentPlan = {
      id: 'plan-1',
      accountId: 'acc-3',
      transactionId: 'txn-3',
      totalAmount: '600.00',
      installmentsTotal: 3,
      installmentsRemaining: 3,
      status: 'active',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    };

    drizzleMock.selectWhereMock
      .mockResolvedValueOnce([account])
      .mockResolvedValueOnce([profile]);
    drizzleMock.returningMock
      .mockResolvedValueOnce([created])
      .mockResolvedValueOnce([plan]);

    const result = await service.createTransaction('user-1', {
      kind: 'expense',
      amount: 600,
      accountId: 'acc-3',
      installmentsTotal: 3,
    });

    expect(result.installmentPlanId).toBe('plan-1');
  });
});
