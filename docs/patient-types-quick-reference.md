# Patient Types Quick Reference

## Import Statements

### Import Patient Type

```typescript
import type { Patient } from "../types/patient";
```

### Import Form Data Type

```typescript
import type { PatientFormData } from "../types/patient";
```

### Import Constants

```typescript
import { BLOOD_TYPES, GENDER_OPTIONS } from "../types/patient";
```

### Import Multiple

```typescript
import type {
  Patient,
  PatientFormData,
  PatientValidationErrors,
} from "../types/patient";
import { BLOOD_TYPES, GENDER_OPTIONS } from "../types/patient";
```

## Patient Interface

### Full Type Definition

```typescript
interface Patient {
  // Firestore
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  doctorUid: string;

  // Required Basic Info
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  address: string;

  // Optional Info
  middleName?: string;
  email?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}
```

## Usage Examples

### Component Props

```typescript
interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
}
```

### State Management

```typescript
const [patient, setPatient] = useState<Patient | null>(null);
const [patients, setPatients] = useState<Patient[]>([]);
```

### Form State

```typescript
const [formData, setFormData] = useState<PatientFormData>({
  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  age: 0,
  gender: "Male",
  phone: "",
  address: "",
  // ... other fields
});
```

### Validation Errors

```typescript
const [errors, setErrors] = useState<PatientValidationErrors>({});

// Set specific field error
setErrors((prev) => ({ ...prev, firstName: "Required" }));

// Clear specific field error
setErrors((prev) => {
  const { firstName, ...rest } = prev;
  return rest;
});
```

### Blood Type Dropdown

```typescript
<select value={formData.bloodType}>
  <option value="">Select blood type</option>
  {BLOOD_TYPES.map((type) => (
    <option key={type} value={type}>
      {type}
    </option>
  ))}
</select>
```

### Gender Select

```typescript
<select value={formData.gender}>
  {GENDER_OPTIONS.map((option) => (
    <option key={option} value={option}>
      {option}
    </option>
  ))}
</select>
```

## Type Guards

### Check if Patient has ID (exists in Firestore)

```typescript
function hasId(patient: Patient): patient is Patient & { id: string } {
  return !!patient.id;
}
```

### Check if Patient has Complete Data

```typescript
function isComplete(patient: Patient): boolean {
  return !!(
    patient.firstName &&
    patient.lastName &&
    patient.dateOfBirth &&
    patient.phone &&
    patient.address
  );
}
```

## Constants

### Blood Types

```typescript
BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
```

### Gender Options

```typescript
GENDER_OPTIONS = ["Male", "Female", "Other"];
```

## Common Patterns

### Creating New Patient

```typescript
const newPatient: PatientFormData = {
  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  age: 0,
  gender: "Male",
  email: "",
  phone: "",
  address: "",
  allergies: "",
  chronicConditions: "",
  currentMedications: "",
  bloodType: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  notes: "",
};
```

### Updating Existing Patient

```typescript
const updatedPatient: Patient = {
  ...existingPatient,
  firstName: "Updated Name",
  updatedAt: Timestamp.now(),
};
```

### Partial Updates

```typescript
const updates: Partial<Patient> = {
  phone: "09171234567",
  email: "new@email.com",
};

setPatient((prev) => (prev ? { ...prev, ...updates } : null));
```

### Converting to Form Data

```typescript
function toFormData(patient: Patient): PatientFormData {
  const { id, createdAt, updatedAt, doctorUid, ...formData } = patient;
  return formData;
}
```

### Adding Firestore Metadata

```typescript
function toPatient(
  formData: PatientFormData,
  doctorUid: string
): Omit<Patient, "id"> {
  return {
    ...formData,
    doctorUid,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}
```

## Validation

### Required Fields Check

```typescript
const requiredFields: (keyof Patient)[] = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "age",
  "gender",
  "phone",
  "address",
];

function validateRequired(patient: PatientFormData): PatientValidationErrors {
  const errors: PatientValidationErrors = {};

  requiredFields.forEach((field) => {
    if (!patient[field]) {
      errors[field] = "This field is required";
    }
  });

  return errors;
}
```

### Age Calculation

```typescript
function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
```

## Firestore Operations

### Save Patient

```typescript
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";

async function savePatient(formData: PatientFormData, doctorUid: string) {
  const patientData = {
    ...formData,
    doctorUid,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await addDoc(collection(db, "patients"), patientData);
}
```

### Update Patient

```typescript
import { updateDoc, doc, Timestamp } from "firebase/firestore";

async function updatePatient(patientId: string, updates: Partial<Patient>) {
  const patientRef = doc(db, "patients", patientId);
  await updateDoc(patientRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}
```

### Query Patients

```typescript
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

async function getPatientsByDoctor(doctorUid: string): Promise<Patient[]> {
  const q = query(
    collection(db, "patients"),
    where("doctorUid", "==", doctorUid),
    orderBy("lastName", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Patient)
  );
}
```

---

**File**: `src/types/patient.ts`  
**Last Updated**: November 1, 2025
