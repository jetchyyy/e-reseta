import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, orderBy, where, limit as firestoreLimit } from 'firebase/firestore';
import type { DocumentData, QueryConstraint, OrderByDirection } from 'firebase/firestore';
import { db } from '../firebase/config';

interface UseFirestoreCollectionOptions {
  // Whether to load the collection on mount
  loadOnMount?: boolean;
  // Order by field
  orderByField?: string;
  // Order direction
  orderDirection?: OrderByDirection;
  // Limit number of documents
  limit?: number;
  // Where clauses
  whereConditions?: Array<{
    field: string;
    operator: '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
    value: any;
  }>;
  // Callback when collection is loaded successfully
  onLoad?: (data: any[]) => void;
  // Callback when an error occurs
  onError?: (error: Error) => void;
}

interface UseFirestoreCollectionReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  empty: boolean;
  count: number;
  loadCollection: () => Promise<void>;
  refreshCollection: () => Promise<void>;
}

/**
 * Custom hook for managing a Firestore collection
 * 
 * @example
 * const { data: prescriptions, loading } = useFirestoreCollection<Prescription>(
 *   'prescriptions',
 *   {
 *     loadOnMount: true,
 *     orderByField: 'createdAt',
 *     orderDirection: 'desc',
 *     whereConditions: [{ field: 'doctorId', operator: '==', value: currentUser?.uid }]
 *   }
 * );
 */
export function useFirestoreCollection<T = DocumentData>(
  collectionName: string,
  options: UseFirestoreCollectionOptions = {}
): UseFirestoreCollectionReturn<T> {
  const {
    loadOnMount = true,
    orderByField,
    orderDirection = 'asc',
    limit: limitCount,
    whereConditions = [],
    onLoad,
    onError,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(true);
  const [count, setCount] = useState(0);

  const loadCollection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query constraints
      const constraints: QueryConstraint[] = [];

      // Add where conditions
      whereConditions.forEach(({ field, operator, value }) => {
        constraints.push(where(field, operator, value));
      });

      // Add ordering
      if (orderByField) {
        constraints.push(orderBy(orderByField, orderDirection));
      }

      // Add limit
      if (limitCount) {
        constraints.push(firestoreLimit(limitCount));
      }

      const collectionRef = collection(db, collectionName);
      const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
      
      const querySnapshot = await getDocs(q);
      
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));

      setData(documents);
      setEmpty(documents.length === 0);
      setCount(documents.length);
      onLoad?.(documents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load collection';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      console.error('Error loading collection:', err);
    } finally {
      setLoading(false);
    }
  }, [collectionName, orderByField, orderDirection, limitCount, whereConditions, onLoad, onError]);

  const refreshCollection = useCallback(async () => {
    await loadCollection();
  }, [loadCollection]);

  // Load collection on mount if enabled
  useEffect(() => {
    if (loadOnMount) {
      loadCollection();
    }
  }, [loadOnMount, loadCollection]);

  return {
    data,
    loading,
    error,
    empty,
    count,
    loadCollection,
    refreshCollection,
  };
}
