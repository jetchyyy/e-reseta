# Custom Hooks Documentation

This document describes the custom hooks created for E-Reseta to improve code reusability and reduce boilerplate.

## Table of Contents

1. [useFirestoreDoc](#usefirestoredoc)
2. [useFirestoreCollection](#usefirestorecollection)
3. [useFormValidation](#useformvalidation)
4. [useTemplateValidation](#usetemplatevalidation)

---

## useFirestoreDoc

Manages a single Firestore document with CRUD operations and loading states.

### Purpose
Eliminates boilerplate code for reading, writing, and updating Firestore documents.

### Location
`src/hooks/useFirestoreDoc.ts`

### Type Signature
```typescript
useFirestoreDoc<T = DocumentData>(
  collectionName: string,
  documentId: string,
  options?: UseFirestoreDocOptions
): UseFirestoreDocReturn<T>
```

### Options
```typescript
interface UseFirestoreDocOptions {
  loadOnMount?: boolean;        // Auto-load document on mount (default: true)
  onLoad?: (data: any) => void; // Callback when document loads
  onError?: (error: Error) => void; // Callback on error
}
```

### Return Value
```typescript
interface UseFirestoreDocReturn<T> {
  data: T | null;               // Document data
  loading: boolean;             // Loading state
  error: string | null;         // Error message
  exists: boolean;              // Document exists in Firestore
  loadDocument: () => Promise<void>;    // Load/reload document
  saveDocument: (data: Partial<T>) => Promise<void>; // Save/update document
  refreshDocument: () => Promise<void>; // Alias for loadDocument
}
```

### Usage Example

#### Basic Usage
```typescript
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';

interface Template {
  name: string;
  email: string;
  phone: string;
}

function MyComponent() {
  const { data: template, loading, saveDocument } = useFirestoreDoc<Template>(
    'resetaTemplates',
    currentUser?.uid || '',
    { loadOnMount: true }
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Doctor: {template?.name}</p>
      <button onClick={() => saveDocument({ phone: '09123456789' })}>
        Update Phone
      </button>
    </div>
  );
}
```

#### With Callbacks
```typescript
const { data, saveDocument } = useFirestoreDoc<Template>(
  'resetaTemplates',
  userId,
  {
    loadOnMount: true,
    onLoad: (data) => console.log('Template loaded:', data),
    onError: (err) => toast.error(err.message)
  }
);
```

### Migration Example

**Before (manual Firestore code):**
```typescript
const [template, setTemplate] = useState<Template | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadTemplate() {
    try {
      setLoading(true);
      const docRef = doc(db, 'resetaTemplates', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTemplate(docSnap.data() as Template);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  loadTemplate();
}, [userId]);

const saveTemplate = async (data: Partial<Template>) => {
  const docRef = doc(db, 'resetaTemplates', userId);
  await setDoc(docRef, data, { merge: true });
};
```

**After (with useFirestoreDoc):**
```typescript
const { data: template, loading, saveDocument } = useFirestoreDoc<Template>(
  'resetaTemplates',
  userId
);
```

---

## useFirestoreCollection

Queries multiple Firestore documents with filtering, ordering, and pagination.

### Purpose
Simplifies querying Firestore collections with common operations like ordering, filtering, and limiting results.

### Location
`src/hooks/useFirestoreCollection.ts`

### Type Signature
```typescript
useFirestoreCollection<T = DocumentData>(
  collectionName: string,
  options?: UseFirestoreCollectionOptions
): UseFirestoreCollectionReturn<T>
```

### Options
```typescript
interface UseFirestoreCollectionOptions {
  loadOnMount?: boolean;        // Auto-load on mount (default: true)
  orderByField?: string;        // Field to order by
  orderDirection?: 'asc' | 'desc'; // Sort direction (default: 'asc')
  limit?: number;               // Max documents to return
  whereConditions?: Array<{     // Filter conditions
    field: string;
    operator: '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
    value: any;
  }>;
  onLoad?: (data: any[]) => void;   // Callback when loaded
  onError?: (error: Error) => void; // Callback on error
}
```

### Return Value
```typescript
interface UseFirestoreCollectionReturn<T> {
  data: T[];                    // Array of documents
  loading: boolean;             // Loading state
  error: string | null;         // Error message
  empty: boolean;               // Collection is empty
  count: number;                // Number of documents
  loadCollection: () => Promise<void>;    // Load/reload collection
  refreshCollection: () => Promise<void>; // Alias for loadCollection
}
```

### Usage Example

#### Load User's Prescriptions
```typescript
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

interface Prescription {
  id: string;
  patientName: string;
  createdAt: string;
  medications: string[];
}

function PrescriptionList() {
  const { data: prescriptions, loading, empty } = useFirestoreCollection<Prescription>(
    'prescriptions',
    {
      loadOnMount: true,
      orderByField: 'createdAt',
      orderDirection: 'desc',
      limit: 10,
      whereConditions: [
        { field: 'doctorId', operator: '==', value: currentUser?.uid }
      ]
    }
  );

  if (loading) return <SkeletonLoader variant="list" />;
  if (empty) return <p>No prescriptions found</p>;

  return (
    <ul>
      {prescriptions.map((rx) => (
        <li key={rx.id}>{rx.patientName} - {rx.createdAt}</li>
      ))}
    </ul>
  );
}
```

#### Search Prescriptions by Patient
```typescript
const [searchTerm, setSearchTerm] = useState('');

const { data: results, loading } = useFirestoreCollection<Prescription>(
  'prescriptions',
  {
    loadOnMount: false, // Manual load
    whereConditions: [
      { field: 'doctorId', operator: '==', value: currentUser?.uid },
      { field: 'patientName', operator: '>=', value: searchTerm },
      { field: 'patientName', operator: '<=', value: searchTerm + '\uf8ff' }
    ]
  }
);

// Load when search term changes
useEffect(() => {
  if (searchTerm) loadCollection();
}, [searchTerm]);
```

### Migration Example

**Before:**
```typescript
const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadPrescriptions() {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'prescriptions'),
        where('doctorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  loadPrescriptions();
}, [userId]);
```

**After:**
```typescript
const { data: prescriptions, loading } = useFirestoreCollection<Prescription>(
  'prescriptions',
  {
    orderByField: 'createdAt',
    orderDirection: 'desc',
    limit: 10,
    whereConditions: [{ field: 'doctorId', operator: '==', value: userId }]
  }
);
```

---

## useFormValidation

Manages form state with built-in validation, error handling, and dirty tracking.

### Purpose
Provides reusable form state management with validation logic, eliminating manual `useState` calls for each field.

### Location
`src/hooks/useFormValidation.ts`

### Type Signature
```typescript
useFormValidation<T extends Record<string, any>>(
  config: { [K in keyof T]: FieldConfig<T[K]> }
): UseFormValidationReturn<T>
```

### Field Configuration
```typescript
interface FieldConfig<T> {
  initialValue: T;              // Initial field value
  validator?: (value: T) => string; // Custom validation function (returns error message)
  required?: boolean;           // Is field required?
}
```

### Return Value
```typescript
interface UseFormValidationReturn<T> {
  fields: { [K in keyof T]: FieldState<T[K]> }; // All field states
  values: T;                    // Current field values
  errors: { [K in keyof T]: string }; // Current field errors
  isValid: boolean;             // Are all fields valid?
  isDirty: boolean;             // Has any field been modified?
  updateField: (fieldName, value) => void; // Update field without validation
  updateFieldWithValidation: (fieldName, value) => void; // Update + validate
  setFieldTouched: (fieldName) => void; // Mark field as touched
  setFieldError: (fieldName, error) => void; // Set error manually
  clearFieldError: (fieldName) => void; // Clear field error
  clearAllErrors: () => void;   // Clear all errors
  validateField: (fieldName) => string; // Validate single field
  validateAllFields: () => boolean; // Validate all fields
  resetForm: () => void;        // Reset all fields to initial values
  resetField: (fieldName) => void; // Reset single field
}
```

### Usage Example

#### Basic Form
```typescript
import { useFormValidation } from '../hooks/useFormValidation';
import { validateEmail, validatePhone } from '../utils/validation';

interface ContactForm {
  email: string;
  phone: string;
  name: string;
}

function ContactForm() {
  const form = useFormValidation<ContactForm>({
    email: {
      initialValue: '',
      validator: (value) => validateEmail(value) ? '' : 'Invalid email format',
      required: true
    },
    phone: {
      initialValue: '',
      validator: (value) => validatePhone(value) ? '' : 'Invalid phone number',
      required: false
    },
    name: {
      initialValue: '',
      required: true
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.validateAllFields()) {
      console.log('Form submitted:', form.values);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          value={form.fields.email.value}
          onChange={(e) => form.updateFieldWithValidation('email', e.target.value)}
          onBlur={() => form.setFieldTouched('email')}
          aria-invalid={!!form.errors.email}
          aria-describedby={form.errors.email ? 'email-error' : undefined}
        />
        {form.errors.email && (
          <span id="email-error" className="text-red-600">{form.errors.email}</span>
        )}
      </div>

      <div>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          value={form.fields.phone.value}
          onChange={(e) => form.updateFieldWithValidation('phone', e.target.value)}
        />
        {form.errors.phone && (
          <span className="text-red-600">{form.errors.phone}</span>
        )}
      </div>

      <button type="submit" disabled={!form.isValid}>
        Submit
      </button>
    </form>
  );
}
```

#### Conditional Validation
```typescript
const form = useFormValidation<LoginForm>({
  email: {
    initialValue: '',
    validator: (value) => {
      if (!value.includes('@')) return 'Email must contain @';
      if (!validateEmail(value)) return 'Invalid email format';
      return '';
    },
    required: true
  },
  password: {
    initialValue: '',
    validator: (value) => {
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letter';
      return '';
    },
    required: true
  }
});
```

### Migration Example

**Before:**
```typescript
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');
const [phone, setPhone] = useState('');
const [phoneError, setPhoneError] = useState('');

const validateForm = () => {
  let isValid = true;
  
  if (!email) {
    setEmailError('Email is required');
    isValid = false;
  } else if (!validateEmail(email)) {
    setEmailError('Invalid email');
    isValid = false;
  } else {
    setEmailError('');
  }

  if (phone && !validatePhone(phone)) {
    setPhoneError('Invalid phone');
    isValid = false;
  } else {
    setPhoneError('');
  }

  return isValid;
};
```

**After:**
```typescript
const form = useFormValidation({
  email: {
    initialValue: '',
    validator: (v) => validateEmail(v) ? '' : 'Invalid email',
    required: true
  },
  phone: {
    initialValue: '',
    validator: (v) => validatePhone(v) ? '' : 'Invalid phone',
    required: false
  }
});

// Use form.validateAllFields() to validate
```

---

## useTemplateValidation

Specialized validation hook for Reseta template forms.

### Purpose
Centralized validation logic for template creation forms (doctor info, contact, clinic hours, design).

### Location
`src/hooks/useTemplateValidation.ts`

### Usage
See `src/components/reusable/CreateResetaTemplateRefactored.tsx` for full implementation example.

### Key Features
- Validates doctor name, license number, email, phone
- Validates PTR and S2 license numbers
- Validates clinic hours and address
- Validates template name and design colors
- Provides field-by-field and bulk validation
- Manages error state for all template fields

---

## Best Practices

### 1. Type Safety
Always provide TypeScript generics for better type inference:
```typescript
const { data: template } = useFirestoreDoc<Template>('resetaTemplates', userId);
```

### 2. Error Handling
Use the `onError` callback for user-friendly error messages:
```typescript
const { data } = useFirestoreDoc('templates', id, {
  onError: (err) => toast.error(`Failed to load template: ${err.message}`)
});
```

### 3. Loading States
Combine hooks with `SkeletonLoader` for better UX:
```typescript
const { data, loading } = useFirestoreCollection('prescriptions');

if (loading) return <SkeletonLoader variant="list" />;
```

### 4. Conditional Validation
Use validator functions for complex validation logic:
```typescript
const form = useFormValidation({
  age: {
    initialValue: '',
    validator: (value) => {
      const num = parseInt(value);
      if (isNaN(num)) return 'Must be a number';
      if (num < 0 || num > 120) return 'Invalid age range';
      return '';
    }
  }
});
```

### 5. Accessibility
Always pair validation errors with ARIA attributes:
```typescript
<input
  aria-invalid={!!form.errors.email}
  aria-describedby={form.errors.email ? 'email-error' : undefined}
/>
{form.errors.email && (
  <span id="email-error" role="alert">{form.errors.email}</span>
)}
```

---

## Performance Considerations

1. **useFirestoreDoc**: Only loads once on mount by default. Use `refreshDocument()` to manually reload.
2. **useFirestoreCollection**: Query constraints are memoized; re-renders won't cause re-queries unless dependencies change.
3. **useFormValidation**: Validation runs on-demand (not on every keystroke unless using `updateFieldWithValidation`).

---

## Testing Recommendations

1. Test hooks with `@testing-library/react-hooks`
2. Mock Firestore operations with `firebase-mock` or manual mocks
3. Test validation logic separately from UI components
4. Verify error handling paths (network failures, permission errors)
5. Test accessibility features (ARIA labels, keyboard navigation)

---

## Future Enhancements

- **Real-time updates**: Add `onSnapshot` support to `useFirestoreDoc` and `useFirestoreCollection`
- **Pagination**: Add cursor-based pagination to `useFirestoreCollection`
- **Optimistic updates**: Update UI before Firestore write completes
- **Debounced validation**: Add debounce option to `useFormValidation` for expensive validators
- **Field-level touched state**: Track which fields user has interacted with

---

## Related Documentation

- [Validation Utilities](../utils/validation.ts) - Validation functions used by these hooks
- [Priority 2 Improvements](./priority-2-improvements.md) - Full UX improvement details
- [Refactoring Guide](./refactoring-create-reseta-template.md) - Component refactoring examples
