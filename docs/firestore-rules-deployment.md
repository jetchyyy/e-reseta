# Deploying Firestore Security Rules - Quick Guide

## Problem

You're getting "Missing or insufficient permissions" errors when trying to access patient data because Firestore security rules haven't been deployed yet.

## Solution Options

### Option 1: Deploy via Firebase Console (Recommended - Fastest)

1. **Open Firebase Console**

   - Go to: https://console.firebase.google.com/project/e-reseta/firestore/rules

2. **Copy the rules** from `firestore.rules` file in your project root

3. **Paste and Publish**

   - Paste the rules into the web editor
   - Click "Publish" button

4. **Verify**
   - Refresh your E-Reseta app
   - Try adding/viewing patients again

---

### Option 2: Fix Firebase CLI Permissions

If you want to deploy via command line in the future:

1. **Check Project Access**

   ```powershell
   firebase projects:list
   ```

2. **If `e-reseta` is listed**, you may need Owner/Editor role:

   - Ask the project owner to grant you "Editor" or "Owner" role
   - Go to: https://console.firebase.google.com/project/e-reseta/settings/iam

3. **Then deploy**:
   ```powershell
   firebase deploy --only firestore:rules
   ```

---

### Option 3: Temporary Open Rules (For Development ONLY)

⚠️ **WARNING: UNSAFE - Only for local testing!**

If you need to test immediately and can't access the console:

1. Open Firebase Console: https://console.firebase.google.com/project/e-reseta/firestore/rules

2. Temporarily use these rules (VERY PERMISSIVE):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **IMPORTANT**: Replace with proper rules from `firestore.rules` file before deploying to production!

---

## Current Production-Ready Rules

Your `firestore.rules` file contains the correct, secure rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Templates collection - users can read/write their own templates
    match /templates/{templateId} {
      allow read, write: if isSignedIn() &&
                            request.resource.data.doctorUid == request.auth.uid;
      allow read: if resource.data.doctorUid == request.auth.uid;
    }

    // Prescriptions collection - users can read/write their own prescriptions
    match /prescriptions/{prescriptionId} {
      allow create: if isSignedIn() &&
                       request.resource.data.doctorUid == request.auth.uid;
      allow read, update, delete: if isSignedIn() &&
                                     resource.data.doctorUid == request.auth.uid;
    }

    // Patients collection - doctors can read/write their own patients
    match /patients/{patientId} {
      allow create: if isSignedIn() &&
                       request.resource.data.doctorUid == request.auth.uid;
      allow read, update, delete: if isSignedIn() &&
                                     resource.data.doctorUid == request.auth.uid;
    }
  }
}
```

---

## Security Features

These rules ensure:

✅ **Authentication Required** - Users must be signed in  
✅ **Data Isolation** - Doctors can only access their own data  
✅ **Ownership Validation** - `doctorUid` must match authenticated user  
✅ **CRUD Protection** - Create, Read, Update, Delete all require proper ownership

---

## After Deploying Rules

Once the rules are deployed, your app will work correctly:

1. ✅ Patients page will load patient list
2. ✅ Add patient form will save data
3. ✅ Edit/Delete operations will work
4. ✅ Search and filter will function
5. ✅ Create prescription from patient will work

---

## Quick Test

After deploying rules, test in your app:

1. **Navigate to**: `/patients`
2. **Click**: "Add Patient"
3. **Fill form** with test data
4. **Save** - Should see success message
5. **Verify** - Patient should appear in list

If you still see permission errors after deploying rules, check:

- User is authenticated (signed in)
- `doctorUid` field matches current user's UID

---

## Files Created for Firebase Deployment

I've created these files in your project:

- ✅ `firebase.json` - Firebase project configuration
- ✅ `.firebaserc` - Project alias configuration
- ✅ `firestore.indexes.json` - Firestore indexes (for complex queries)
- ✅ `firestore.rules` - Security rules (already existed)

These files are ready for future deployments via CLI once you have proper permissions.
