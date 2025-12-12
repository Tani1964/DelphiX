import { DrugVerification } from '@/types';
import {
  searchDrugOnIPFS,
  uploadDrugToIPFS,
  drugInfoToIPFSRecord,
  ipfsRecordToDrugInfo,
  isIPFSConfigured,
} from './ipfs';
import { getIPFSIndexCollection } from './mongodb';

// Verification source tracking
export type VerificationSource = 'external_api' | 'ipfs' | 'database' | 'unknown';

export interface VerificationResult {
  drugInfo: Partial<DrugVerification['drugInfo']>;
  source: VerificationSource;
  ipfsCID?: string;
}

/**
 * ============================================================================
 * EXTERNAL API (EMDEX) - Step 1: Try External API First
 * ============================================================================
 * 
 * NOTE: This is a PAID API service. When you have access, replace the mock
 * implementation below with actual EMDEX API calls.
 * 
 * To implement:
 * 1. Get EMDEX API credentials
 * 2. Replace verifyDrugByNAFDACExternal() with real API call
 * 3. Remove the mock implementation
 */
async function verifyDrugByNAFDACExternal(
  nafdacCode: string
): Promise<Partial<DrugVerification['drugInfo']> | null> {
  try {
    // TODO: Replace with actual EMDEX API call when available
    // Example:
    // const response = await fetch(`https://api.emdex.com/verify/${nafdacCode}`, {
    //   headers: { 'Authorization': `Bearer ${process.env.EMDEX_API_KEY}` }
    // });
    // if (response.ok) {
    //   const data = await response.json();
    //   return { name: data.name, manufacturer: data.manufacturer, ... };
    // }

    // TEMPORARY: Mock implementation for development
    // This simulates API delay and will be removed when real API is available
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // TEMPORARY MOCK DATA - Replace with real API response
    const mockDrugs: Record<string, Partial<DrugVerification['drugInfo']>> = {
      '04-1234': {
        name: 'Paracetamol 500mg',
        manufacturer: 'Emzor Pharmaceuticals',
        status: 'verified',
        expiryDate: '2025-12-31',
        batchNumber: 'BATCH-2024-001',
      },
      '05-5678': {
        name: 'Amoxicillin 250mg',
        manufacturer: 'Fidson Healthcare',
        status: 'verified',
        expiryDate: '2024-06-30',
        batchNumber: 'BATCH-2023-045',
      },
    };

    return mockDrugs[nafdacCode] || null;
  } catch (error) {
    console.error('External API (EMDEX) error:', error);
    // API failed or not available - continue to next step
    return null;
  }
}

/**
 * ============================================================================
 * IPFS VERIFICATION - Step 2: Check Decentralized Storage
 * ============================================================================
 * 
 * Checks IPFS for existing drug records. If IPFS is not configured,
 * this step is skipped gracefully.
 */
async function verifyDrugByIPFS(
  nafdacCode: string
): Promise<{ drugInfo: Partial<DrugVerification['drugInfo']> | null; cid?: string }> {
  // Skip if IPFS not configured
  if (!isIPFSConfigured()) {
    return { drugInfo: null };
  }

  try {
    // Get IPFS index from database
    const ipfsIndex = await getIPFSIndexCollection();
    const indexEntries = await ipfsIndex
      .find({ nafdacCode })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    if (indexEntries.length === 0) {
      return { drugInfo: null };
    }

    const indexEntry = indexEntries[0];
    const ipfsRecord = await searchDrugOnIPFS(nafdacCode, [
      {
        nafdacCode: indexEntry.nafdacCode,
        ipfsCID: indexEntry.ipfsCID,
      },
    ]);

    if (ipfsRecord) {
      return {
        drugInfo: ipfsRecordToDrugInfo(ipfsRecord),
        cid: indexEntry.ipfsCID,
      };
    }

    return { drugInfo: null };
  } catch (error) {
    console.error('IPFS verification error:', error);
    return { drugInfo: null };
  }
}

/**
 * ============================================================================
 * DATABASE VERIFICATION - Step 3: Check Local Database
 * ============================================================================
 * 
 * Checks our local MongoDB database for previously verified drugs.
 * This is the fallback when external API and IPFS don't have the drug.
 */
async function verifyDrugByDatabase(
  nafdacCode: string
): Promise<Partial<DrugVerification['drugInfo']> | null> {
  try {
    const { getDrugVerificationsCollection } = await import('./mongodb');
    const verifications = await getDrugVerificationsCollection();

    // Find most recent verification for this NAFDAC code
    const verification = await verifications
      .findOne(
        { nafdacCode, result: 'verified' },
        { sort: { createdAt: -1 } }
      );

    if (verification && verification.drugInfo) {
      return verification.drugInfo;
    }

    return null;
  } catch (error) {
    console.error('Database verification error:', error);
    return null;
  }
}

/**
 * ============================================================================
 * ADMIN DRUG REGISTRATION - Admin Only
 * ============================================================================
 * 
 * Register a drug to IPFS. This function is only called by admin users
 * through the admin API endpoint.
 */
