const importService = require('../../services/import');
const fs = require('fs');
const path = require('path');

// Mock the database
jest.mock('../../models', () => ({
  EnergyReading: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
  Sequelize: {
    Op: {}
  }
}));

describe('Import Service - JSON Import Validation', () => {
  let db;

  beforeEach(() => {
    jest.clearAllMocks();
    db = require('../../models');
    
    // Create a test JSON file with invalid and valid records
    const testData = [
      {
        timestamp: '2025-12-31T23:59:59Z',
        location: 'EE',
        price_eur_mwh: 150.25
      },
      {
        timestamp: 'invalid-date',
        location: 'EE',
        price_eur_mwh: 100.50
      },
      {
        timestamp: '2025-12-31T23:59:59+02:00',
        location: 'EE',
        price_eur_mwh: 120.00
      },
      {
        timestamp: '2025-12-30T12:00:00',
        location: 'EE',
        price_eur_mwh: 110.00
      },
      {
        timestamp: '2025-12-31T23:59:59Z',
        location: 'EE',
        price_eur_mwh: 150.25
      }
    ];

    const testFilePath = path.join(__dirname, '../../energy_dump.json');
    fs.writeFileSync(testFilePath, JSON.stringify(testData));
  });

  afterEach(() => {
    const testFilePath = path.join(__dirname, '../../energy_dump.json');
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  it('should skip records with invalid ISO 8601 timestamps', async () => {
    db.EnergyReading.findOne.mockResolvedValue(null);
    db.EnergyReading.create.mockResolvedValue({});

    const result = await importService.importJSON();

    expect(result.skipped).toBeGreaterThan(0);
    expect(result.duplicates_detected).toBeDefined();
  });

  it('should detect duplicate records and not insert them', async () => {
    let callCount = 0;
    
    db.EnergyReading.findOne.mockImplementation(async ({ where }) => {
      // First call (index 0): not a duplicate
      if (callCount === 0) {
        callCount++;
        return null;
      }
      // Fourth call (index 3): also not a duplicate (missing timezone)
      if (callCount === 2) {
        callCount++;
        return null;
      }
      // Fifth call (index 4): duplicate of first record
      return { id: 1 };
    });

    db.EnergyReading.create.mockResolvedValue({});

    const result = await importService.importJSON();

    expect(result.duplicates_detected).toBeGreaterThan(0);
    expect(result.message).toBe('Import completed');
  });

  it('should return import summary with inserted, skipped, and duplicates_detected counts', async () => {
    db.EnergyReading.findOne.mockResolvedValue(null);
    db.EnergyReading.create.mockResolvedValue({});

    const result = await importService.importJSON();

    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('inserted');
    expect(result).toHaveProperty('skipped');
    expect(result).toHaveProperty('duplicates_detected');
    expect(result.message).toBe('Import completed');
  });

  it('should only accept ISO 8601 format with timezone information', async () => {
    const testData = [
      {
        timestamp: '2025-12-31T23:59:59Z',
        location: 'EE',
        price_eur_mwh: 150.25
      },
      {
        timestamp: '2025-12-31T23:59:59+02:00',
        location: 'EE',
        price_eur_mwh: 120.00
      },
      {
        timestamp: '2025-12-31T23:59:59-05:00',
        location: 'EE',
        price_eur_mwh: 130.00
      }
    ];

    const testFilePath = path.join(__dirname, '../../energy_dump.json');
    fs.writeFileSync(testFilePath, JSON.stringify(testData));

    db.EnergyReading.findOne.mockResolvedValue(null);
    db.EnergyReading.create.mockResolvedValue({});

    const result = await importService.importJSON();

    // All three should be valid ISO 8601 with timezone
    expect(result.inserted).toBe(3);
    expect(result.skipped).toBe(0);
  });
});
