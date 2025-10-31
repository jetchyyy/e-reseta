/**
 * Validation utilities for E-Reseta application
 * Provides regex patterns and validation functions for common input types
 */

// Regex patterns
export const ValidationPatterns = {
  // Email: Standard RFC 5322 simplified pattern
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Philippine mobile number: 09XX-XXX-XXXX or +639XXXXXXXXX
  philippineMobile: /^(09|\+639)\d{9}$/,
  
  // Philippine landline: (XXX) XXX-XXXX or XXX-XXXX
  philippineLandline: /^(\(\d{3}\)\s?|\d{3}-)?\d{3}-?\d{4}$/,
  
  // Any phone number (mobile or landline)
  phone: /^(09|\+639)\d{9}$|^(\(\d{3}\)\s?|\d{3}-)?\d{3}-?\d{4}$/,
  
  // License number: Alphanumeric, 6-15 characters
  licenseNumber: /^[A-Z0-9]{6,15}$/i,
  
  // PTR number: Format PTR-XXXXXXX or just numbers
  ptrNumber: /^(PTR-?)?\d{7,10}$/i,
  
  // S2 License: Alphanumeric
  s2License: /^S2-?[A-Z0-9]{6,12}$/i,
  
  // Name: Letters, spaces, hyphens, apostrophes (for Filipino names)
  name: /^[a-zA-ZñÑ\s'-]+$/,
  
  // Age: 1-150
  age: /^(?:1[0-4]\d|150|[1-9]\d?)$/,
  
  // Medication dosage: Numbers with optional units
  dosage: /^\d+(\.\d+)?\s?(mg|g|ml|mcg|IU|units?)?$/i,
} as const;

// Validation error messages
export const ValidationMessages = {
  email: 'Please enter a valid email address (e.g., doctor@example.com)',
  philippineMobile: 'Please enter a valid Philippine mobile number (e.g., 09171234567 or +639171234567)',
  philippineLandline: 'Please enter a valid landline number (e.g., 02-1234567 or (02) 123-4567)',
  phone: 'Please enter a valid phone number',
  licenseNumber: 'License number must be 6-15 alphanumeric characters',
  ptrNumber: 'PTR number must be 7-10 digits (e.g., PTR-1234567)',
  s2License: 'S2 License must be alphanumeric (e.g., S2-ABC123456)',
  name: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  age: 'Age must be between 1 and 150',
  dosage: 'Please enter a valid dosage (e.g., 500mg, 2.5g, 10ml)',
  required: 'This field is required',
  tooShort: 'Input is too short',
  tooLong: 'Input is too long',
} as const;

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, error: ValidationMessages.required };
  }
  
  const isValid = ValidationPatterns.email.test(email.trim());
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.email,
  };
}

/**
 * Validate Philippine mobile number
 */
export function validatePhilippineMobile(mobile: string): ValidationResult {
  if (!mobile.trim()) {
    return { isValid: false, error: ValidationMessages.required };
  }
  
  // Remove spaces and dashes for validation
  const cleaned = mobile.replace(/[\s-]/g, '');
  const isValid = ValidationPatterns.philippineMobile.test(cleaned);
  
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.philippineMobile,
  };
}

/**
 * Validate phone number (mobile or landline)
 */
export function validatePhone(phone: string, required = false): ValidationResult {
  if (!phone.trim()) {
    return { isValid: !required, error: required ? ValidationMessages.required : undefined };
  }
  
  // Remove spaces and dashes for validation
  const cleaned = phone.replace(/[\s-]/g, '');
  const isValid = ValidationPatterns.phone.test(cleaned);
  
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.phone,
  };
}

/**
 * Validate license number
 */
export function validateLicenseNumber(license: string): ValidationResult {
  if (!license.trim()) {
    return { isValid: false, error: ValidationMessages.required };
  }
  
  const cleaned = license.replace(/[\s-]/g, '');
  const isValid = ValidationPatterns.licenseNumber.test(cleaned);
  
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.licenseNumber,
  };
}

/**
 * Validate PTR number
 */
export function validatePTRNumber(ptr: string, required = false): ValidationResult {
  if (!ptr.trim()) {
    return { isValid: !required, error: required ? ValidationMessages.required : undefined };
  }
  
  const cleaned = ptr.replace(/[\s-]/g, '');
  const isValid = ValidationPatterns.ptrNumber.test(cleaned);
  
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.ptrNumber,
  };
}

/**
 * Validate S2 License number
 */
export function validateS2License(s2: string, required = false): ValidationResult {
  if (!s2.trim()) {
    return { isValid: !required, error: required ? ValidationMessages.required : undefined };
  }
  
  const cleaned = s2.replace(/[\s-]/g, '');
  const isValid = ValidationPatterns.s2License.test(cleaned);
  
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.s2License,
  };
}

/**
 * Validate name (person name)
 */
export function validateName(name: string, required = true): ValidationResult {
  if (!name.trim()) {
    return { isValid: !required, error: required ? ValidationMessages.required : undefined };
  }
  
  const isValid = ValidationPatterns.name.test(name.trim());
  
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.name,
  };
}

/**
 * Validate age
 */
export function validateAge(age: string, required = false): ValidationResult {
  if (!age.trim()) {
    return { isValid: !required, error: required ? ValidationMessages.required : undefined };
  }
  
  const isValid = ValidationPatterns.age.test(age.trim());
  
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.age,
  };
}

/**
 * Validate medication dosage
 */
export function validateDosage(dosage: string, required = false): ValidationResult {
  if (!dosage.trim()) {
    return { isValid: !required, error: required ? ValidationMessages.required : undefined };
  }
  
  const isValid = ValidationPatterns.dosage.test(dosage.trim());
  
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.dosage,
  };
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  // Philippine mobile: 0917-123-4567
  if (cleaned.startsWith('09') && cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // International mobile: +63 917-123-4567
  if (cleaned.startsWith('639') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
  }
  
  // Return as-is if format not recognized
  return phone;
}

/**
 * Generic required field validator
 */
export function validateRequired(value: string, fieldName = 'This field'): ValidationResult {
  const isValid = value.trim().length > 0;
  return {
    isValid,
    error: isValid ? undefined : `${fieldName} is required`,
  };
}

/**
 * Validate minimum length
 */
export function validateMinLength(value: string, minLength: number, fieldName = 'This field'): ValidationResult {
  const isValid = value.trim().length >= minLength;
  return {
    isValid,
    error: isValid ? undefined : `${fieldName} must be at least ${minLength} characters`,
  };
}

/**
 * Validate maximum length
 */
export function validateMaxLength(value: string, maxLength: number, fieldName = 'This field'): ValidationResult {
  const isValid = value.trim().length <= maxLength;
  return {
    isValid,
    error: isValid ? undefined : `${fieldName} must not exceed ${maxLength} characters`,
  };
}

/**
 * Combine multiple validation results
 */
export function combineValidations(...results: ValidationResult[]): ValidationResult {
  const firstError = results.find(r => !r.isValid);
  return firstError || { isValid: true };
}
