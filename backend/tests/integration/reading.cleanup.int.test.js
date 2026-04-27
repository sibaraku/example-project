const request = require('supertest');
const db = require('../../models');

// Mock the database module
jest.mock('../../models', () => ({
  EnergyReading: {
    destroy: jest.fn(),
  },
  Sequelize: {
    fn: jest.fn(),
    col: jest.fn(),
    Op: {
      between: Symbol('between'),
      in: Symbol('in')
    }
  },
  sequelize: {
    sync: jest.fn().mockResolvedValue()
  }
}));

// Create a simple test app
const express = require('express');
const app = express();
app.use(express.json());

const readingController = require('../../controllers/reading');

// Register routes
app.delete('/readings', readingController.deleteUploadedReadings);

// Add error handler
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'An error occurred. Please try again.';
  res.status(statusCode).json({ error: message });
});

describe('DELETE /readings - Cleanup Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete only UPLOAD records when source=UPLOAD is provided', async () => {
    db.EnergyReading.destroy.mockResolvedValue(5);

    const response = await request(app)
      .delete('/readings')
      .query({ source: 'UPLOAD' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Deleted 5 uploaded records.');
    expect(db.EnergyReading.destroy).toHaveBeenCalledWith({
      where: { source: 'UPLOAD' }
    });
  });

  it('should return "No UPLOAD records found" when no records are deleted', async () => {
    db.EnergyReading.destroy.mockResolvedValue(0);

    const response = await request(app)
      .delete('/readings')
      .query({ source: 'UPLOAD' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('No UPLOAD records found.');
  });

  it('should reject deletion when source parameter is not UPLOAD', async () => {
    const response = await request(app)
      .delete('/readings')
      .query({ source: 'API' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid request. Only UPLOAD records can be deleted.');
    expect(db.EnergyReading.destroy).not.toHaveBeenCalled();
  });

  it('should reject deletion when source parameter is missing', async () => {
    const response = await request(app)
      .delete('/readings');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid request. Only UPLOAD records can be deleted.');
    expect(db.EnergyReading.destroy).not.toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    db.EnergyReading.destroy.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app)
      .delete('/readings')
      .query({ source: 'UPLOAD' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Cleanup failed. Please try again.');
  });

  it('should return response message with count of deleted records', async () => {
    db.EnergyReading.destroy.mockResolvedValue(12);

    const response = await request(app)
      .delete('/readings')
      .query({ source: 'UPLOAD' });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/Deleted \d+ uploaded records\./);
    expect(response.body.message).toBe('Deleted 12 uploaded records.');
  });

  it('should not expose sensitive error information in response', async () => {
    const sensitiveError = new Error('Internal database error: connection failed to 192.168.1.1:3306');
    db.EnergyReading.destroy.mockRejectedValue(sensitiveError);

    const response = await request(app)
      .delete('/readings')
      .query({ source: 'UPLOAD' });

    expect(response.status).toBe(500);
    // Ensure the error message does not contain sensitive information
    expect(response.body.error).not.toContain('192.168.1.1');
    expect(response.body.error).not.toContain('3306');
    expect(response.body.error).toBe('Cleanup failed. Please try again.');
  });
});
