import { DrugVerification } from '@/types';

// IPFS Drug Record Structure
interface IPFSDrugRecord {
  nafdacCode: string;
  name: string;
  manufacturer: string;
  status: 'verified' | 'expired' | 'unverified';
  expiryDate: string;
  batchNumber: string;
  registeredAt: string;
  registeredBy?: string;
}

// Index mapping NAFDAC codes to IPFS CIDs (stored in database)
// This helps us quickly find drugs without scanning all IPFS records
interface IPFSIndex {
  nafdacCode: string;
  ipfsCID: string;
  createdAt: Date;
}

/**
 * Upload drug record to IPFS using Pinata
 * Returns the IPFS Content Identifier (CID)
 */
export async function uploadDrugToIPFS(
  drugRecord: IPFSDrugRecord
): Promise<{ success: boolean; cid?: string; error?: string }> {
  try {
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_KEY;

    // If Pinata not configured, return error gracefully
    if (!pinataApiKey || !pinataSecretKey) {
      return {
        success: false,
        error: 'IPFS not configured. Set PINATA_API_KEY and PINATA_SECRET_KEY in .env.local',
      };
    }

    // Prepare the JSON data
    const jsonData = JSON.stringify(drugRecord);

    // Upload to Pinata
    const formData = new FormData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    formData.append('file', blob, `${drugRecord.nafdacCode}.json`);

    // Add metadata
    const metadata = JSON.stringify({
      name: `Drug-${drugRecord.nafdacCode}`,
      keyvalues: {
        nafdacCode: drugRecord.nafdacCode,
        drugName: drugRecord.name,
      },
    });
    formData.append('pinataMetadata', metadata);

    // Pinata options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `Pinata upload failed: ${error}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      cid: data.IpfsHash, // Pinata returns IpfsHash as the CID
    };
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload to IPFS',
    };
  }
}

/**
 * Retrieve drug record from IPFS by CID
 */
export async function getDrugFromIPFS(
  cid: string
): Promise<IPFSDrugRecord | null> {
  try {
    // Use public IPFS gateway (Pinata, Cloudflare, or public gateway)
    const gateway = process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
    const url = `${gateway}/${cid}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as IPFSDrugRecord;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    return null;
  }
}

/**
 * Search for drug on IPFS by NAFDAC code
 * Note: This requires maintaining an index in the database
 * IPFS itself doesn't support direct search by content
 */
export async function searchDrugOnIPFS(
  nafdacCode: string,
  ipfsIndex: Array<{ nafdacCode: string; ipfsCID: string }> // Pass the index from database
): Promise<IPFSDrugRecord | null> {
  // Find CID for this NAFDAC code
  const indexEntry = ipfsIndex.find((entry) => entry.nafdacCode === nafdacCode);

  if (!indexEntry) {
    return null;
  }

  // Retrieve from IPFS using CID
  return await getDrugFromIPFS(indexEntry.ipfsCID);
}

/**
 * Check if IPFS is configured
 */
export function isIPFSConfigured(): boolean {
  return !!(
    process.env.PINATA_API_KEY &&
    process.env.PINATA_SECRET_KEY &&
    process.env.PINATA_API_KEY !== 'your_pinata_api_key' &&
    process.env.PINATA_SECRET_KEY !== 'your_pinata_secret_key'
  );
}

/**
 * Convert drug verification info to IPFS record format
 */
export function drugInfoToIPFSRecord(
  nafdacCode: string,
  drugInfo: Partial<DrugVerification['drugInfo']>,
  userId?: string
): IPFSDrugRecord {
  return {
    nafdacCode,
    name: drugInfo.name || 'Unknown Drug',
    manufacturer: drugInfo.manufacturer || 'Unknown Manufacturer',
    status: drugInfo.status || 'unverified',
    expiryDate: drugInfo.expiryDate || new Date().toISOString().split('T')[0],
    batchNumber: drugInfo.batchNumber || `BATCH-${nafdacCode}`,
    registeredAt: new Date().toISOString(),
    registeredBy: userId,
  };
}

/**
 * Convert IPFS record to drug verification info format
 */
export function ipfsRecordToDrugInfo(
  ipfsRecord: IPFSDrugRecord
): Partial<DrugVerification['drugInfo']> {
  return {
    name: ipfsRecord.name,
    manufacturer: ipfsRecord.manufacturer,
    status: ipfsRecord.status,
    expiryDate: ipfsRecord.expiryDate,
    batchNumber: ipfsRecord.batchNumber,
  };
}

