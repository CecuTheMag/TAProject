// Test: School Context Security - SQL Injection Prevention
import { validateSchoolCode } from '../middleware/schoolContext.js';

describe('School Context Security', () => {
  
  describe('validateSchoolCode', () => {
    
    test('should accept valid school codes', () => {
      expect(validateSchoolCode('HBHS')).toBe(true);
      expect(validateSchoolCode('ABC123')).toBe(true);
      expect(validateSchoolCode('test')).toBe(true);
      expect(validateSchoolCode('A1B2C3')).toBe(true);
    });

    test('should reject invalid school codes (SQL injection attempts)', () => {
      // SQL injection attempts
      expect(validateSchoolCode("'; DROP TABLE users; --")).toBe(false);
      expect(validateSchoolCode("1; DELETE FROM schools")).toBe(false);
      expect(validateSchoolCode("school_1' OR '1'='1")).toBe(false);
      expect(validateSchoolCode("school_1\" OR \"1\"=\"1")).toBe(false);
      expect(validateSchoolCode("1 OR 1=1")).toBe(false);
      expect(validateSchoolCode("1; DROP SCHEMA public; --")).toBe(false);
      expect(validateSchoolCode("'; INSERT INTO users VALUES ('hacked') --")).toBe(false);
      expect(validateSchoolCode("../etc/passwd")).toBe(false);
      expect(validateSchoolCode("1 UNION SELECT * FROM users")).toBe(false);
    });

    test('should reject special characters', () => {
      expect(validateSchoolCode('test@school')).toBe(false);
      expect(validateSchoolCode('test school')).toBe(false);
      expect(validateSchoolCode('test/school')).toBe(false);
      expect(validateSchoolCode('test&school')).toBe(false);
      expect(validateSchoolCode('test<script>')).toBe(false);
    });

    test('should reject invalid inputs', () => {
      expect(validateSchoolCode('')).toBe(false);
      expect(validateSchoolCode(null)).toBe(false);
      expect(validateSchoolCode(undefined)).toBe(false);
      expect(validateSchoolCode(123)).toBe(false);
      expect(validateSchoolCode({})).toBe(false);
    });

    test('should reject codes outside length limits', () => {
      expect(validateSchoolCode('A')).toBe(false); // Too short
      expect(validateSchoolCode('A'.repeat(51))).toBe(false); // Too long
    });
  });
});

describe('SQL Injection Prevention Tests', () => {
  
  test('should prevent schema name injection via school code', () => {
    const maliciousCode = "test'; DROP SCHEMA public; --";
    const isValid = validateSchoolCode(maliciousCode);
    expect(isValid).toBe(false);
  });

  test('should prevent comment injection', () => {
    const maliciousCode = "test--";
    const isValid = validateSchoolCode(maliciousCode);
    expect(isValid).toBe(false);
  });

  test('should prevent semicolon injection', () => {
    const maliciousCode = "test; DELETE FROM schools";
    const isValid = validateSchoolCode(maliciousCode);
    expect(isValid).toBe(false);
  });

  test('should prevent UNION injection', () => {
    const maliciousCode = "test UNION SELECT password FROM users";
    const isValid = validateSchoolCode(maliciousCode);
    expect(isValid).toBe(false);
  });
});

