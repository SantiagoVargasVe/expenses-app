import { Test, TestingModule } from '@nestjs/testing';
import { DrizzleService } from '../database/drizzle.service';
import { DebtsService } from './debts.service';
import { TransactionsService } from '../transactions/transactions.service';
import type { Debt, Contact } from '../database/schema';

const createDrizzleMock = () => {
  const selectWhereMock = jest.fn();
  const selectFromMock = jest.fn(() => ({ where: selectWhereMock }));
  const selectMock = jest.fn(() => ({ from: selectFromMock }));

  const returningMock = jest.fn();
  const valuesMock = jest.fn(() => ({ returning: returningMock }));
  const insertMock = jest.fn(() => ({ values: valuesMock }));

  const updateReturningMock = jest.fn();
  const updateWhereMock = jest.fn(() => ({ returning: updateReturningMock }));
  const updateSetMock = jest.fn(() => ({ where: updateWhereMock }));
  const updateMock = jest.fn(() => ({ set: updateSetMock }));

  const transactionMock = jest.fn((callback: (tx: unknown) => unknown) =>
    callback({ select: selectMock, insert: insertMock, update: updateMock }),
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
    updateReturningMock,
  };
};

describe('DebtsService', () => {
  let service: DebtsService;
  let drizzleMock: ReturnType<typeof createDrizzleMock>;
  let transactionsService: { createTransaction: jest.Mock };

  beforeEach(async () => {
    drizzleMock = createDrizzleMock();
    transactionsService = {
      createTransaction: jest.fn().mockResolvedValue({ id: 'txn-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebtsService,
        { provide: DrizzleService, useValue: drizzleMock },
        { provide: TransactionsService, useValue: transactionsService },
      ],
    }).compile();

    service = module.get<DebtsService>(DebtsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a debt and logs event', async () => {
    const contact: Contact = {
      id: 'contact-1',
      userId: 'user-1',
      name: 'Alex',
      email: null,
      isDummy: true,
      createdAt: new Date('2024-01-01'),
    };

    const debt: Debt = {
      id: 'debt-1',
      ownerId: 'user-1',
      contactId: 'contact-1',
      direction: 'owed_by_me',
      totalAmount: '100.00',
      remainingAmount: '100.00',
      currency: 'COP',
      description: null,
      status: 'open',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    };

    drizzleMock.selectWhereMock.mockResolvedValueOnce([contact]);
    drizzleMock.returningMock.mockResolvedValueOnce([debt]);

    const result = await service.createDebt('user-1', {
      contactId: 'contact-1',
      direction: 'owed_by_me',
      amount: 100,
    });

    expect(result.id).toBe('debt-1');
    expect(drizzleMock.valuesMock).toHaveBeenCalled();
  });

  it('settles a debt and creates transaction', async () => {
    const debt: Debt = {
      id: 'debt-2',
      ownerId: 'user-1',
      contactId: 'contact-1',
      direction: 'owed_by_me',
      totalAmount: '200.00',
      remainingAmount: '200.00',
      currency: 'COP',
      description: null,
      status: 'open',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    };

    drizzleMock.selectWhereMock.mockResolvedValueOnce([debt]);
    drizzleMock.returningMock.mockResolvedValueOnce([
      {
        id: 'event-1',
        debtId: debt.id,
        type: 'settled',
        amount: '50.00',
        occurredAt: new Date('2024-01-03'),
        transactionId: 'txn-1',
        notes: null,
        createdAt: new Date('2024-01-03'),
      },
    ]);

    drizzleMock.updateReturningMock.mockResolvedValueOnce([debt]);

    const result = await service.settleDebt('user-1', 'debt-2', {
      amount: 50,
      accountId: 'acc-1',
    });

    expect(result.type).toBe('settled');
    expect(transactionsService.createTransaction).toHaveBeenCalled();
  });
});
