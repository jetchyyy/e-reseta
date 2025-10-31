# Prescription-Patient Linking Troubleshooting Guide

**Date**: November 1, 2025  
**Issue**: Prescriptions not showing in patient modal  
**Status**: 🔍 Debugging in progress

## Debug Logs Added

I've added console logging to help diagnose the issue. When you test the prescription creation flow, you'll see these logs in the browser console:

### 1. Loading Patient Data
```
📋 Loading patient data: { id: "abc123", firstName: "Juan", ... }
📋 Patient ID: "abc123"
```

### 2. Saving Prescription
```
💊 Saving prescription with patientId: "abc123"
💊 Prescription data to save: { doctorId: "...", patientId: "abc123", ... }
```

### 3. Querying Prescriptions
```
🔍 Fetching prescriptions for patientId: "abc123"
📄 Found prescription: "prescription-id-1" { patientId: "abc123", ... }
✅ Total prescriptions found: 1
```

## Testing Steps

Please follow these steps to help identify the issue:

### Step 1: Create a Prescription

1. Go to **Patients Page**
2. Click **Create Prescription** on any patient card
3. **Open Browser Console** (F12 or Right-click → Inspect → Console)
4. Look for these logs:
   ```
   📋 Loading patient data: ...
   📋 Patient ID: ...
   ```
5. **Check**: Is the Patient ID showing as `undefined` or `null`?

### Step 2: Save the Prescription

1. Fill out the prescription form
2. Click **Save Prescription**
3. Look for these logs:
   ```
   💊 Saving prescription with patientId: ...
   💊 Prescription data to save: ...
   ```
4. **Check**: Is `patientId` in the prescription data showing as `undefined` or `null`?

### Step 3: View Prescription History

1. Go back to **Patients Page**
2. Click on the **same patient** you created the prescription for
3. Click the **Prescriptions** tab in the modal
4. Look for these logs:
   ```
   🔍 Fetching prescriptions for patientId: ...
   📄 Found prescription: ...
   ✅ Total prescriptions found: ...
   ```
5. **Check**: 
   - Is the `patientId` matching the patient's ID?
   - Are any prescriptions found?
   - If found, are they displaying in the UI?

## Possible Issues & Solutions

### Issue 1: Patient ID is `undefined`

**Symptoms**: Logs show `📋 Patient ID: undefined`

**Cause**: Patient object doesn't have an `id` field when stored in sessionStorage

**Solution**: Check how patients are loaded in `usePatients.ts`:

```typescript
// In usePatients.ts - loadPatients function
const patientsData = querySnapshot.docs.map(doc => ({
  id: doc.id,  // ← Ensure this is present
  ...doc.data(),
})) as Patient[];
```

**Fix**: Ensure patient ID is mapped from Firestore document ID

### Issue 2: `patientId` is `null` when saving

**Symptoms**: Logs show `💊 Saving prescription with patientId: null`

**Cause**: `selectedPatientId` state is not being set correctly

**Possible Reasons**:
1. Patient object in sessionStorage doesn't have `id` field
2. `setSelectedPatientId(patient.id)` is being called with `undefined`
3. State is being cleared before save

**Fix**: Verify patient object structure in sessionStorage:
```javascript
// In browser console, after clicking "Create Prescription":
JSON.parse(sessionStorage.getItem('selectedPatient'))
// Should show: { id: "...", firstName: "...", ... }
```

### Issue 3: Query returns no results

**Symptoms**: Logs show `✅ Total prescriptions found: 0`

**Possible Causes**:
1. Prescriptions were saved with `patientId: null`
2. Patient ID in query doesn't match saved prescription
3. Firestore index not created

**Check Firestore Console**:
1. Go to Firebase Console → Firestore Database
2. Open `prescriptions` collection
3. Check a prescription document
4. Verify it has `patientId` field with correct value

**Fix**: If prescriptions exist without `patientId`, you'll need to:
- Delete old test prescriptions
- Create new prescriptions (they should now have `patientId`)

### Issue 4: Firestore Index Missing

**Symptoms**: Console shows error like "The query requires an index"

**Solution**: 
1. Click the link in the error message (creates index automatically)
2. Wait 1-2 minutes for index to build
3. Try again

## Manual Firestore Check

### Check Patient Document

1. Firebase Console → Firestore Database → `patients` collection
2. Open any patient document
3. Verify structure:
   ```json
   {
     "id": "(auto-generated)",
     "firstName": "Juan",
     "lastName": "Dela Cruz",
     "age": 35,
     "doctorUid": "abc123xyz",
     ...
   }
   ```
