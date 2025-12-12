import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime } from './dateTimeUtils'

// Test timestamps (Unix seconds, UTC)
const TEST_TIMESTAMPS = {
  JAN_15_2024_NOON: 1705334400,        // Jan 15, 2024 12:00:00 UTC
  JAN_15_2024_3_30PM: 1705335000,      // Jan 15, 2024 15:30:00 UTC
  JAN_15_2024_9_15AM: 1705312500,      // Jan 15, 2024 09:15:00 UTC
  JAN_15_2024_9_45PM: 1705351500,      // Jan 15, 2024 21:45:00 UTC
  DEC_25_2023_NOON: 1703520000,        // Dec 25, 2023 12:00:00 UTC
  JAN_1_2025_MIDNIGHT: 1735689600,     // Jan 1, 2025 00:00:00 UTC
}

describe('dateTimeUtils', () => {
  describe('formatDate', () => {
    it('formats valid timestamp to date string', () => {
      const result = formatDate(TEST_TIMESTAMPS.JAN_15_2024_NOON)
      
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
      expect(result).toContain('2024')
    })

    it.each([null, undefined, 0, ''])('returns "N/A" for %s', (input) => {
      expect(formatDate(input)).toBe('N/A')
    })

    it('formats different dates correctly', () => {
      expect(formatDate(TEST_TIMESTAMPS.DEC_25_2023_NOON)).toContain('2023')
      expect(formatDate(TEST_TIMESTAMPS.JAN_1_2025_MIDNIGHT)).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
    })
  })

  describe('formatDateTime', () => {
    it('formats valid timestamp to date and time string', () => {
      const result = formatDateTime(TEST_TIMESTAMPS.JAN_15_2024_3_30PM)
      
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2} (am|pm)$/i)
      expect(result).toContain('2024')
      expect(result).toContain('at')
    })

    it.each([null, undefined, 0, ''])('returns "N/A" for %s', (input) => {
      expect(formatDateTime(input)).toBe('N/A')
    })

    it('includes time in 12-hour format', () => {
      const result = formatDateTime(TEST_TIMESTAMPS.JAN_15_2024_3_30PM)
      expect(result).toMatch(/(am|pm)/i)
    })

    it('handles morning times', () => {
      const result = formatDateTime(TEST_TIMESTAMPS.JAN_15_2024_9_15AM)
      expect(result).toMatch(/am/i)
    })

    it('handles evening times', () => {
      const result = formatDateTime(TEST_TIMESTAMPS.JAN_15_2024_9_45PM)
      expect(result).toMatch(/pm/i)
    })

    it('formats different dates correctly', () => {
      const result1 = formatDateTime(TEST_TIMESTAMPS.DEC_25_2023_NOON)
      expect(result1).toContain('2023')
      expect(result1).toContain('at')
      
      const result2 = formatDateTime(TEST_TIMESTAMPS.JAN_1_2025_MIDNIGHT)
      expect(result2).toMatch(/\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2} (am|pm)/i)
    })
  })
})
