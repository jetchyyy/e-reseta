import { useState, useCallback } from 'react';
import { 
  validateEmail, 
  validatePhone, 
  validatePTRNumber, 
  validateS2License,
  validateName 
} from '../utils/validation';

export const useTemplateValidation = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((fieldName: string, value: string): string => {
    if (!value || !value.trim()) return '';
    
    switch (fieldName) {
      case 'email':
        const emailValidation = validateEmail(value);
        return emailValidation.isValid ? '' : emailValidation.error || 'Invalid email';
      case 'phone':
      case 'mobile':
        const phoneValidation = validatePhone(value);
        return phoneValidation.isValid ? '' : phoneValidation.error || 'Invalid phone number';
      case 'ptrNo':
        if (value.trim()) {
          const ptrValidation = validatePTRNumber(value);
          return ptrValidation.isValid ? '' : ptrValidation.error || 'Invalid PTR number';
        }
        return '';
      case 's2LicenseNo':
        if (value.trim()) {
          const s2Validation = validateS2License(value);
          return s2Validation.isValid ? '' : s2Validation.error || 'Invalid S2 license';
        }
        return '';
      case 'doctorName':
        const nameValidation = validateName(value);
        return nameValidation.isValid ? '' : nameValidation.error || 'Invalid name';
      default:
        return '';
    }
  }, []);

  const updateFieldWithValidation = useCallback((field: string, value: any, updateField: (field: string, value: any) => void) => {
    updateField(field, value);
    
    // Only validate specific fields that have validators
    if (['email', 'phone', 'mobile', 'ptrNo', 's2LicenseNo', 'doctorName'].includes(field)) {
      const error = validateField(field, value);
      setFieldErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [validateField]);

  const validateAllFields = useCallback((template: any) => {
    const errors: Record<string, string> = {};
    
    // Required field validations
    if (!template.clinicName.trim()) {
      errors.clinicName = 'Clinic name is required';
    }
    if (!template.doctorName.trim()) {
      errors.doctorName = 'Doctor name is required';
    } else {
      const nameValidation = validateName(template.doctorName);
      if (!nameValidation.isValid) {
        errors.doctorName = nameValidation.error || 'Invalid name';
      }
    }
    if (!template.specialty.trim()) {
      errors.specialty = 'Specialty is required';
    }
    if (!template.clinicAddress.trim()) {
      errors.clinicAddress = 'Clinic address is required';
    }
    if (!template.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneValidation = validatePhone(template.phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error || 'Invalid phone number';
      }
    }
    if (!template.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailValidation = validateEmail(template.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error || 'Invalid email address';
      }
    }
    
    // Optional field validations (only if filled)
    if (template.mobile && template.mobile.trim()) {
      const mobileValidation = validatePhone(template.mobile);
      if (!mobileValidation.isValid) {
        errors.mobile = mobileValidation.error || 'Invalid mobile number';
      }
    }
    if (template.ptrNo && template.ptrNo.trim()) {
      const ptrValidation = validatePTRNumber(template.ptrNo);
      if (!ptrValidation.isValid) {
        errors.ptrNo = ptrValidation.error || 'Invalid PTR number';
      }
    }
    if (template.s2LicenseNo && template.s2LicenseNo.trim()) {
      const s2Validation = validateS2License(template.s2LicenseNo);
      if (!s2Validation.isValid) {
        errors.s2LicenseNo = s2Validation.error || 'Invalid S2 license number';
      }
    }
    
    setFieldErrors(errors);
    return errors;
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  return {
    fieldErrors,
    validateField,
    updateFieldWithValidation,
    validateAllFields,
    clearFieldError,
    clearAllErrors,
  };
};
