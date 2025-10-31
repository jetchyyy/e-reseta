# Registration Token System - Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: "Missing or insufficient permissions" when generating link

#### Error Message

```
FirebaseError: Missing or insufficient permissions
Error in: PatientsPage.tsx:79 handleGenerateLink
```

#### Root Cause

Firestore security rules don't allow the authenticated doctor to create **or update** tokens in the `registrationTokens` collection.

**Why update is needed**: When you generate a link multiple times within the same 15-minute window, the system tries to **update** the existing token (same token ID), not create a new one. This is by design for token efficiency.

#### Solution

**Fixed in latest deployment** ✅

The issue was in `firestore.rules`:

```javascript
// ❌ WRONG: Only allows create, not update
allow create: if request.auth != null &&
  request.resource.data.doctorUid == request.auth.uid;

// ✅ CORRECT: Allows both create and update
allow create, update: if request.auth != null &&
  request.resource.data.doctorUid == request.auth.uid;
```

**Why this matters**:

- **First generation**: Creates new token → needs `create` permission
- **Second generation (same window)**: Updates existing token → needs `update` permission
- **Third generation (new window)**: Creates new token → needs `create` permission

**Deployment:**

```bash
firebase deploy --only firestore:rules
```

**Verification:**

1. Log in as a doctor
2. Navigate to Patients page
3. Click "Generate Link" (**first time**)
4. ✅ Token created successfully
5. Click "Generate Link" (**second time**, within 15 min)
6. ✅ Token updated successfully (same token ID)
7. Check browser console for:
   ```
   Creating/updating registration token: { tokenId: "...", doctorUid: "..." }
   Registration token ready: abc123_1730462400000
   ```

---

### Issue 2: Token validation fails even with valid token

#### Error Message

```
"Invalid registration link" or "This registration link has expired"
```

#### Possible Causes

1. **Token not found in Firestore** - Check if token document exists
2. **Token expired** - Check if `expiresAt` timestamp is in the past
3. **Network error** - Firestore connection issue

#### Solution

**Check Firestore Console:**

1. Go to Firebase Console → Firestore Database
2. Navigate to `registrationTokens` collection
3. Verify token document exists with correct structure:
   ```javascript
   {
     id: "doctorUid_timestamp",
     doctorUid: "actual-doctor-uid",
     createdAt: Timestamp,
     expiresAt: Timestamp
   }
   ```

**Check Browser Console:**
Look for these logs:

```
Creating registration token: { tokenId: "...", doctorUid: "..." }
Registration token created successfully: ...
```

**Test Token Expiration:**

```typescript
// In browser console
const token = await db.collection("registrationTokens").doc("TOKEN_ID").get();
const data = token.data();
console.log("Expires at:", new Date(data.expiresAt.toMillis()));
console.log("Now:", new Date());
console.log("Is expired:", data.expiresAt.toMillis() < Date.now());
```

---

### Issue 3: Patient can't access registration link (incognito mode)

#### Error Message

```
FirebaseError: Missing or insufficient permissions
Error loading doctor info
```

#### Root Cause

Firestore rules don't allow public read of user documents.

#### Solution

**Fixed in latest deployment** ✅

Updated `users` collection rules:

```javascript
match /users/{userId} {
  // Allow public GET (single document read) for registration page
  allow get: if true;

  // Prevent listing all users (still protected)
  allow list: if isOwner(userId) || isAdmin();
}
```

**Verification:**

1. Open registration link in **incognito/private** window
2. ✅ Doctor info should load
3. ✅ Form should be displayed
4. Browser console should show: No permission errors

---

### Issue 4: Patient data saved with wrong doctor UID

#### Symptom

Patient data appears in wrong doctor's account or doesn't appear at all.

#### Root Cause

Using `doctorId` (token ID) instead of `actualDoctorUid` when saving patient data.

#### Solution

**Already implemented correctly** ✅

In `PatientSelfRegistration.tsx`:

