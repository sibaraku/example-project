const { isValidISO8601UTC, isValidDateRange, validateReadingParams } = require('../../utils/validation');

describe('Validation Utilities', () => {
  describe('isValidISO8601UTC', () => {
    it('should validate ISO 8601 timestamps with Z timezone', () => {
      expect(isValidISO8601UTC('2025-12-31T23:59:59Z')).toBe(true);
      expect(isValidISO8601UTC('2025-01-15T10:30:00Z')).toBe(true);
    });

    it('should validate ISO 8601 timestamps with +HH:mm timezone', () => {
      expect(isValidISO8601UTC('2025-12-31T23:59:59+02:00')).toBe(true);
      expect(isValidISO8601UTC('2025-01-15T10:30:00+05:30')).toBe(true);
    });

    it('should validate ISO 8601 timestamps with -HH:mm timezone', () => {
      expect(isValidISO8601UTC('2025-12-31T23:59:59-05:00')).toBe(true);
      expect(isValidISO8601UTC('2025-01-15T10:30:00-08:00')).toBe(true);
    });

    it('should validate ISO 8601 timestamps with milliseconds', () => {
      expect(isValidISO8601UTC('2025-12-31T23:59:59.123Z')).toBe(true);
      expect(isValidISO8601UTC('2025-01-15T10:30:00.456+02:00')).toBe(true);
    });

    it('should reject timestamps without timezone information', () => {
      expect(isValidISO8601UTC('2025-12-31T23:59:59')).toBe(false);
      expect(isValidISO8601UTC('2025-01-15T10:30:00')).toBe(false);
    });

    it('should reject invalid date strings', () => {
      expect(isValidISO8601UTC('invalid-date')).toBe(false);
      expect(isValidISO8601UTC('2025-13-01T10:30:00Z')).toBe(false);
      expect(isValidISO8601UTC('2025-12-32T10:30:00Z')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(isValidISO8601UTC(null)).toBe(false);
      expect(isValidISO8601UTC(undefined)).toBe(false);
      expect(isValidISO8601UTC('')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(isValidISO8601UTC(12345)).toBe(false);
      expect(isValidISO8601UTC({})).toBe(false);
      expect(isValidISO8601UTC([])).toBe(false);
    });
  });

  describe('isValidDateRange', () => {
    it('should return true when end is greater than start', () => {
      expect(isValidDateRange('2025-01-01T10:00:00Z', '2025-01-02T10:00:00Z')).toBe(true);
      expect(isValidDateRange('2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z')).toBe(true);
    });

    it('should return false when end equals start', () => {
      expect(isValidDateRange('2025-01-01T10:00:00Z', '2025-01-01T10:00:00Z')).toBe(false);
    });

    it('should return false when end is less than start', () => {
      expect(isValidDateRange('2025-12-31T10:00:00Z', '2025-01-01T10:00:00Z')).toBe(false);
    });
  });

  describe('validateReadingParams', () => {
    it('should validate correct parameters', () => {
      const result = validateReadingParams({
        start: '2025-01-01T00:00:00Z',
        end: '2025-12-31T23:59:59Z',
        location: 'EE'
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing start timestamp', () => {
      const result = validateReadingParams({
        end: '2025-12-31T23:59:59Z',
        location: 'EE'
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing start timestamp');
    });

    it('should reject invalid start timestamp format', () => {
      const result = validateReadingParams({
        start: '2025-01-01',
        end: '2025-12-31T23:59:59Z',
        location: 'EE'
      });

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid start timestamp');
    });

    it('should reject end less than start', () => {
      const result = validateReadingParams({
        start: '2025-12-31T23:59:59Z',
        end: '2025-01-01T00:00:00Z',
        location: 'EE'
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('End timestamp must be greater than start timestamp');
    });

    it('should reject missing location', () => {
      const result = validateReadingParams({
        start: '2025-01-01T00:00:00Z',
        end: '2025-12-31T23:59:59Z'
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing location parameter');
    });

    it('should accept both location and location[] formats', () => {
      const result1 = validateReadingParams({
        start: '2025-01-01T00:00:00Z',
        end: '2025-12-31T23:59:59Z',
        location: 'EE'
      });

      const result2 = validateReadingParams({
        start: '2025-01-01T00:00:00Z',
        end: '2025-12-31T23:59:59Z',
        'location[]': 'EE'
      });

      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(true);
    });
  });
});