4. **Copy the document ID** (e.g., `patient-abc-123`)

### Check Prescription Document

1. Firebase Console → Firestore Database → `prescriptions` collection
2. Open any prescription document
3. Verify structure:
   ```json
   {
     "doctorId": "abc123xyz",
     "patientId": "patient-abc-123",  ← Should match patient document ID
     "patientInfo": {
       "name": "Juan Dela Cruz",
       "age": "35",
       ...
     },
     "medications": [...],
     "createdAt": {...}
   }
   ```

### Verify Match

**The `patientId` in the prescription should exactly match the patient's document ID.**

Example:
- Patient document ID: `KjH8fGt3NmP9qLr2Sw5x`
- Prescription `patientId`: `KjH8fGt3NmP9qLr2Sw5x` ✅ (match!)

If they don't match, the query won't find the prescription.

## Code Verification Checklist

### ✅ PatientsPage.tsx - handleCreatePrescription
```typescript
const handleCreatePrescription = (patient: Patient) => {
  sessionStorage.setItem('selectedPatient', JSON.stringify(patient));
  navigate('/generate-prescription');
};
```

**Verify**: Patient object has `id` field

### ✅ GeneratePrescription.tsx - loadPatientData
```typescript
const patient = JSON.parse(storedPatient);
console.log('📋 Patient ID:', patient.id);  // ← Should not be undefined
setSelectedPatientId(patient.id);
```

**Verify**: `patient.id` is not undefined

### ✅ GeneratePrescription.tsx - handleSavePrescription
```typescript
const prescriptionData = {
  doctorId: currentUser.uid,
  patientId: selectedPatientId,  // ← Should not be null
  patientInfo,
  // ...
};
```

**Verify**: `selectedPatientId` is set before save

### ✅ usePatientPrescriptions.ts - query
```typescript
const q = query(
  prescriptionsRef,
  where('patientId', '==', patientId),  // ← patientId must match
  orderBy('createdAt', 'desc')
);
```

**Verify**: Query uses correct field name

## Expected Console Output (Working Flow)

```
// Step 1: Click "Create Prescription"
📋 Loading patient data: {
  id: "KjH8fGt3NmP9qLr2Sw5x",
  firstName: "Juan",
  lastName: "Dela Cruz",
  age: 35,
  // ...
}
📋 Patient ID: "KjH8fGt3NmP9qLr2Sw5x"

// Step 2: Save prescription
💊 Saving prescription with patientId: "KjH8fGt3NmP9qLr2Sw5x"
💊 Prescription data to save: {
  doctorId: "abc123xyz",
  patientId: "KjH8fGt3NmP9qLr2Sw5x",
  patientInfo: { name: "Juan Dela Cruz", ... },
  medications: [...],
  // ...
}

// Step 3: Open patient modal → Prescriptions tab
🔍 Fetching prescriptions for patientId: "KjH8fGt3NmP9qLr2Sw5x"
📄 Found prescription: "prescription-id-1" {
  patientId: "KjH8fGt3NmP9qLr2Sw5x",
  medications: [...],
  // ...
}
✅ Total prescriptions found: 1
```

## What to Report

After testing, please share:

1. **Console Logs**: Copy all logs starting with 📋, 💊, or 🔍
2. **Patient ID**: What was the patient's ID?
3. **Prescription Data**: Did it save with `patientId`?
4. **Query Result**: How many prescriptions were found?
5. **Firestore Screenshot**: Show prescription document from Firebase Console

## Quick Fix: Clear Old Data

If old prescriptions exist without `patientId`:

1. **Delete old prescriptions**:
   - Firebase Console → Firestore → `prescriptions` collection
   - Delete all test prescriptions

2. **Create new prescription**:
   - Go to Patients Page
   - Click "Create Prescription"
   - Save prescription
   - Check console logs

3. **Verify in Firestore**:
   - New prescription should have `patientId` field

## Next Steps

Once you test and share the console logs, I can:
1. Identify exactly where the data is being lost
2. Provide a targeted fix
3. Ensure prescriptions show up correctly

---

**Files with Debug Logs**:
- `src/components/reusable/GeneratePrescription.tsx` (lines 67, 69, 272, 276)
- `src/hooks/usePatientPrescriptions.ts` (lines 36, 46-47, 54)

**Build Status**: ✅ Successful (898.20 kB with debug logs)
