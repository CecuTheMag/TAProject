import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormValidation, validationRules } from '../../hooks/useFormValidation';

describe('useFormValidation Hook', () => {
  const initialValues = {
    email: '',
    password: '',
    name: ''
  };

  const rules = {
    email: [
      validationRules.required,
      validationRules.email
    ],
    password: [
      validationRules.required,
      validationRules.minLength(8)
    ],
    name: [
      validationRules.required
    ]
  };

  it('should initialize with empty values and no errors', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
    expect(result.current.touched).toEqual({});
  });

  it('should update values on change', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('should validate email format', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.handleChange('email', 'invalid-email');
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('Please enter a valid email');
    expect(result.current.isValid).toBe(false);
  });

  it('should validate required fields', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('This field is required');
  });

  it('should validate minLength for password', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.handleChange('password', 'short');
      result.current.handleBlur('password');
    });

    expect(result.current.errors.password).toBe('Must be at least 8 characters');
  });

  it('should clear error when field becomes valid', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.handleChange('email', 'invalid');
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBeTruthy();

    act(() => {
      result.current.handleChange('email', 'valid@example.com');
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('');
  });

  it('should validate all fields on submit', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    let isValid = false;
    
    act(() => {
      isValid = result.current.validateAll();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.email).toBe('This field is required');
    expect(result.current.errors.password).toBe('This field is required');
    expect(result.current.errors.name).toBe('This field is required');
  });

  it('should return true when all fields are valid', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
      result.current.handleChange('password', 'password123');
      result.current.handleChange('name', 'John Doe');
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateAll();
    });

    expect(isValid).toBe(true);
    expect(result.current.errors.email).toBe('');
    expect(result.current.errors.password).toBe('');
    expect(result.current.errors.name).toBe('');
  });

  it('should reset form to initial values', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
      result.current.handleChange('password', 'password123');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('should handle custom validation rules', () => {
    const customRules = {
      field: [
        (value) => value === 'specific' ? '' : 'Must be specific value'
      ]
    };

    const { result } = renderHook(() => 
      useFormValidation({ field: '' }, customRules)
    );

    act(() => {
      result.current.handleChange('field', 'wrong');
      result.current.handleBlur('field');
    });

    expect(result.current.errors.field).toBe('Must be specific value');

    act(() => {
      result.current.handleChange('field', 'specific');
      result.current.handleBlur('field');
    });

    expect(result.current.errors.field).toBe('');
  });

  it('should not validate on change before blur', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.handleChange('email', 'invalid-email');
    });

    // Should not show error before blur
    expect(result.current.errors.email).toBeUndefined();
  });

  it('should validate on change after blur', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.handleBlur('email');
      result.current.handleChange('email', 'invalid-email');
    });

    // Should show error after blur
    expect(result.current.errors.email).toBe('Please enter a valid email');
  });

  it('should handle multiple validation errors', () => {
    const multiRuleField = {
      field: [
        validationRules.required,
        validationRules.minLength(5)
      ]
    };

    const { result } = renderHook(() => 
      useFormValidation({ field: '' }, multiRuleField)
    );

    act(() => {
      result.current.handleChange('field', 'ab');
      result.current.handleBlur('field');
    });

    // Should show first error (required passes, minLength fails)
    expect(result.current.errors.field).toBe('Must be at least 5 characters');
  });

  it('should track touched fields', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    expect(result.current.touched.email).toBeFalsy();

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.touched.email).toBe(true);
  });

  it('should use password validation rule', () => {
    const passwordRules = {
      password: [
        validationRules.required,
        validationRules.password
      ]
    };

    const { result } = renderHook(() => 
      useFormValidation({ password: '' }, passwordRules)
    );

    act(() => {
      result.current.handleChange('password', 'short');
      result.current.handleBlur('password');
    });

    expect(result.current.errors.password).toBe('Password must be at least 8 characters');

    act(() => {
      result.current.handleChange('password', 'longenough');
      result.current.handleBlur('password');
    });

    expect(result.current.errors.password).toBe('');
  });
});