```typescript
// ✅ CORRECT
const [actualDoctorUid, setActualDoctorUid] = useState<string>("");

// When validating token
const tokenValidation = await validateRegistrationToken(doctorId);
const realDoctorUid = tokenValidation.doctorUid!;
setActualDoctorUid(realDoctorUid);

// When saving patient
const patientData = {
  ...formData,
  doctorUid: actualDoctorUid, // ✅ Use actual UID, not token ID
  // ...
};
```

**Verification:**

1. Generate registration link
2. Patient submits form
3. Check Firestore → `patients` collection
4. Verify `doctorUid` field matches doctor's actual UID (not token ID)

---

### Issue 5: Same token generated multiple times creates duplicates

#### Symptom

Multiple token documents with similar IDs in Firestore.

#### Root Cause

Token generation algorithm not deterministic within 15-minute windows.

#### Solution

**Already implemented correctly** ✅

Tokens are deterministic:

```typescript
// Time window calculation (always same within 15 min)
const windowStart = Math.floor(now / TOKEN_VALIDITY_MS) * TOKEN_VALIDITY_MS;

// Token ID format
const tokenId = `${doctorUid}_${windowStart}`;

// Using merge: true prevents duplicates
await setDoc(tokenRef, tokenData, { merge: true });
```

**Verification:**

1. Generate link at 10:00 AM → Token A
2. Generate link at 10:05 AM → Token A (same)
3. Generate link at 10:14 AM → Token A (same)
4. Generate link at 10:16 AM → Token B (new window)

---

### Issue 6: Link works in regular browser but fails in incognito

#### Symptom

Registration form loads when logged in but fails in private/incognito mode.

#### Root Cause

Most likely a Firestore rule issue or authentication check in code.

#### Solution

**Check these points:**

1. **Firestore Rules** (should allow public access):

   ```javascript
   // Users collection
   allow get: if true; ✅

   // Registration tokens
   allow get: if true; ✅

   // Patients (creation only)
   allow create: if request.resource.data.doctorUid != null; ✅
   ```

2. **Code checks** (should NOT require auth):

   ```typescript
   // ❌ WRONG: Checking authentication
   if (!currentUser) return;

   // ✅ CORRECT: Only validate token
   const tokenValidation = await validateRegistrationToken(tokenId);
   if (!tokenValidation.isValid) return;
   ```

3. **Import Auth Context** (should NOT be imported in PatientSelfRegistration):

   ```typescript
   // ❌ WRONG: Using auth in public page
   import { useAuth } from "../auth/AuthContext";
   const { currentUser } = useAuth();

   // ✅ CORRECT: No auth needed
   // PatientSelfRegistration should work without authentication
   ```

---

### Issue 7: Token expires immediately or never expires

#### Symptom

- Token shows as expired right after creation, OR
- Token never expires even after 15+ minutes

#### Root Cause

Incorrect expiration calculation or timezone issues.

#### Solution

**Verify expiration calculation:**

```typescript
// In registrationToken.ts
const TOKEN_VALIDITY_MS = 15 * 60 * 1000; // ✅ 15 minutes

const now = Timestamp.now();
const expiresAt = Timestamp.fromMillis(now.toMillis() + TOKEN_VALIDITY_MS);
```

**Test in Browser Console:**

```javascript
// Get a token
const token = await db.collection("registrationTokens").doc("TOKEN_ID").get();
const data = token.data();

// Check times
const createdMs = data.createdAt.toMillis();
const expiresMs = data.expiresAt.toMillis();
const differenceMinutes = (expiresMs - createdMs) / 1000 / 60;

console.log("Created:", new Date(createdMs));
console.log("Expires:", new Date(expiresMs));
console.log("Duration:", differenceMinutes, "minutes"); // Should be 15
```

---

### Issue 8: 400 Bad Request when creating token

#### Error Message

```
POST https://firestore.googleapis.com/.../Write/channel 400 (Bad Request)
```

#### Possible Causes

1. **Invalid token data structure**
2. **Firestore rule rejection**
3. **Missing required fields**
4. **Invalid Timestamp format**

#### Solution

**Check token data structure:**

```typescript
// ✅ CORRECT structure
const tokenData: RegistrationToken = {
  id: tokenId,              // String
  doctorUid,                // String (must match auth.uid)
  createdAt: Timestamp.now(),   // Firestore Timestamp
  expiresAt: Timestamp.fromMillis(...), // Firestore Timestamp
};
```