export async function registerDrugToIPFS(
  nafdacCode: string,
  drugInfo: Partial<DrugVerification['drugInfo']>,
  userId: string
): Promise<{ success: boolean; cid?: string; error?: string }> {
  // Validate drug info
  if (!drugInfo.name || !drugInfo.manufacturer) {
    return {
      success: false,
      error: 'Drug name and manufacturer are required',
    };
  }

  // Check if IPFS is configured
  if (!isIPFSConfigured()) {
    return {
      success: false,
      error: 'IPFS is not configured. Please set PINATA_API_KEY and PINATA_SECRET_KEY',
    };
  }

  try {
    // Convert to IPFS record format
    const ipfsRecord = drugInfoToIPFSRecord(nafdacCode, drugInfo, userId);

    // Upload to IPFS
    const result = await uploadDrugToIPFS(ipfsRecord);

    if (result.success && result.cid) {
      // Save CID to database index
      const ipfsIndex = await getIPFSIndexCollection();
      await ipfsIndex.insertOne({
        nafdacCode,
        ipfsCID: result.cid,
        createdAt: new Date(),
      });

      return {
        success: true,
        cid: result.cid,
      };
    }

    return {
      success: false,
      error: result.error || 'Failed to upload to IPFS',
    };
  } catch (error: any) {
    console.error('Register drug to IPFS error:', error);
    return {
      success: false,
      error: error.message || 'Failed to register drug',
    };
  }
}

/**
 * ============================================================================
 * MAIN VERIFICATION FUNCTION - Priority Flow
 * ============================================================================
 * 
 * Verification Priority:
 * 1. External API (EMDEX) - Try first
 * 2. IPFS - Check decentralized storage
 * 3. Database - Check local database
 * 
 * NOTE: Drugs are NOT auto-registered. Only admins can register drugs via
 * the admin panel.
 * 
 * Returns verification result with source information
 */
export async function verifyDrugByNAFDAC(
  nafdacCode: string
): Promise<VerificationResult> {
  // Step 1: Try External API (EMDEX)
  const externalDrug = await verifyDrugByNAFDACExternal(nafdacCode);
  if (externalDrug) {
    return {
      drugInfo: externalDrug,
      source: 'external_api',
    };
  }

  // Step 2: Check IPFS
  const ipfsResult = await verifyDrugByIPFS(nafdacCode);
  if (ipfsResult.drugInfo) {
    return {
      drugInfo: ipfsResult.drugInfo,
      source: 'ipfs',
      ipfsCID: ipfsResult.cid,
    };
  }

  // Step 3: Check Database
  const dbDrug = await verifyDrugByDatabase(nafdacCode);
  if (dbDrug) {
    return {
      drugInfo: dbDrug,
      source: 'database',
    };
  }

  // Not found anywhere - return unverified
  return {
    drugInfo: {
      name: `Drug ${nafdacCode}`,
      manufacturer: 'Unknown Manufacturer',
      status: 'unverified',
    },
    source: 'unknown',
  };
}

/**
 * Verify drug by image (OCR + verification)
 */
export async function verifyDrugByImage(
  imageFile: File
): Promise<VerificationResult> {
  // TODO: Implement OCR to extract NAFDAC code from image
  // For now, this is a placeholder that returns mock data
  
  // TEMPORARY: Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // In real implementation:
  // 1. Upload image to OCR service (e.g., Tesseract.js, Google Vision API)
  // 2. Extract NAFDAC code from image
  // 3. Call verifyDrugByNAFDAC() with extracted code

  const mockDrug: Partial<DrugVerification['drugInfo']> = {
    name: 'Paracetamol 500mg',
    manufacturer: 'Emzor Pharmaceuticals',
    status: 'verified',
    expiryDate: '2025-12-31',
    batchNumber: 'BATCH-2024-001',
  };

  return {
    drugInfo: mockDrug,
    source: 'database', // Marked as database since it's mock
  };
}

/**
 * Verify drug by text search
 */
export async function verifyDrugByText(
  text: string
): Promise<VerificationResult> {
  // Extract NAFDAC code if present (format: XX-XXXX)
  const nafdacMatch = text.match(/\d{2}-\d{4}/);
  const nafdacCode = nafdacMatch ? nafdacMatch[0] : `TEXT-${Date.now()}`;

  // If NAFDAC code found, use main verification flow
  if (nafdacMatch) {
    return await verifyDrugByNAFDAC(nafdacCode);
  }

  // TEMPORARY: Mock text search for development
  // In real implementation, this would search EMDEX database by drug name
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const lowerText = text.toLowerCase();
  let drugInfo: Partial<DrugVerification['drugInfo']> = {
    name: text,
    manufacturer: 'Unknown Manufacturer',
    status: 'unverified',
  };

  // TEMPORARY MOCK DATA - Replace with real search
  if (lowerText.includes('paracetamol')) {
    drugInfo = {
      name: 'Paracetamol 500mg',
      manufacturer: 'Emzor Pharmaceuticals',
      status: 'verified',
      expiryDate: '2025-12-31',
      batchNumber: 'BATCH-2024-001',
    };
  } else if (lowerText.includes('amoxicillin')) {
    drugInfo = {
      name: 'Amoxicillin 250mg',
      manufacturer: 'Fidson Healthcare',
      status: 'verified',
      expiryDate: '2024-06-30',
      batchNumber: 'BATCH-2023-045',
    };
  }

  return {
    drugInfo,
    source: 'database', // Marked as database since it's mock
  };
}

/**
 * Determine verification result status
 */
export function determineResult(
  drugInfo: Partial<DrugVerification['drugInfo']>
): DrugVerification['result'] {
  if (!drugInfo.status || drugInfo.status === 'unverified') {
    return 'unverified';
  }

  if (drugInfo.status === 'expired') {
    return 'expired';
  }

  if (drugInfo.status === 'verified') {
    // Check expiry date
    if (drugInfo.expiryDate) {
      const expiryDate = new Date(drugInfo.expiryDate);
      const today = new Date();
      if (expiryDate < today) {
        return 'expired';
      }
    }
    return 'verified';
  }

  return 'invalid';
}
