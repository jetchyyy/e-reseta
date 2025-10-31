# Patients Management Feature

## Overview

The Patients Management system allows doctors to maintain comprehensive records of their patients, including demographic information, medical history, allergies, chronic conditions, and emergency contacts. Patients can then be quickly selected when creating prescriptions.

## Features

### 1. Patient Records Management

#### Basic Information

- **Name**: First name, middle name (optional), and last name
- **Date of Birth**: Auto-calculates age
- **Gender**: Male, Female, or Other
- **Age**: Automatically calculated from date of birth

#### Contact Information

- **Phone Number**: Required, validated for Philippine format (09XX-XXX-XXXX)
- **Email Address**: Optional, validated format
- **Complete Address**: Required field

#### Medical Information

- **Blood Type**: A+, A-, B+, B-, AB+, AB-, O+, O-
- **Allergies**: Free text field for documenting allergies (e.g., Penicillin, Peanuts)
- **Chronic Conditions**: Multi-line text for ongoing health conditions
- **Current Medications**: List of medications patient is currently taking

#### Emergency Contact

- **Contact Name**: Emergency contact person
- **Contact Phone**: Emergency contact phone number (validated)

#### Additional Notes

- Free-form text area for any other relevant patient information

### 2. Patient List View

- **Search Functionality**: Search by name, phone number, or email
- **Card-Based Display**: Each patient shown in a card with:
  - Patient initials avatar (gradient background)
  - Full name and basic info (age, gender)
  - Contact details (phone, email)
  - Allergy warnings (highlighted in red)
  - Quick action buttons

### 3. Patient Actions

#### View Patient Details

- Opens a modal with complete patient information
- Organized by sections (Contact, Medical, Emergency Contact, Notes)
- Color-coded medical alerts (allergies, chronic conditions, medications)

#### Edit Patient

- Pre-fills form with existing patient data
- All fields editable
- Validation applied on save

#### Delete Patient

- Confirmation dialog before deletion
- Permanently removes patient from database

#### Create Prescription

- Stores patient data in session storage
- Redirects to prescription generation page
- Patient information auto-populated in prescription form

## Technical Implementation

### Data Model

```typescript
interface Patient {
  id?: string; // Firestore document ID
  firstName: string; // Required
  lastName: string; // Required
  middleName?: string; // Optional
  dateOfBirth: string; // Required (ISO date format)
  age: number; // Auto-calculated
  gender: "Male" | "Female" | "Other"; // Required
  email?: string; // Optional, validated
  phone: string; // Required, validated
  address: string; // Required
  allergies?: string; // Optional
  chronicConditions?: string; // Optional
  currentMedications?: string; // Optional
  bloodType?: string; // Optional
  emergencyContactName?: string; // Optional
  emergencyContactPhone?: string; // Optional, validated
  notes?: string; // Optional
  createdAt?: Timestamp; // Auto-generated
  updatedAt?: Timestamp; // Auto-updated
  doctorUid: string; // Required (owner)
}
```

### Firestore Structure

```
/patients/{patientId}
  ├── firstName: string
  ├── lastName: string
  ├── middleName: string
  ├── dateOfBirth: string
  ├── age: number
  ├── gender: string
  ├── email: string
  ├── phone: string
  ├── address: string
  ├── allergies: string
  ├── chronicConditions: string
  ├── currentMedications: string
  ├── bloodType: string
  ├── emergencyContactName: string
  ├── emergencyContactPhone: string
  ├── notes: string
  ├── createdAt: Timestamp
  ├── updatedAt: Timestamp
  └── doctorUid: string (indexed)
```

### Security Rules

Patients collection is protected with the following rules:

```javascript
match /patients/{patientId} {
  // Allow creation if the doctor UID matches the authenticated user
  allow create: if isSignedIn() &&
                   request.resource.data.doctorUid == request.auth.uid;

  // Allow read, update, delete if the patient belongs to the authenticated doctor
  allow read, update, delete: if isSignedIn() &&
                                 resource.data.doctorUid == request.auth.uid;
}
```

## Validation

### Required Fields

- First Name (must be valid name format)
- Last Name (must be valid name format)
- Date of Birth (must be a valid date, not in the future)
- Gender (must be Male, Female, or Other)
- Phone Number (Philippine format validation)
- Address (non-empty string)

### Optional Fields (with validation if provided)

- Email (valid email format)
- Emergency Contact Phone (Philippine format validation)

### Auto-Calculated Fields

- **Age**: Automatically calculated from date of birth
  - Takes into account month and day to ensure accuracy
  - Updates when date of birth is changed

## Healthcare Design System

The Patients Management component follows the E-Reseta healthcare design aesthetic:

### Colors Used

