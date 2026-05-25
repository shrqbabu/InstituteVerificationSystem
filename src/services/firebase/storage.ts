/**
 * Firebase Storage Service
 * Handle file uploads for photos and PDFs
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from 'firebase/storage';
import { storage, STORAGE_PATHS } from './config';

// ============================================================
// Upload Photo
// ============================================================
export const uploadStudentPhoto = async (
  localUri: string,
  certificateId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const response = await fetch(localUri);
    const blob = await response.blob();

    const fileName = `${STORAGE_PATHS.PHOTOS}/${certificateId}_photo_${Date.now()}.jpg`;
    const storageRef = ref(storage, fileName);

    if (onProgress) {
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, blob);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = 
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          reject,
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });
    } else {
      const snapshot = await uploadBytes(storageRef, blob);
      return await getDownloadURL(snapshot.ref);
    }
  } catch (error: any) {
    throw new Error(`Photo upload failed: ${error.message}`);
  }
};

// ============================================================
// Upload PDF
// ============================================================
export const uploadCertificatePDF = async (
  pdfBase64: string,
  certificateId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const fileName = `${STORAGE_PATHS.PDFS}/${certificateId}_${Date.now()}.pdf`;
    const storageRef = ref(storage, fileName);

    // Convert base64 to blob
    const byteCharacters = atob(pdfBase64.split(',')[1] || pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const snapshot = await uploadBytes(storageRef, blob);
    return await getDownloadURL(snapshot.ref);
  } catch (error: any) {
    throw new Error(`PDF upload failed: ${error.message}`);
  }
};

// ============================================================
// Delete File from Storage
// ============================================================
export const deleteStorageFile = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn('Failed to delete file from storage:', error);
  }
};
