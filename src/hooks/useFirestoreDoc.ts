import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '../firebase/config';

interface UseFirestoreDocOptions {
  // Whether to load the document on mount
  loadOnMount?: boolean;
  // Callback when document is loaded successfully
  onLoad?: (data: any) => void;
  // Callback when an error occurs
  onError?: (error: Error) => void;
}

interface UseFirestoreDocReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  exists: boolean;
  loadDocument: () => Promise<void>;
  saveDocument: (data: T) => Promise<void>;
  refreshDocument: () => Promise<void>;
}

/**
 * Custom hook for managing a single Firestore document
 * 
 * @example
 * const { data, loading, saveDocument } = useFirestoreDoc<ResetaTemplate>(
 *   'resetaTemplates',
 *   currentUser?.uid,
 *   { loadOnMount: true }
 * );
 */
export function useFirestoreDoc<T = DocumentData>(
  collectionName: string,
  documentId: string | undefined,
  options: UseFirestoreDocOptions = {}
): UseFirestoreDocReturn<T> {
  const { loadOnMount = true, onLoad, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);

  const loadDocument = useCallback(async () => {
    if (!documentId) {
      setError('Document ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const documentData = docSnap.data() as T;
        setData(documentData);
        setExists(true);
        onLoad?.(documentData);
      } else {
        setData(null);
        setExists(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load document';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      console.error('Error loading document:', err);
    } finally {
      setLoading(false);
    }
  }, [collectionName, documentId, onLoad, onError]);

  const saveDocument = useCallback(async (documentData: T) => {
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, collectionName, documentId);
      await setDoc(docRef, documentData as DocumentData);
      
      setData(documentData);
      setExists(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save document';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  }, [collectionName, documentId, onError]);

  const refreshDocument = useCallback(async () => {
    await loadDocument();
  }, [loadDocument]);

  // Load document on mount if enabled
  useEffect(() => {
    if (loadOnMount && documentId) {
      loadDocument();
    }
  }, [loadOnMount, documentId, loadDocument]);

  return {
    data,
    loading,
    error,
    exists,
    loadDocument,
    saveDocument,
    refreshDocument,
  };
}