- **Primary Navy** (#1D3557): Headers, primary buttons
- **Steel Blue** (#457B9D): Secondary elements, text accents
- **Sky Cyan** (#A8DADC): Highlights, borders
- **Clinical White** (#F1FAEE): Backgrounds
- **Rose** (#E11D48): Allergy warnings, delete actions
- **Emerald** (#059669): Success states, Create Rx button

### Component Styling

- **Cards**: White background, soft shadows, rounded-2xl corners
- **Buttons**: Gradient backgrounds, hover scale effects
- **Forms**: Clean inputs with Steel Blue focus rings
- **Modals**: Backdrop blur, centered with soft shadows

## User Experience Features

### 1. Responsive Design

- Mobile-first approach
- Stacked layout on small screens
- 2-column grid on tablets
- 3-column grid on desktops

### 2. Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- Focus indicators on all interactive elements
- ARIA labels for screen readers
- Semantic HTML structure

### 3. Loading States

- Skeleton loaders while fetching data
- Loading spinner with branded animation
- Smooth transitions between states

### 4. Error Handling

- Form validation with inline error messages
- Success/error modals for operations
- Graceful handling of network errors
- Console logging for debugging

### 5. Search & Filter

- Real-time search as user types
- Searches across: first name, last name, phone, email
- Case-insensitive matching
- Instant results update

## Integration with Prescription Generation

When "Create Prescription" is clicked for a patient:

1. Patient data is stored in `sessionStorage` with key `selectedPatient`
2. User is redirected to `/generate-prescription`
3. GeneratePrescription component can retrieve patient data:

```typescript
const patientData = sessionStorage.getItem("selectedPatient");
if (patientData) {
  const patient = JSON.parse(patientData);
  // Auto-populate patient fields
}
```

4. After prescription is created, session storage can be cleared:

```typescript
sessionStorage.removeItem("selectedPatient");
```

## File Structure

```
src/
├── components/
│   └── reusable/
│       └── PatientsManagement.tsx    # Main component (980 lines)
├── pages/
│   └── LandingPage.tsx               # Updated with Patients card
└── App.tsx                           # Added /patients route
```

## Navigation

### From Landing Page

- New "Patients" card in action grid
- Icon: Multiple people icon
- Color: Steel Blue border with gradient avatar icon
- Click navigates to `/patients`

### Back Navigation

- "Back" button in header returns to previous page
- Browser back button supported

## Future Enhancements

### Priority 1 (High Impact)

- [ ] Patient photo upload
- [ ] Export patient list to CSV/PDF
- [ ] Bulk import patients from CSV
- [ ] Patient prescription history view
- [ ] Patient appointment scheduling

### Priority 2 (Medium Impact)

- [ ] Advanced search filters (age range, blood type, etc.)
- [ ] Sort options (by name, age, recent, etc.)
- [ ] Patient tags/categories
- [ ] Patient archive functionality
- [ ] Patient statistics dashboard

### Priority 3 (Nice to Have)

- [ ] Patient consent forms
- [ ] Lab results attachment
- [ ] Medical imaging upload
- [ ] Patient portal for viewing own records
- [ ] SMS/Email notifications to patients

## Testing Checklist

### Form Validation

- [x] First name required and validates format
- [x] Last name required and validates format
- [x] Date of birth required and not in future
- [x] Age auto-calculates correctly
- [x] Phone number validates Philippine format
- [x] Email validates format (if provided)
- [x] Emergency contact phone validates (if provided)
- [x] Address required

### CRUD Operations

- [x] Create new patient
- [x] Read patient list
- [x] Update existing patient
- [x] Delete patient (with confirmation)
- [x] Search patients

### UI/UX

- [x] Loading state displays while fetching
- [x] Success modal on save/delete
- [x] Error modal on failures
- [x] Form resets after save/cancel
- [x] Responsive design on all screen sizes
- [x] Allergy warnings highlighted
- [x] Avatar initials display correctly

### Integration

- [x] Patient data passed to prescription generation
- [x] Session storage works correctly
- [x] Navigation flows work
- [x] Back button functions

### Security

- [x] Firestore rules prevent unauthorized access
- [x] Only doctor's own patients visible
- [x] Cannot modify other doctors' patients

## Performance Considerations

### Optimizations Implemented

- Firestore query indexed by doctorUid
- Ordered by lastName for faster sorting
- Client-side search to reduce database queries
- Lazy loading with skeleton states

### Future Optimizations

- Pagination for large patient lists
- Virtual scrolling for 100+ patients
- Debounced search queries
- Cached patient data

## Deployment Notes

### Firebase Setup Required

1. Deploy firestore.rules to Firebase:

   ```bash
   firebase deploy --only firestore:rules
   ```

2. Create composite index for patients collection:
   - Field: doctorUid (Ascending)
   - Field: lastName (Ascending)

### Environment Variables

No new environment variables required. Uses existing Firebase config.

## Support & Maintenance

### Common Issues

**Issue**: Patients not loading

- Check: User is authenticated
- Check: doctorUid is set correctly
- Check: Firestore rules deployed

**Issue**: Validation errors

- Check: Phone number format (09XX-XXX-XXXX)
- Check: Email format (if provided)
- Check: Date of birth is valid date

**Issue**: Create Prescription button doesn't work

- Check: sessionStorage is enabled
- Check: /generate-prescription route exists
- Check: Navigation permissions

### Debugging

Enable verbose logging:

```typescript
console.log("Patients loaded:", patients);
console.log("Current user:", currentUser);
console.log("Form errors:", formErrors);
```

Check Firestore operations in Firebase Console > Firestore > Usage tab.

## Version History

### v1.0.0 (Current)

- Initial release
- Full CRUD operations
- Search functionality
- Healthcare design system
- Responsive layout
- Integration with prescription generation
- Firestore security rules

---

**Component**: `src/components/reusable/PatientsManagement.tsx`  
**Route**: `/patients`  
**Authentication**: Required  
**Created**: 2025-11-01  
**Last Updated**: 2025-11-01
