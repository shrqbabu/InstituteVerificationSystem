/**
 * Firestore Database Service
 * All CRUD operations for certificates, users, and logs
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './config';
import { Certificate, CertificateFormData, VerificationLog, DownloadRecord, DashboardStats } from '../../types';

// ============================================================
// Certificate ID Generator
// ============================================================
export const generateCertificateId = (): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CERT-${year}-${timestamp}-${random}`;
};

// ============================================================
// CREATE Certificate
// ============================================================
export const createCertificate = async (
  formData: CertificateFormData,
  pdfUrl?: string,
  photoUrl?: string
): Promise<Certificate> => {
  try {
    const certificateId = generateCertificateId();
    
    const certificate: Omit<Certificate, 'id'> = {
      certificateId,
      studentName: formData.studentName.trim(),
      studentEmail: formData.studentEmail?.trim(),
      courseName: formData.courseName.trim(),
      courseCode: formData.courseCode?.trim(),
      issueDate: formData.issueDate,
      expiryDate: formData.expiryDate || undefined,
      duration: formData.duration.trim(),
      status: formData.status || 'valid',
      pdfUrl: pdfUrl || '',
      photoUrl: photoUrl || '',
      grade: formData.grade?.trim(),
      instructorName: formData.instructorName?.trim(),
      description: formData.description?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verifiedCount: 0,
      watermark: true,
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.CERTIFICATES),
      {
        ...certificate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );

    return { id: docRef.id, ...certificate };
  } catch (error: any) {
    throw new Error(`Failed to create certificate: ${error.message}`);
  }
};

// ============================================================
// READ - Get Single Certificate by Document ID
// ============================================================
export const getCertificateById = async (
  docId: string
): Promise<Certificate | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.CERTIFICATES, docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp 
        ? data.updatedAt.toDate().toISOString() 
        : data.updatedAt,
    } as Certificate;
  } catch (error: any) {
    throw new Error(`Failed to fetch certificate: ${error.message}`);
  }
};

// ============================================================
// READ - Verify Certificate by Certificate ID
// ============================================================
export const verifyCertificate = async (
  certificateId: string,
  method: 'manual' | 'qr' = 'manual'
): Promise<{ certificate: Certificate | null; found: boolean }> => {
  try {
    // Query Firestore for certificate with matching certificateId field
    const q = query(
      collection(db, COLLECTIONS.CERTIFICATES),
      where('certificateId', '==', certificateId.trim().toUpperCase())
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Log failed verification attempt
      await logVerification(certificateId, false, method);
      return { certificate: null, found: false };
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    const certificate: Certificate = {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : data.createdAt,
    } as Certificate;

    // Increment verified count
    await updateDoc(doc(db, COLLECTIONS.CERTIFICATES, docSnap.id), {
      verifiedCount: increment(1),
    });

    // Log successful verification
    await logVerification(certificateId, true, method);

    return { certificate, found: true };
  } catch (error: any) {
    throw new Error(`Verification failed: ${error.message}`);
  }
};

// ============================================================
// READ - Get All Certificates (Admin)
// ============================================================
export const getAllCertificates = async (
  limitCount: number = 100
): Promise<Certificate[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CERTIFICATES),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate().toISOString() 
          : data.updatedAt,
      } as Certificate;
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch certificates: ${error.message}`);
  }
};

// ============================================================
// UPDATE Certificate
// ============================================================
export const updateCertificate = async (
  docId: string,
  updates: Partial<CertificateFormData>,
  pdfUrl?: string,
  photoUrl?: string
): Promise<void> => {
  try {
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (pdfUrl) updateData.pdfUrl = pdfUrl;
    if (photoUrl) updateData.photoUrl = photoUrl;

    await updateDoc(
      doc(db, COLLECTIONS.CERTIFICATES, docId),
      updateData
    );
  } catch (error: any) {
    throw new Error(`Failed to update certificate: ${error.message}`);
  }
};

// ============================================================
// DELETE Certificate
// ============================================================
export const deleteCertificate = async (docId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CERTIFICATES, docId));
  } catch (error: any) {
    throw new Error(`Failed to delete certificate: ${error.message}`);
  }
};

// ============================================================
// Real-time Listener for Certificates
// ============================================================
export const subscribeToCertificates = (
  callback: (certificates: Certificate[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  const q = query(
    collection(db, COLLECTIONS.CERTIFICATES),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const certificates = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt,
        } as Certificate;
      });
      callback(certificates);
    },
    (error) => onError(new Error(error.message))
  );
};

// ============================================================
// LOG Verification
// ============================================================
export const logVerification = async (
  certificateId: string,
  success: boolean,
  method: 'manual' | 'qr'
): Promise<void> => {
  try {
    const log: VerificationLog = {
      certificateId,
      verifiedAt: new Date().toISOString(),
      success,
      method,
    };

    await addDoc(collection(db, COLLECTIONS.VERIFICATION_LOGS), {
      ...log,
      verifiedAt: serverTimestamp(),
    });
  } catch (error) {
    // Silent fail for logging - don't break verification flow
    console.warn('Failed to log verification:', error);
  }
};

// ============================================================
// LOG Download
// ============================================================
export const logDownload = async (
  certificateId: string,
  userId?: string
): Promise<void> => {
  try {
    const record: DownloadRecord = {
      certificateId,
      downloadedAt: new Date().toISOString(),
      userId,
    };

    await addDoc(collection(db, COLLECTIONS.DOWNLOADS), {
      ...record,
      downloadedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Failed to log download:', error);
  }
};

// ============================================================
// GET Dashboard Statistics
// ============================================================
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get all certificates
    const certSnapshot = await getDocs(
      query(collection(db, COLLECTIONS.CERTIFICATES), orderBy('createdAt', 'desc'))
    );

    const certificates = certSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as Certificate[];

    // Get verification logs count
    const verifySnapshot = await getDocs(
      collection(db, COLLECTIONS.VERIFICATION_LOGS)
    );

    // Get downloads count
    const downloadSnapshot = await getDocs(
      collection(db, COLLECTIONS.DOWNLOADS)
    );

    // Calculate course distribution
    const courseDistribution: { [key: string]: number } = {};
    certificates.forEach(cert => {
      courseDistribution[cert.courseName] = 
        (courseDistribution[cert.courseName] || 0) + 1;
    });

    return {
      totalCertificates: certificates.length,
      validCertificates: certificates.filter(c => c.status === 'valid').length,
      totalVerifications: verifySnapshot.size,
      totalDownloads: downloadSnapshot.size,
      recentCertificates: certificates.slice(0, 5),
      courseDistribution,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch statistics: ${error.message}`);
  }
};

// ============================================================
// Search Certificates
// ============================================================
export const searchCertificates = async (
  searchTerm: string,
  filterCourse?: string
): Promise<Certificate[]> => {
  try {
    let q = query(
      collection(db, COLLECTIONS.CERTIFICATES),
      orderBy('createdAt', 'desc')
    );

    if (filterCourse) {
      q = query(
        collection(db, COLLECTIONS.CERTIFICATES),
        where('courseName', '==', filterCourse),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    const allCerts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Certificate[];

    if (!searchTerm) return allCerts;

    // Client-side search for name and certificate ID
    const term = searchTerm.toLowerCase();
    return allCerts.filter(cert =>
      cert.studentName.toLowerCase().includes(term) ||
      cert.certificateId.toLowerCase().includes(term) ||
      cert.courseName.toLowerCase().includes(term)
    );
  } catch (error: any) {
    throw new Error(`Search failed: ${error.message}`);
  }
};
