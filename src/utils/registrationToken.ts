import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Registration Token Interface
 * Represents a time-limited token for patient self-registration
 */
export interface RegistrationToken {
  id: string;
  doctorUid: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

/**
 * Token validity duration in milliseconds (15 minutes)
 */
const TOKEN_VALIDITY_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Generate a unique token ID based on doctor UID and current time window
 * Tokens are unique per 15-minute window
 * 
 * @param doctorUid - The doctor's UID
 * @returns A unique token ID
 */
export function generateTokenId(doctorUid: string): string {
  // Get current time in milliseconds
  const now = Date.now();
  
  // Calculate the start of the current 15-minute window
  // This ensures the same token is generated within the same 15-minute period
  const windowStart = Math.floor(now / TOKEN_VALIDITY_MS) * TOKEN_VALIDITY_MS;
  
  // Combine doctor UID with time window to create unique token
  return `${doctorUid}_${windowStart}`;
}

/**
 * Create a new registration token in Firestore
 * If a token already exists for the current time window, it will be updated (refreshed)
 * This is expected behavior - tokens are deterministic within 15-minute windows
 * 
 * @param doctorUid - The doctor's UID
 * @returns The token ID
 */
export async function createRegistrationToken(doctorUid: string): Promise<string> {
  try {
    const tokenId = generateTokenId(doctorUid);
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + TOKEN_VALIDITY_MS);
    
    const tokenData: RegistrationToken = {
      id: tokenId,
      doctorUid,
      createdAt: now,
      expiresAt,
    };
    
    console.log('Creating/updating registration token:', { tokenId, doctorUid });
    
    const tokenRef = doc(db, 'registrationTokens', tokenId);
    // Using merge: true allows both creation and updates
    // This handles regenerating the same token within a 15-minute window
    await setDoc(tokenRef, tokenData, { merge: true });
    
    console.log('Registration token ready:', tokenId);
    
    return tokenId;
  } catch (error) {
    console.error('Error creating/updating registration token:', error);
    throw error;
  }
}

/**
 * Validate a registration token
 * Checks if token exists and hasn't expired
 * 
 * @param tokenId - The token ID to validate
 * @returns Object containing validation status, doctor UID if valid, and error message if invalid
 */
export async function validateRegistrationToken(
  tokenId: string
): Promise<{ isValid: boolean; doctorUid?: string; error?: string }> {
  try {
    const tokenRef = doc(db, 'registrationTokens', tokenId);
    const tokenDoc = await getDoc(tokenRef);
    
    if (!tokenDoc.exists()) {
      return {
        isValid: false,
        error: 'Invalid registration link. Please request a new link from your doctor.',
      };
    }
    
    const tokenData = tokenDoc.data() as RegistrationToken;
    const now = Timestamp.now();
    
    // Check if token has expired
    if (tokenData.expiresAt.toMillis() < now.toMillis()) {
      return {
        isValid: false,
        error: 'This registration link has expired. Please request a new link from your doctor.',
      };
    }
    
    return {
      isValid: true,
      doctorUid: tokenData.doctorUid,
    };
  } catch (error) {
    console.error('Error validating token:', error);
    return {
      isValid: false,
      error: 'Failed to validate registration link. Please try again.',
    };
  }
}

/**
 * Get the remaining time until token expiration in minutes
 * 
 * @param expiresAt - The expiration timestamp
 * @returns Remaining minutes
 */
export function getTokenRemainingMinutes(expiresAt: Timestamp): number {
  const now = Date.now();
  const expiresAtMs = expiresAt.toMillis();
  const remainingMs = expiresAtMs - now;
  
  return Math.max(0, Math.ceil(remainingMs / 60000)); // Convert to minutes
}

/**
 * Format token expiration time for display
 * 
 * @param expiresAt - The expiration timestamp
 * @returns Formatted string like "5 minutes" or "Expired"
 */
export function formatTokenExpiration(expiresAt: Timestamp): string {
  const minutes = getTokenRemainingMinutes(expiresAt);
  
  if (minutes === 0) {
    return 'Expired';
  } else if (minutes === 1) {
    return '1 minute';
  } else {
    return `${minutes} minutes`;
  }
}
