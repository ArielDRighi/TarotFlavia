import { DataSource, Repository } from 'typeorm';
import { seedPendulumInterpretations } from './pendulum-interpretations.seeder';
import { PendulumInterpretation } from '../../modules/pendulum/entities/pendulum-interpretation.entity';
import { PendulumResponse } from '../../modules/pendulum/domain/enums/pendulum.enums';

describe('Pendulum Interpretations Seeder', () => {
  let dataSource: DataSource;
  let interpretationRepository: Repository<PendulumInterpretation>;

  beforeEach(() => {
    interpretationRepository = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<PendulumInterpretation>;

    dataSource = {
      getRepository: jest.fn().mockReturnValue(interpretationRepository),
    } as unknown as DataSource;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should seed exactly 30 interpretations when database is empty', async () => {
    // Mock empty database
    (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

    // Mock create to return the entity
    (interpretationRepository.create as jest.Mock).mockImplementation(
      (data: Partial<PendulumInterpretation>) => data as PendulumInterpretation,
    );

    // Mock save to return the entities
    (interpretationRepository.save as jest.Mock).mockImplementation(
      (entities: PendulumInterpretation[]) => Promise.resolve(entities),
    );

    // Spy on console.log
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Execute seeder
    await seedPendulumInterpretations(dataSource);

    // Verify repository methods were called
    expect(dataSource.getRepository).toHaveBeenCalledWith(
      PendulumInterpretation,
    );
    expect(interpretationRepository.count).toHaveBeenCalledTimes(1);
    expect(interpretationRepository.create).toHaveBeenCalledTimes(30);
    expect(interpretationRepository.save).toHaveBeenCalledTimes(1);

    // Verify save was called with 30 interpretations
    const savedInterpretations = (interpretationRepository.save as jest.Mock)
      .mock.calls[0][0];
    expect(savedInterpretations).toHaveLength(30);

    // Verify console output
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '🔮 Starting Pendulum Interpretations seeding process...',
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '💾 Inserting 30 pendulum interpretations...',
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '✅ Successfully seeded 30 pendulum interpretations',
    );

    consoleLogSpy.mockRestore();
  });

  it('should seed interpretations with correct distribution (10 YES, 10 NO, 10 MAYBE)', async () => {
    (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

    const createdInterpretations: PendulumInterpretation[] = [];
    (interpretationRepository.create as jest.Mock).mockImplementation(
      (data: Partial<PendulumInterpretation>) => {
        const interpretation = data as PendulumInterpretation;
        createdInterpretations.push(interpretation);
        return interpretation;
      },
    );

    (interpretationRepository.save as jest.Mock).mockImplementation(
      (entities: PendulumInterpretation[]) => Promise.resolve(entities),
    );

    jest.spyOn(console, 'log').mockImplementation();

    await seedPendulumInterpretations(dataSource);

    // Count interpretations by response type
    const yesCount = createdInterpretations.filter(
      (i) => i.responseType === PendulumResponse.YES,
    ).length;
    const noCount = createdInterpretations.filter(
      (i) => i.responseType === PendulumResponse.NO,
    ).length;
    const maybeCount = createdInterpretations.filter(
      (i) => i.responseType === PendulumResponse.MAYBE,
    ).length;

    // Verify distribution
    expect(yesCount).toBe(10);
    expect(noCount).toBe(10);
    expect(maybeCount).toBe(10);
  });

  it('should create all interpretations with isActive: true', async () => {
    (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

    const createdInterpretations: PendulumInterpretation[] = [];
    (interpretationRepository.create as jest.Mock).mockImplementation(
      (data: Partial<PendulumInterpretation>) => {
        const interpretation = data as PendulumInterpretation;
        createdInterpretations.push(interpretation);
        return interpretation;
      },
    );

    (interpretationRepository.save as jest.Mock).mockImplementation(
      (entities: PendulumInterpretation[]) => Promise.resolve(entities),
    );

    jest.spyOn(console, 'log').mockImplementation();

    await seedPendulumInterpretations(dataSource);

    // Verify all interpretations are active
    expect(createdInterpretations.every((i) => i.isActive === true)).toBe(true);
    expect(createdInterpretations).toHaveLength(30);
  });

  it('should skip seeding when interpretations already exist (idempotency)', async () => {
    // Mock existing interpretations
    (interpretationRepository.count as jest.Mock).mockResolvedValue(30);

    // Spy on console.log
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Execute seeder
    await seedPendulumInterpretations(dataSource);

    // Verify only count was called, no create or save
    expect(interpretationRepository.count).toHaveBeenCalledTimes(1);
    expect(interpretationRepository.create).not.toHaveBeenCalled();
    expect(interpretationRepository.save).not.toHaveBeenCalled();

    // Verify skip message
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Pendulum interpretations already seeded'),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('found 30 interpretation(s)'),
    );

    consoleLogSpy.mockRestore();
  });

  it('should create interpretations with valid text content', async () => {
    (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

    const createdInterpretations: PendulumInterpretation[] = [];
    (interpretationRepository.create as jest.Mock).mockImplementation(
      (data: Partial<PendulumInterpretation>) => {
        const interpretation = data as PendulumInterpretation;
        createdInterpretations.push(interpretation);
        return interpretation;
      },
    );

    (interpretationRepository.save as jest.Mock).mockImplementation(
      (entities: PendulumInterpretation[]) => Promise.resolve(entities),
    );

    jest.spyOn(console, 'log').mockImplementation();

    await seedPendulumInterpretations(dataSource);

    // Verify all interpretations have non-empty text
    expect(createdInterpretations.every((i) => i.text.length > 0)).toBe(true);

    // Verify all texts are different (no duplicates)
    const uniqueTexts = new Set(createdInterpretations.map((i) => i.text));
    expect(uniqueTexts.size).toBe(30);
  });

  it('should create interpretations with valid response types', async () => {
    (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

    const createdInterpretations: PendulumInterpretation[] = [];
    (interpretationRepository.create as jest.Mock).mockImplementation(
      (data: Partial<PendulumInterpretation>) => {
        const interpretation = data as PendulumInterpretation;
        createdInterpretations.push(interpretation);
        return interpretation;
      },
    );

    (interpretationRepository.save as jest.Mock).mockImplementation(
      (entities: PendulumInterpretation[]) => Promise.resolve(entities),
    );

    jest.spyOn(console, 'log').mockImplementation();

    await seedPendulumInterpretations(dataSource);

    // Verify all interpretations have valid response types
    const validResponseTypes = [
      PendulumResponse.YES,
      PendulumResponse.NO,
      PendulumResponse.MAYBE,
    ];

    expect(
      createdInterpretations.every((i) =>
        validResponseTypes.includes(i.responseType),
      ),
    ).toBe(true);
  });
});
