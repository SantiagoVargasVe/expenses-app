import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { createHash } from 'crypto';
import { DrizzleService } from '../database/drizzle.service';
import type { User } from '../database/schema';
import { AuthService } from './auth.service';
import { BCRYPT_SALT_ROUNDS, DEFAULT_USER_ROLE } from './auth.constants';
import { RegisterDto } from './dto/register.dto';

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
    updateWhereMock,
    updateSetMock,
    transactionMock,
  };
};

describe('AuthService', () => {
  let service: AuthService;
  let drizzleMock: ReturnType<typeof createDrizzleMock>;
  let jwtSignSpy: jest.Mock;

  beforeEach(async () => {
    drizzleMock = createDrizzleMock();
    jwtSignSpy = jest.fn().mockResolvedValue('signed-token');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: { signAsync: jwtSignSpy } },
        { provide: DrizzleService, useValue: drizzleMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user and returns tokens with sanitized payload', async () => {
    drizzleMock.selectWhereMock.mockResolvedValueOnce([]);

    const createdUser: User = {
      id: 'user-1',
      email: 'new@example.com',
      password: 'hashed',
      role: DEFAULT_USER_ROLE,
    };

    drizzleMock.returningMock.mockResolvedValueOnce([createdUser]);

    const dto: RegisterDto = {
      email: 'new@example.com',
      password: 'password123',
    };

    const result = await service.register(dto);

    expect(result.accessToken).toBe('signed-token');
    expect(typeof result.refreshToken).toBe('string');
    expect(result.user).toEqual({
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    });

    const valuesArg =
      (
        drizzleMock.valuesMock.mock.calls as unknown as Array<[Partial<User>]>
      ).find((call) => call[0]?.email === dto.email)?.[0] ?? {};
    const { password: storedPassword, ...rest } = valuesArg;
    expect(storedPassword).not.toBe(dto.password);
    expect(rest).toEqual({ email: dto.email, role: DEFAULT_USER_ROLE });
  });

  it('validates user credentials with hashed password', async () => {
    const plainPassword = 'pass12345';
    const hashedPassword = await hash(plainPassword, BCRYPT_SALT_ROUNDS);

    drizzleMock.selectWhereMock
      .mockResolvedValueOnce([
        {
          id: 'u1',
          email: 'a@example.com',
          password: hashedPassword,
          role: DEFAULT_USER_ROLE,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'u1',
          email: 'a@example.com',
          password: hashedPassword,
          role: DEFAULT_USER_ROLE,
        },
      ]);

    const user = await service.validateUser('a@example.com', plainPassword);

    expect(user).toEqual({
      id: 'u1',
      email: 'a@example.com',
      role: DEFAULT_USER_ROLE,
    });
  });

  it('throws when password is invalid', async () => {
    const hashedPassword = await hash('correct', BCRYPT_SALT_ROUNDS);

    drizzleMock.selectWhereMock.mockResolvedValueOnce([
      {
        id: 'u2',
        email: 'b@example.com',
        password: hashedPassword,
        role: DEFAULT_USER_ROLE,
      },
    ]);

    await expect(
      service.validateUser('b@example.com', 'wrong'),
    ).rejects.toThrow('Invalid credentials');
  });

  it('refreshes a session and rotates the refresh token', async () => {
    const refreshToken = 'session-1.token';
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    jest
      .spyOn(
        service as unknown as { findSessionById: () => Promise<unknown> },
        'findSessionById',
      )
      .mockResolvedValueOnce({
        id: 'session-1',
        userId: 'user-1',
        tokenHash,
        revokedAt: null,
      });

    jest
      .spyOn(
        service as unknown as { findById: () => Promise<unknown> },
        'findById',
      )
      .mockResolvedValueOnce({
        id: 'user-1',
        email: 'refresh@example.com',
        password: 'hashed',
        role: DEFAULT_USER_ROLE,
      });

    const rotateSpy = jest
      .spyOn(
        service as unknown as { rotateSession: () => Promise<void> },
        'rotateSession',
      )
      .mockResolvedValueOnce(undefined);

    const result = await service.refreshSession(refreshToken);

    expect(result.accessToken).toBe('signed-token');
    expect(result.refreshToken).not.toBe(refreshToken);
    expect(result.user.email).toBe('refresh@example.com');
    expect(rotateSpy).toHaveBeenCalled();
  });

  it('revokes session when refresh token is reused', async () => {
    const refreshToken = 'session-1.token';
    const wrongHash = createHash('sha256').update('other-token').digest('hex');

    jest
      .spyOn(
        service as unknown as { findSessionById: () => Promise<unknown> },
        'findSessionById',
      )
      .mockResolvedValueOnce({
        id: 'session-1',
        userId: 'user-1',
        tokenHash: wrongHash,
        revokedAt: null,
      });

    const revokeSpy = jest
      .spyOn(
        service as unknown as { revokeSession: () => Promise<void> },
        'revokeSession',
      )
      .mockResolvedValueOnce(undefined);

    await expect(service.refreshSession(refreshToken)).rejects.toThrow(
      'Session revoked',
    );
    expect(revokeSpy).toHaveBeenCalledWith('session-1');
  });
});
