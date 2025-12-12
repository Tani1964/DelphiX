# Drug Verification Flow - Implementation Summary

## Overview

The drug verification system now follows a clear priority flow with IPFS integration for decentralized storage. This replaces the complex smart contract approach with a simpler, free solution.

## Verification Priority Flow

```
1. External API (EMDEX) 
   ↓ (if fails or unavailable)
2. IPFS (Decentralized Storage)
   ↓ (if not found)
3. Database (Local MongoDB)
   
Note: Drugs are NOT auto-registered. Only admins can register 
drugs to IPFS via the admin panel.
```

## How It Works

### Step 1: External API (EMDEX)
- **Status**: Currently using mock data (paid API unavailable)
- **Location**: `src/lib/drug-verification.ts` → `verifyDrugByNAFDACExternal()`
- **To implement**: Uncomment and add real EMDEX API call when available
- **Result**: If found, drug is verified and auto-registered to IPFS

### Step 2: IPFS Verification
- **Status**: Fully implemented
- **Location**: `src/lib/ipfs.ts` → `verifyDrugByIPFS()`
- **How**: Checks MongoDB `ipfs_index` collection for NAFDAC code → retrieves from IPFS using CID
- **Result**: If found, returns drug info with IPFS CID

### Step 3: Database Verification
- **Status**: Fully implemented
- **Location**: `src/lib/drug-verification.ts` → `verifyDrugByDatabase()`
- **How**: Searches MongoDB `drug_verifications` collection for previously verified drugs
- **Result**: If found, returns drug info and auto-registers to IPFS

### Step 4: Admin Registration (Manual)
- **Status**: Admin-only feature
- **Location**: `src/app/api/admin/drugs/register/route.ts`
- **How**: Admins can manually register drugs to IPFS via admin panel
- **Result**: Drug is permanently stored on IPFS network
- **Note**: Regular users cannot register drugs - only admins can

## Key Files

### Core Implementation
- `src/lib/ipfs.ts` - IPFS integration (Pinata/Web3.Storage)
- `src/lib/drug-verification.ts` - Main verification logic with priority flow
- `src/app/api/drug/verify/route.ts` - API endpoint
- `src/components/drug/VerificationResult.tsx` - UI component showing source

### Database Collections
- `drug_verifications` - Stores all verification records
- `ipfs_index` - Maps NAFDAC codes to IPFS CIDs for quick lookup

## Mock Data Explanation

### Why Mock Data Exists
- External API (EMDEX) is paid and currently unavailable
- Mock data allows development and testing without API access
- Clearly marked with `TEMPORARY` comments

### Where Mock Data Is
1. **External API Mock** (`verifyDrugByNAFDACExternal()`)
   - Simulates EMDEX API response
   - Contains sample drugs: Paracetamol, Amoxicillin
   - **To replace**: Uncomment real API call when available

2. **Text Search Mock** (`verifyDrugByText()`)
   - Basic keyword matching for development
   - **To replace**: Implement real EMDEX text search API

3. **Image OCR Mock** (`verifyDrugByImage()`)
   - Placeholder for OCR functionality
   - **To replace**: Add OCR service (Tesseract.js, Google Vision API)

### How to Replace Mock Data

**For External API:**
```typescript
// In verifyDrugByNAFDACExternal()
// Replace this:
const mockDrugs = { ... };

// With this:
const response = await fetch(`https://api.emdex.com/verify/${nafdacCode}`, {
  headers: { 'Authorization': `Bearer ${process.env.EMDEX_API_KEY}` }
});
const data = await response.json();
return convertEMDEXResponse(data);
```

## IPFS vs Smart Contracts

### Why IPFS Instead of Smart Contracts?
- ✅ **Free** - No gas fees, no wallet needed
- ✅ **Simple** - Just API calls, no Solidity
- ✅ **Beginner-friendly** - Easy to understand
- ✅ **Fast** - No blockchain confirmation wait
- ✅ **Flexible** - Can store any JSON data

### When to Use Smart Contracts?
- If you need programmatic verification logic
- If you need on-chain consensus
- If you need token-based incentives
- For now, IPFS is sufficient for storage

## Response Format

The API now returns:
```json
{
  "drugInfo": { ... },
  "result": "verified" | "expired" | "unverified",
  "verificationSource": "external_api" | "ipfs" | "database" | "unknown",
  "ipfsCID": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG" // if registered
}
```

## UI Features

The verification result now shows:
- ✅ Verification source badge (External API / IPFS / Database)
- ✅ IPFS CID if drug is registered on IPFS
- ✅ Link to view drug record on IPFS gateway
- ✅ Clear status indicators

## Next Steps

1. **Set up IPFS** (see `IPFS_SETUP.md`)
   - Sign up for Pinata or Web3.Storage (free)
   - Add API keys to `.env.local`
   - Test verification

2. **When External API Available**
   - Get EMDEX API credentials
   - Replace mock in `verifyDrugByNAFDACExternal()`
   - Update environment variables

3. **Optional Enhancements**
   - Add OCR for image verification
   - Implement batch verification
   - Add drug recall checking
   - Implement drug expiry alerts

## Troubleshooting

**Drug not found anywhere:**
- Check if NAFDAC code format is correct (XX-XXXX)
- Verify IPFS is configured (check `.env.local`)
- Check MongoDB connection

**IPFS registration fails:**
- Verify API keys are correct
- Check free tier limits not exceeded
- Review console logs for errors

**Verification source shows "unknown":**
- This means drug wasn't found in any source
- Drug will be marked as "unverified"
- User should verify manually with healthcare professional

