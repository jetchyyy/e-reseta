import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

interface Prescription {
  id: string;
  patientName: string;
  patientAge?: number;
  createdAt: any;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  diagnosis?: string;
  notes?: string;
}

export const usePatientPrescriptions = (patientId: string | undefined, doctorId?: string) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId || !doctorId) {
      setPrescriptions([]);
      setLoading(false);
      return;
    }

    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching prescriptions for patientId:', patientId, 'doctorId:', doctorId);

        const prescriptionsRef = collection(db, 'prescriptions');
        const q = query(
          prescriptionsRef,
          where('doctorId', '==', doctorId),
          where('patientId', '==', patientId)
        );

        const querySnapshot = await getDocs(q);
        const prescriptionData: Prescription[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('📄 Found prescription:', doc.id, data);
          prescriptionData.push({
            id: doc.id,
            ...data,
          } as Prescription);
        });

        // Sort in-memory instead of in Firestore query
        prescriptionData.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA; // Descending order (newest first)
        });

        console.log('✅ Total prescriptions found:', prescriptionData.length);
        setPrescriptions(prescriptionData);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('Failed to load prescriptions');
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [patientId, doctorId]);

  return { prescriptions, loading, error };
};
