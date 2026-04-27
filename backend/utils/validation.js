/**
 * Validates ISO 8601 UTC timestamp format with timezone information
 * @param {string} timestamp - The timestamp to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidISO8601UTC = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'string') {
    return false;
  }

  // ISO 8601 with timezone: YYYY-MM-DDTHH:mm:ss[.sss](Z|+HH:mm|-HH:mm)
  const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;

  if (!iso8601Pattern.test(timestamp)) {
    return false;
  }

  // Verify it's a valid date
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
};

/**
 * Validates that end date is greater than start date
 * @param {string} start - Start timestamp (ISO 8601)
 * @param {string} end - End timestamp (ISO 8601)
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return endDate > startDate;
};

/**
 * Validates reading query parameters
 * @param {object} params - Query parameters { start, end, location }
 * @returns {object} - { isValid, errors }
 */
const validateReadingParams = (params) => {
  const errors = [];

  if (!params.start) {
    errors.push('Missing start timestamp');
  } else if (!isValidISO8601UTC(params.start)) {
    errors.push('Invalid start timestamp. Must be ISO 8601 UTC format with timezone (e.g., 2025-12-31T23:59:59Z or 2025-12-31T23:59:59+02:00)');
  }

  if (!params.end) {
    errors.push('Missing end timestamp');
  } else if (!isValidISO8601UTC(params.end)) {
    errors.push('Invalid end timestamp. Must be ISO 8601 UTC format with timezone (e.g., 2025-12-31T23:59:59Z or 2025-12-31T23:59:59+02:00)');
  }

  if (params.start && params.end && !isValidDateRange(params.start, params.end)) {
    errors.push('End timestamp must be greater than start timestamp');
  }

  if (!params.location && !params['location[]']) {
    errors.push('Missing location parameter');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidISO8601UTC,
  isValidDateRange,
  validateReadingParams
};