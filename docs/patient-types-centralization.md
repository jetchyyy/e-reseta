# Patient Types Centralization

## Overview

Centralized all patient-related type definitions into a single source of truth at `src/types/patient.ts`. This improves maintainability, consistency, and reduces code duplication across the patient management system.

## Changes Made

### 1. Created Central Types File

**File**: `src/types/patient.ts`

**Exports**:

- `Patient` - Complete patient entity interface with all fields
- `PatientFormData` - Form-specific interface (excludes Firestore metadata)
- `PatientValidationErrors` - Type-safe validation error mapping
- `BLOOD_TYPES` - Array of valid blood type options
- `BloodType` - Union type of blood type values
- `GENDER_OPTIONS` - Array of valid gender options
- `Gender` - Union type of gender values

**Key Features**:

- Comprehensive JSDoc documentation for all fields
- Clear distinction between required and optional fields
- Firestore `Timestamp` integration
- Type-safe validation error handling
- Reusable constants for dropdowns/selects

### 2. Updated Component Imports

**Before**: Each component imported `Patient` from `PatientCard.tsx`

```typescript
import type { Patient } from "../components/patients/PatientCard";
```

**After**: All components import from centralized types

```typescript
import type { Patient } from "../types/patient";
```

**Files Updated**:

- ✅ `src/components/patients/PatientCard.tsx`
- ✅ `src/components/patients/PatientList.tsx`
- ✅ `src/components/patients/PatientForm.tsx`
- ✅ `src/components/patients/PatientDetailModal.tsx`
- ✅ `src/hooks/usePatients.ts`
- ✅ `src/pages/PatientsPage.tsx`
- ✅ `src/pages/PatientSelfRegistration.tsx`

### 3. Removed Duplicate Interface

**Before**: `PatientSelfRegistration.tsx` had its own `PatientFormData` interface with 17 individual fields

**After**: Uses centralized `PatientFormData` from `src/types/patient.ts`

## Patient Interface Structure

### Required Fields

- `firstName: string` - Patient's first name
- `lastName: string` - Patient's last name
- `dateOfBirth: string` - DOB in YYYY-MM-DD format
- `age: number` - Calculated age in years
- `gender: 'Male' | 'Female' | 'Other'` - Patient's gender
- `phone: string` - Contact phone number
- `address: string` - Complete address
- `doctorUid: string` - Doctor who owns this record (for Firestore isolation)

### Optional Fields

- `id?: string` - Firestore document ID
- `middleName?: string` - Middle name
- `email?: string` - Email address
- `allergies?: string` - Known allergies
- `chronicConditions?: string` - Chronic diseases
- `currentMedications?: string` - Current medications
- `bloodType?: string` - Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `emergencyContactName?: string` - Emergency contact name
- `emergencyContactPhone?: string` - Emergency contact phone
- `notes?: string` - Additional notes
- `createdAt?: Timestamp` - Creation timestamp
- `updatedAt?: Timestamp` - Last update timestamp

## Public Route Verification

### Route Configuration

The patient self-registration route is **already public** and accessible without authentication:

**File**: `src/App.tsx`

```tsx
{
  /* Public route - Patient Self Registration */
}
<Route
  path="/register-patient/:doctorId"
  element={<PatientSelfRegistration />}
/>;
```

**Key Points**:

- ✅ Not wrapped in `<ProtectedRoute>`
- ✅ Positioned with other public routes (after `/login`)
- ✅ Uses URL parameter `:doctorId` for doctor identification
- ✅ Accessible without user login

### Public Access Flow

1. Doctor generates link: `https://yourapp.com/register-patient/{doctorUid}`
2. Patient receives link (email/SMS/messenger)
3. Patient opens link (no login required)
4. Form loads doctor's credentials from Firestore
5. Patient fills out form
6. Data saved with `doctorUid` for proper isolation

## Benefits

### 1. Single Source of Truth

- All patient type definitions in one place
- Changes propagate automatically to all consumers
- No risk of interface drift between components

### 2. Better Documentation

- Comprehensive JSDoc comments
- Clear field descriptions
- Required vs optional clearly marked

### 3. Type Safety

- Centralized validation error types
- Type-safe constants for dropdowns
- Firestore timestamp integration

### 4. Maintainability

- Easy to add new fields (update one file)
- Consistent field naming across app
- Clear import paths

### 5. Reusability

- `PatientFormData` type for forms (excludes metadata)
- `Patient` type for full entities (includes Firestore fields)
- Constants (`BLOOD_TYPES`, `GENDER_OPTIONS`) for UI components

## Usage Examples

### In Components

```typescript
import type { Patient } from "../../types/patient";

const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => {
  // Use patient.firstName, patient.age, etc.
};
```

### In Forms

```typescript
import type { PatientFormData } from "../types/patient";

const [formData, setFormData] = useState<PatientFormData>({
  firstName: "",
  lastName: "",
  // ... other required fields
});
```

### With Constants

```typescript
import { BLOOD_TYPES, GENDER_OPTIONS } from "../types/patient";

<select>
  {BLOOD_TYPES.map((type) => (
    <option key={type} value={type}>
      {type}
    </option>
  ))}
</select>;
```

## Verification

### Build Status

✅ **Build Successful** (0 TypeScript errors)

```
dist/assets/index-DpYlOTjh.js   875.13 kB │ gzip: 220.71 kB
✓ built in 4.05s
```

### Type Checking

✅ All patient-related files pass TypeScript validation
✅ No circular dependencies
✅ Correct import paths

## Future Enhancements

### Potential Additions

1. **Patient Status Enum**: Add `PatientStatus` type for active/inactive/archived
2. **Validation Schemas**: Zod or Yup schemas for runtime validation
3. **Audit Fields**: Add `createdBy`, `updatedBy` for tracking
4. **Soft Delete**: Add `deletedAt` field for soft deletion
5. **Patient History**: Add `medicalHistory` array field

### Migration Path

When adding new fields:

1. Update `src/types/patient.ts`
2. Update Firestore security rules if needed
3. Update form components to include new field
4. Run `npm run build` to verify

## Related Files

### Type Definitions

- `src/types/patient.ts` - Central patient types
- `src/types/prescription.ts` - Prescription types (separate domain)

### Components Using Patient Types

- `src/components/patients/PatientCard.tsx`
- `src/components/patients/PatientList.tsx`
- `src/components/patients/PatientForm.tsx`
- `src/components/patients/PatientDetailModal.tsx`

### Hooks Using Patient Types

- `src/hooks/usePatients.ts` - Patient CRUD operations

### Pages Using Patient Types

- `src/pages/PatientsPage.tsx` - Doctor's patient management
- `src/pages/PatientSelfRegistration.tsx` - Public patient registration

### Validation

- `src/utils/validation.ts` - Philippine-specific validators

## Security Considerations

### Firestore Rules

Patient data is isolated by doctor:

```javascript
match /patients/{patientId} {
  allow read, write: if request.auth != null &&
    (resource.data.doctorUid == request.auth.uid || isAdmin());
}
```

### Public Route Safety

- Patient registration page only writes data (no read access to other patients)
- Doctor UID validated in Firestore before accepting submission
- No sensitive doctor data exposed beyond public profile fields

---

**Status**: ✅ Completed  
**Build**: ✅ Passing  
**TypeScript**: ✅ 0 Errors  
**Date**: November 1, 2025
