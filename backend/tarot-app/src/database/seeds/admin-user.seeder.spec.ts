import { Repository } from 'typeorm';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import { seedAdminUser } from './admin-user.seeder';

describe('seedAdminUser', () => {
  let mockRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const input = {
    email: 'florzenavilla@gmail.com',
    password: 'TempPass123!',
    name: 'Flor',
  };

  beforeEach(() => {
    mockRepo = {
      findOne: jest.fn(),
      create: jest.fn((data) => data as User),
      save: jest.fn((user) => Promise.resolve({ id: 42, ...user } as User)),
    };
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('crea un admin nuevo cuando el email no existe', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    const result = await seedAdminUser(
      mockRepo as unknown as Repository<User>,
      input,
    );

    expect(result.action).toBe('created');
    expect(result.userId).toBe(42);

    const created = mockRepo.create.mock.calls[0][0] as Partial<User>;
    expect(created.email).toBe('florzenavilla@gmail.com');
    expect(created.roles).toEqual([UserRole.CONSUMER, UserRole.ADMIN]);
    expect(created.isAdmin).toBe(true);
    // La password se guarda hasheada, nunca en texto plano.
    expect(created.password).not.toBe(input.password);
    expect(typeof created.password).toBe('string');
  });

  it('normaliza el email a minúsculas y sin espacios', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await seedAdminUser(mockRepo as unknown as Repository<User>, {
      ...input,
      email: '  Flor.Zenavilla@Gmail.com  ',
    });

    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: { email: 'flor.zenavilla@gmail.com' },
    });
  });

  it('promueve a admin un usuario existente que no lo es (sin tocar la password)', async () => {
    const existing = {
      id: 7,
      email: input.email,
      password: 'hash-previo',
      roles: [UserRole.CONSUMER],
      isAdmin: false,
    } as User;
    mockRepo.findOne.mockResolvedValue(existing);

    const result = await seedAdminUser(
      mockRepo as unknown as Repository<User>,
      input,
    );

    expect(result.action).toBe('promoted');
    expect(result.userId).toBe(7);

    const saved = mockRepo.save.mock.calls[0][0] as User;
    expect(saved.roles).toContain(UserRole.ADMIN);
    expect(saved.roles).toContain(UserRole.CONSUMER);
    expect(saved.isAdmin).toBe(true);
    // No se re-hashea ni se cambia la password del usuario existente.
    expect(saved.password).toBe('hash-previo');
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('no hace nada si el usuario ya es admin', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 9,
      email: input.email,
      roles: [UserRole.CONSUMER, UserRole.ADMIN],
      isAdmin: true,
    } as User);

    const result = await seedAdminUser(
      mockRepo as unknown as Repository<User>,
      input,
    );

    expect(result.action).toBe('already-admin');
    expect(result.userId).toBe(9);
    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
