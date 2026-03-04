import { Test, TestingModule } from '@nestjs/testing';
import { DrizzleService } from '../database/drizzle.service';
import { RecurringService } from './recurring.service';
import { TransactionsService } from '../transactions/transactions.service';
import type { RecurringRule, RecurringInstance } from '../database/schema';

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
    callback({ insert: insertMock, update: updateMock, select: selectMock }),
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

describe('RecurringService', () => {
  let service: RecurringService;
  let drizzleMock: ReturnType<typeof createDrizzleMock>;
  let transactionsService: { createTransaction: jest.Mock };

  beforeEach(async () => {
    drizzleMock = createDrizzleMock();
    transactionsService = {
      createTransaction: jest.fn().mockResolvedValue({ id: 'txn-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringService,
        { provide: DrizzleService, useValue: drizzleMock },
        { provide: TransactionsService, useValue: transactionsService },
      ],
    }).compile();

    service = module.get<RecurringService>(RecurringService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a recurring rule', async () => {
    const rule: RecurringRule = {
      id: 'rule-1',
      userId: 'user-1',
      name: 'Salary',
      type: 'auto_post',
      frequency: 'monthly',
      interval: 1,
      dayOfWeek: null,
      dayOfMonth: 1,
      kind: 'income',
      amount: '5000.00',
      accountId: 'acc-1',
      fromAccountId: null,
      toAccountId: null,
      categoryId: null,
      description: null,
      startDate: new Date('2024-01-01'),
      nextRunAt: new Date('2024-02-01'),
      lastRunAt: null,
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    drizzleMock.returningMock.mockResolvedValueOnce([rule]);

    const result = await service.createRule('user-1', {
      name: 'Salary',
      type: 'auto_post',
      frequency: 'monthly',
      dayOfMonth: 1,
      kind: 'income',
      amount: 5000,
      accountId: 'acc-1',
    });

    expect(result.id).toBe('rule-1');
    expect(drizzleMock.valuesMock).toHaveBeenCalled();
  });

  it('runs an auto post rule', async () => {
    const rule: RecurringRule = {
      id: 'rule-2',
      userId: 'user-1',
      name: 'Rent',
      type: 'auto_post',
      frequency: 'monthly',
      interval: 1,
      dayOfWeek: null,
      dayOfMonth: 5,
      kind: 'expense',
      amount: '1200.00',
      accountId: 'acc-1',
      fromAccountId: null,
      toAccountId: null,
      categoryId: null,
      description: 'Rent',
      startDate: new Date('2024-01-01'),
      nextRunAt: new Date('2024-02-05'),
      lastRunAt: null,
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    const instance: RecurringInstance = {
      id: 'inst-1',
      ruleId: rule.id,
      dueDate: rule.nextRunAt,
      status: 'posted',
      transactionId: null,
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-05'),
    };

    drizzleMock.selectWhereMock.mockResolvedValueOnce([rule]);
    drizzleMock.returningMock.mockResolvedValueOnce([instance]);

    const result = await service.runRule('user-1', 'rule-2');

    expect(result.status).toBe('posted');
    expect(transactionsService.createTransaction).toHaveBeenCalled();
  });
});
