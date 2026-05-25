/**
 * PDF Certificate Generator Service
 * Generates professional PDF certificates using expo-print
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Certificate } from '../../types';

// ============================================================
// Generate Certificate HTML
// ============================================================
const generateCertificateHTML = (certificate: Certificate): string => {
  const issueDate = new Date(certificate.issueDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const expiryDate = certificate.expiryDate
    ? new Date(certificate.expiryDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  // QR Code URL (using Google Charts API for QR)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=CERT-VERIFY:${certificate.certificateId}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate - ${certificate.studentName}</title>
  <style>
    /* ============================================================
       Certificate PDF Styles
       ============================================================ */
    
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=Roboto:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Roboto', sans-serif;
      background: #F0F0F0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .certificate-wrapper {
      width: 100%;
      max-width: 900px;
      position: relative;
    }
    
    .certificate {
      background: #FFFFFF;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
      page-break-inside: avoid;
    }
    
    /* Border Design */
    .border-outer {
      position: absolute;
      inset: 12px;
      border: 3px solid #1565C0;
      border-radius: 2px;
      pointer-events: none;
      z-index: 1;
    }
    
    .border-inner {
      position: absolute;
      inset: 18px;
      border: 1px solid #1565C0;
      border-radius: 1px;
      pointer-events: none;
      z-index: 1;
    }
    
    /* Corner Decorations */
    .corner {
      position: absolute;
      width: 50px;
      height: 50px;
      z-index: 2;
    }
    .corner-tl { top: 24px; left: 24px; border-top: 4px solid #F57C00; border-left: 4px solid #F57C00; }
    .corner-tr { top: 24px; right: 24px; border-top: 4px solid #F57C00; border-right: 4px solid #F57C00; }
    .corner-bl { bottom: 24px; left: 24px; border-bottom: 4px solid #F57C00; border-left: 4px solid #F57C00; }
    .corner-br { bottom: 24px; right: 24px; border-bottom: 4px solid #F57C00; border-right: 4px solid #F57C00; }
    
    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      font-weight: 900;
      color: rgba(21, 101, 192, 0.04);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
      font-family: 'Roboto', sans-serif;
      letter-spacing: 8px;
    }
    
    /* Content */
    .content {
      position: relative;
      z-index: 5;
      padding: 60px 80px;
    }
    
    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 2px solid rgba(21, 101, 192, 0.15);
    }
    
    .institute-logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #1565C0, #0D47A1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 24px;
      flex-shrink: 0;
    }
    
    .logo-text {
      color: white;
      font-size: 24px;
      font-weight: 900;
      font-family: 'Roboto', sans-serif;
    }
    
    .institute-info {
      text-align: left;
    }
    
    .institute-name {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 800;
      color: #1565C0;
      line-height: 1.2;
    }
    
    .institute-subtitle {
      font-size: 14px;
      color: #6B7280;
      font-weight: 400;
      margin-top: 4px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    /* Certificate Title */
    .cert-title-container {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .cert-label {
      font-size: 13px;
      font-weight: 600;
      color: #6B7280;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .cert-title {
      font-family: 'Playfair Display', serif;
      font-size: 48px;
      font-weight: 700;
      color: #1A1A2E;
      line-height: 1.1;
    }
    
    .cert-title span {
      color: #1565C0;
    }
    
    /* Divider */
    .divider {
      display: flex;
      align-items: center;
      margin: 24px 0;
    }
    
    .divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, #1565C0, transparent);
    }
    
    .divider-diamond {
      width: 10px;
      height: 10px;
      background: #F57C00;
      transform: rotate(45deg);
      margin: 0 16px;
    }
    
    /* Presented To */
    .presented-to {
      text-align: center;
      margin-bottom: 12px;
    }
    
    .presented-label {
      font-size: 14px;
      color: #6B7280;
      font-weight: 400;
      font-style: italic;
    }
    
    /* Student Name */
    .student-name {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 700;
      color: #1A1A2E;
      text-align: center;
      margin: 12px 0;
      font-style: italic;
    }
    
    /* Description */
    .description {
      text-align: center;
      font-size: 15px;
      color: #4B5563;
      line-height: 1.7;
      margin-bottom: 30px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .course-highlight {
      color: #1565C0;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
      font-size: 18px;
    }
    
    /* Certificate Details Grid */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 30px 0;
      background: linear-gradient(135deg, #F8FAFF, #EEF2FF);
      border-radius: 12px;
      padding: 24px;
      border: 1px solid rgba(21, 101, 192, 0.1);
    }
    
    .detail-item {
      text-align: center;
    }
    
    .detail-label {
      font-size: 11px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    
    .detail-value {
      font-size: 14px;
      font-weight: 700;
      color: #1A1A2E;
    }
    
    /* Grade Badge */
    .grade-badge {
      display: inline-block;
      background: linear-gradient(135deg, #1565C0, #0D47A1);
      color: white;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
    }
    
    /* Footer */
    .footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(21, 101, 192, 0.15);
    }
    
    /* Signatures */
    .signatures {
      display: flex;
      gap: 60px;
    }
    
    .signature-block {
      text-align: center;
    }
    
    .signature-line {
      width: 160px;
      height: 1px;
      background: #1A1A2E;
      margin-bottom: 8px;
    }
    
    .signature-label {
      font-size: 11px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .signature-name {
      font-size: 13px;
      font-weight: 600;
      color: #1A1A2E;
      margin-top: 2px;
    }
    
    /* QR Section */
    .qr-section {
      text-align: center;
    }
    
    .qr-image {
      width: 100px;
      height: 100px;
      border: 2px solid #E5E7EB;
      border-radius: 8px;
      padding: 4px;
      background: white;
    }
    
    .qr-label {
      font-size: 10px;
      color: #9CA3AF;
      margin-top: 6px;
      text-align: center;
    }
    
    /* Certificate ID */
    .cert-id {
      text-align: center;
      font-size: 11px;
      color: #9CA3AF;
      margin-top: 20px;
      letter-spacing: 2px;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    /* Security Strip */
    .security-strip {
      height: 8px;
      background: linear-gradient(90deg, #1565C0, #F57C00, #1565C0, #F57C00, #1565C0);
    }
    
    .header-strip {
      height: 8px;
      background: linear-gradient(90deg, #1565C0, #0D47A1);
    }
    
    /* Student Photo */
    .student-photo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .student-photo {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 4px solid #1565C0;
      object-fit: cover;
    }
    
    .photo-placeholder {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 4px solid #1565C0;
      background: linear-gradient(135deg, #1565C0, #0D47A1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      font-weight: 800;
      color: white;
    }

    /* Print Styles */
    @media print {
      body { background: white; padding: 0; }
      .certificate-wrapper { max-width: 100%; }
    }
    
    @page {
      size: A4 landscape;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="certificate-wrapper">
    <div class="certificate">
      <!-- Top Security Strip -->
      <div class="header-strip"></div>
      
      <!-- Watermark -->
      <div class="watermark">CERTIFIED</div>
      
      <!-- Decorative Borders -->
      <div class="border-outer"></div>
      <div class="border-inner"></div>
      
      <!-- Corner Decorations -->
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
      
      <!-- Main Content -->
      <div class="content">
        <!-- Header -->
        <div class="header">
          <div class="institute-logo">
            <span class="logo-text">ICV</span>
          </div>
          <div class="institute-info">
            <div class="institute-name">Institute of Excellence</div>
            <div class="institute-subtitle">Certificate Verification System</div>
          </div>
        </div>
        
        <!-- Certificate Title -->
        <div class="cert-title-container">
          <div class="cert-label">This is to certify that</div>
        </div>
        
        <!-- Divider -->
        <div class="divider">
          <div class="divider-line"></div>
          <div class="divider-diamond"></div>
          <div class="divider-line"></div>
        </div>
        
        <!-- Student Photo -->
        <div class="student-photo-container">
          ${
            certificate.photoUrl
              ? `<img src="${certificate.photoUrl}" class="student-photo" alt="Student Photo" />`
              : `<div class="photo-placeholder">${certificate.studentName.charAt(0).toUpperCase()}</div>`
          }
        </div>
        
        <!-- Student Name -->
        <div class="student-name">${certificate.studentName}</div>
        
        <!-- Divider -->
        <div class="divider">
          <div class="divider-line"></div>
          <div class="divider-diamond"></div>
          <div class="divider-line"></div>
        </div>
        
        <!-- Description -->
        <p class="description">
          has successfully completed the course of
          <br />
          <span class="course-highlight">${certificate.courseName}</span>
          <br />
          with outstanding performance and dedication, demonstrating exceptional skills
          and commitment to excellence.
        </p>
        
        <!-- Details Grid -->
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Duration</div>
            <div class="detail-value">${certificate.duration}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Issue Date</div>
            <div class="detail-value">${issueDate}</div>
          </div>
          ${
            certificate.grade
              ? `
          <div class="detail-item">
            <div class="detail-label">Grade</div>
            <div class="detail-value">
              <span class="grade-badge">${certificate.grade}</span>
            </div>
          </div>`
              : `
          <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value" style="color: #16A34A;">✓ VERIFIED</div>
          </div>`
          }
          ${
            expiryDate
              ? `
          <div class="detail-item">
            <div class="detail-label">Valid Until</div>
            <div class="detail-value">${expiryDate}</div>
          </div>`
              : ''
          }
          ${
            certificate.courseCode
              ? `
          <div class="detail-item">
            <div class="detail-label">Course Code</div>
            <div class="detail-value">${certificate.courseCode}</div>
          </div>`
              : ''
          }
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <!-- Signatures -->
          <div class="signatures">
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-label">Director / Principal</div>
              <div class="signature-name">Institute of Excellence</div>
            </div>
            ${
              certificate.instructorName
                ? `
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-label">Course Instructor</div>
              <div class="signature-name">${certificate.instructorName}</div>
            </div>`
                : ''
            }
          </div>
          
          <!-- QR Code -->
          <div class="qr-section">
            <img 
              src="${qrUrl}" 
              class="qr-image" 
              alt="Verification QR Code"
            />
            <div class="qr-label">Scan to Verify</div>
          </div>
        </div>
        
        <!-- Certificate ID -->
        <div class="cert-id">Certificate ID: ${certificate.certificateId}</div>
      </div>
      
      <!-- Bottom Security Strip -->
      <div class="security-strip"></div>
    </div>
  </div>
</body>
</html>`;
};

// ============================================================
// Generate and Print PDF
// ============================================================
export const generateCertificatePDF = async (
  certificate: Certificate
): Promise<string> => {
  try {
    const html = generateCertificateHTML(certificate);

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
      margins: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      },
    });

    return uri;
  } catch (error: any) {
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

// ============================================================
// Share PDF
// ============================================================
export const shareCertificatePDF = async (
  pdfUri: string,
  certificate: Certificate
): Promise<void> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: `Certificate - ${certificate.studentName}`,
      UTI: 'com.adobe.pdf',
    });
  } catch (error: any) {
    throw new Error(`Share failed: ${error.message}`);
  }
};

// ============================================================
// Save PDF to Device
// ============================================================
export const savePDFToDevice = async (
  pdfUri: string,
  certificate: Certificate
): Promise<string> => {
  try {
    const fileName = `certificate_${certificate.certificateId}_${Date.now()}.pdf`;
    const destPath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: pdfUri,
      to: destPath,
    });

    return destPath;
  } catch (error: any) {
    throw new Error(`Save failed: ${error.message}`);
  }
};