**Check Firestore rule:**

```javascript
// Rule must allow the exact fields being saved
allow create: if request.auth != null &&
  request.resource.data.doctorUid == request.auth.uid;
```

**Verify in console:**

```javascript
console.log("Token data:", tokenData);
console.log("Doctor UID:", doctorUid);
console.log("Auth UID:", currentUser.uid);
console.log("Match:", doctorUid === currentUser.uid); // Must be true
```

---

## Debug Checklist

### When generating link fails:

- [ ] Check Firebase Console → Firestore Rules are deployed
- [ ] Check browser console for detailed error
- [ ] Verify user is authenticated (`currentUser` exists)
- [ ] Check `doctorUid` matches `currentUser.uid`
- [ ] Verify token data structure is correct
- [ ] Test with Firebase Firestore Rules Playground

### When validation fails:

- [ ] Check token exists in Firestore
- [ ] Verify `expiresAt` is in the future
- [ ] Check `doctorUid` field exists in token
- [ ] Verify network connectivity
- [ ] Check browser console for validation logs

### When patient submission fails:

- [ ] Verify `actualDoctorUid` is set correctly
- [ ] Check patient data includes `doctorUid` field
- [ ] Verify Firestore rule allows public creation
- [ ] Check all required fields are filled
- [ ] Test in incognito mode

---

## Firestore Rules - Current Configuration

```javascript
// Users - Public get, protected list
match /users/{userId} {
  allow get: if true;
  allow list: if isOwner(userId) || isAdmin();
  allow create: if isOwner(userId);
  allow update: if isOwner(userId) || isAdmin();
  allow delete: if false;
}

// Registration Tokens - Protected create/update, public get
match /registrationTokens/{tokenId} {
  // Allow both create and update (for refreshing tokens in same window)
  allow create, update: if request.auth != null &&
    request.resource.data.doctorUid == request.auth.uid;
  allow read: if request.auth != null && (
    resource.data.doctorUid == request.auth.uid || isAdmin()
  );
  allow get: if true;
  allow delete: if request.auth != null && (
    resource.data.doctorUid == request.auth.uid || isAdmin()
  );
}

// Patients - Public create, protected read
match /patients/{patientId} {
  allow create: if request.resource.data.doctorUid != null;
  allow read, update, delete: if request.auth != null && (
    resource.data.doctorUid == request.auth.uid || isAdmin()
  );
}
```

---

## Testing Steps

### Full Flow Test

1. **As Doctor (Authenticated):**

   ```
   ✅ Login to app
   ✅ Navigate to /patients
   ✅ Click "Generate Link"
   ✅ Verify modal shows link
   ✅ Copy link to clipboard
   ✅ Check Firestore for token document
   ```

2. **As Patient (Unauthenticated):**

   ```
   ✅ Open link in incognito/private browser
   ✅ Verify doctor name/credentials display
   ✅ Fill out registration form
   ✅ Submit form
   ✅ Verify success message
   ✅ Check Firestore patients collection
   ```

3. **Token Expiration Test:**
   ```
   ✅ Generate link
   ✅ Wait 16 minutes
   ✅ Try opening link
   ✅ Verify "Link expired" error
   ✅ Generate new link
   ✅ Verify new link works
   ```

---

## Quick Fixes

### Re-deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Clear Browser Cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Check Firebase Status

Visit: https://status.firebase.google.com/

### View Firestore Logs

Firebase Console → Firestore → Usage tab → View logs

---

## Support

If issues persist after trying these solutions:

1. **Check Documentation:**

   - `docs/time-based-registration-tokens.md`
   - `docs/patient-types-centralization.md`

2. **Review Code:**

   - `src/utils/registrationToken.ts`
   - `src/pages/PatientsPage.tsx`
   - `src/pages/PatientSelfRegistration.tsx`

3. **Firebase Console:**
   - Check Firestore rules simulator
   - Review usage/quota limits
   - Check security rules logs

---

**Last Updated**: November 1, 2025  
**Status**: ✅ All issues resolved and deployed
