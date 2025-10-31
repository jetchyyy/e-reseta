import { useState, useCallback } from 'react';

interface FieldConfig<T> {
  initialValue: T;
  validator?: (value: T) => string;
  required?: boolean;
}

interface FieldState<T> {
  value: T;
  error: string;
  touched: boolean;
  dirty: boolean;
}

interface UseFormValidationReturn<T extends Record<string, any>> {
  fields: { [K in keyof T]: FieldState<T[K]> };
  values: T;
  errors: { [K in keyof T]: string };
  isValid: boolean;
  isDirty: boolean;
  updateField: <K extends keyof T>(fieldName: K, value: T[K]) => void;
  updateFieldWithValidation: <K extends keyof T>(fieldName: K, value: T[K]) => void;
  setFieldTouched: <K extends keyof T>(fieldName: K) => void;
  setFieldError: <K extends keyof T>(fieldName: K, error: string) => void;
  clearFieldError: <K extends keyof T>(fieldName: K) => void;
  clearAllErrors: () => void;
  validateField: <K extends keyof T>(fieldName: K) => string;
  validateAllFields: () => boolean;
  resetForm: () => void;
  resetField: <K extends keyof T>(fieldName: K) => void;
}

/**
 * Custom hook for managing form state with validation
 * 
 * @example
 * const { fields, updateFieldWithValidation, validateAllFields } = useFormValidation({
 *   email: {
 *     initialValue: '',
 *     validator: (value) => validateEmail(value) ? '' : 'Invalid email',
 *     required: true
 *   },
 *   phone: {
 *     initialValue: '',
 *     validator: (value) => validatePhone(value) ? '' : 'Invalid phone',
 *     required: false
 *   }
 * });
 */
export function useFormValidation<T extends Record<string, any>>(
  config: { [K in keyof T]: FieldConfig<T[K]> }
): UseFormValidationReturn<T> {
  // Initialize field states
  const initializeFields = useCallback(() => {
    const initialFields = {} as { [K in keyof T]: FieldState<T[K]> };
    Object.keys(config).forEach((key) => {
      const fieldKey = key as keyof T;
      initialFields[fieldKey] = {
        value: config[fieldKey].initialValue,
        error: '',
        touched: false,
        dirty: false,
      };
    });
    return initialFields;
  }, [config]);

  const [fields, setFields] = useState<{ [K in keyof T]: FieldState<T[K]> }>(initializeFields);

  // Validate a single field
  const validateField = useCallback(<K extends keyof T>(fieldName: K): string => {
    const fieldConfig = config[fieldName];
    const fieldValue = fields[fieldName].value;

    // Check required
    if (fieldConfig.required) {
      if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
        return 'This field is required';
      }
    }

    // Run custom validator if provided
    if (fieldConfig.validator) {
      return fieldConfig.validator(fieldValue);
    }

    return '';
  }, [config, fields]);

  // Update field value without validation
  const updateField = useCallback(<K extends keyof T>(fieldName: K, value: T[K]) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        dirty: true,
      },
    }));
  }, []);

  // Update field value with validation
  const updateFieldWithValidation = useCallback(<K extends keyof T>(fieldName: K, value: T[K]) => {
    setFields((prev) => {
      const updatedField = {
        ...prev[fieldName],
        value,
        dirty: true,
      };

      // Validate the field
      const fieldConfig = config[fieldName];
      let error = '';

      if (fieldConfig.required && (value === '' || value === null || value === undefined)) {
        error = 'This field is required';
      } else if (fieldConfig.validator && value) {
        error = fieldConfig.validator(value);
      }

      updatedField.error = error;

      return {
        ...prev,
        [fieldName]: updatedField,
      };
    });
  }, [config]);

  // Mark field as touched
  const setFieldTouched = useCallback(<K extends keyof T>(fieldName: K) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true,
      },
    }));
  }, []);

  // Set field error manually
  const setFieldError = useCallback(<K extends keyof T>(fieldName: K, error: string) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error,
      },
    }));
  }, []);

  // Clear field error
  const clearFieldError = useCallback(<K extends keyof T>(fieldName: K) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error: '',
      },
    }));
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setFields((prev) => {
      const clearedFields = { ...prev };
      Object.keys(clearedFields).forEach((key) => {
        const fieldKey = key as keyof T;
        clearedFields[fieldKey] = {
          ...clearedFields[fieldKey],
          error: '',
        };
      });
      return clearedFields;
    });
  }, []);

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    let isFormValid = true;
    const updatedFields = { ...fields };

    Object.keys(config).forEach((key) => {
      const fieldKey = key as keyof T;
      const fieldValue = fields[fieldKey].value;
      const fieldConfig = config[fieldKey];
      let error = '';

      // Check required
      if (fieldConfig.required && (fieldValue === '' || fieldValue === null || fieldValue === undefined)) {
        error = 'This field is required';
        isFormValid = false;
      }
      // Run custom validator
      else if (fieldConfig.validator && fieldValue) {
        error = fieldConfig.validator(fieldValue);
        if (error) {
          isFormValid = false;
        }
      }

      updatedFields[fieldKey] = {
        ...updatedFields[fieldKey],
        error,
        touched: true,
      };
    });

    setFields(updatedFields);
    return isFormValid;
  }, [config, fields]);

  // Reset entire form
  const resetForm = useCallback(() => {
    setFields(initializeFields());
  }, [initializeFields]);

  // Reset a single field
  const resetField = useCallback(<K extends keyof T>(fieldName: K) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: {
        value: config[fieldName].initialValue,
        error: '',
        touched: false,
        dirty: false,
      },
    }));
  }, [config]);

  // Derived state: values object
  const values = Object.keys(fields).reduce((acc, key) => {
    const fieldKey = key as keyof T;
    acc[fieldKey] = fields[fieldKey].value;
    return acc;
  }, {} as T);

  // Derived state: errors object
  const errors = Object.keys(fields).reduce((acc, key) => {
    const fieldKey = key as keyof T;
    acc[fieldKey] = fields[fieldKey].error;
    return acc;
  }, {} as { [K in keyof T]: string });

  // Derived state: is form valid
  const isValid = Object.keys(fields).every((key) => {
    const fieldKey = key as keyof T;
    return !fields[fieldKey].error;
  });

  // Derived state: is form dirty
  const isDirty = Object.keys(fields).some((key) => {
    const fieldKey = key as keyof T;
    return fields[fieldKey].dirty;
  });

  return {
    fields,
    values,
    errors,
    isValid,
    isDirty,
    updateField,
    updateFieldWithValidation,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    validateField,
    validateAllFields,
    resetForm,
    resetField,
  };
}
