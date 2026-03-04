import { Test, TestingModule } from '@nestjs/testing';
import { DrizzleService } from '../database/drizzle.service';
import { AccountsService } from './accounts.service';
import type { Account, CreditCardProfile } from '../database/schema';

const createDrizzleMock = () => {
  const selectWhereMock = jest.fn();
  const selectFromMock = jest.fn(() => ({ where: selectWhereMock }));
  const selectMock = jest.fn(() => ({ from: selectFromMock }));

  const returningMock = jest.fn();
  const valuesMock = jest.fn(() => ({ returning: returningMock }));
  const insertMock = jest.fn(() => ({ values: valuesMock }));

  const transactionMock = jest.fn((callback: (tx: unknown) => unknown) =>
    callback({ select: selectMock, insert: insertMock }),
  );

  return {
    db: {
      select: selectMock,
      insert: insertMock,
      transaction: transactionMock,
    },
    selectWhereMock,
    returningMock,
    valuesMock,
    transactionMock,
  };
};

describe('AccountsService', () => {
  let service: AccountsService;
  let drizzleMock: ReturnType<typeof createDrizzleMock>;

  beforeEach(async () => {
    drizzleMock = createDrizzleMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: DrizzleService, useValue: drizzleMock },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists accounts with credit card profiles', async () => {
    const accountRows: Account[] = [
      {
        id: 'acc-1',
        userId: 'user-1',
        name: 'Savings',
        type: 'savings',
        balance: '1500.00',
        currency: 'COP',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: 'acc-2',
        userId: 'user-1',
        name: 'Visa',
        type: 'credit_card',
        balance: '0',
        currency: 'COP',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-04'),
      },
    ];

    const creditCardRows: CreditCardProfile[] = [
      {
        accountId: 'acc-2',
        creditLimit: '5000.00',
        availableCredit: '5000.00',
        statementCutoffDay: 20,
        statementDueDay: 5,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-04'),
      },
    ];

    drizzleMock.selectWhereMock
      .mockResolvedValueOnce(accountRows)
      .mockResolvedValueOnce(creditCardRows);

    const result = await service.listAccounts('user-1');

    expect(result).toHaveLength(2);
    expect(result[1].creditCard?.availableCredit).toBe(5000);
  });

  it('creates a credit card account with profile', async () => {
    const createdAccount: Account = {
      id: 'acc-10',
      userId: 'user-1',
      name: 'Mastercard',
      type: 'credit_card',
      balance: '0',
      currency: 'COP',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
    };

    const createdProfile: CreditCardProfile = {
      accountId: 'acc-10',
      creditLimit: '8000.00',
      availableCredit: '8000.00',
      statementCutoffDay: 15,
      statementDueDay: 1,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
    };

    drizzleMock.returningMock
      .mockResolvedValueOnce([createdAccount])
      .mockResolvedValueOnce([createdProfile]);

    const result = await service.createAccount('user-1', {
      name: 'Mastercard',
      type: 'credit_card',
      creditLimit: 8000,
      statementCutoffDay: 15,
      statementDueDay: 1,
    });

    expect(result.creditCard?.creditLimit).toBe(8000);
    expect(result.type).toBe('credit_card');
  });
});
