# IPFS Setup Guide for Drug Verification

This guide will help you set up IPFS (InterPlanetary File System) for decentralized drug verification storage. IPFS is **free** and much simpler than blockchain smart contracts.

## Why IPFS?

- ✅ **Free** - Free tier available on all IPFS pinning services
- ✅ **Simple** - No smart contracts, no Solidity, no gas fees
- ✅ **Decentralized** - Drug records stored on distributed network
- ✅ **Beginner-friendly** - Easy to understand and implement
- ✅ **Upgradeable** - Can add smart contracts later if needed

## Step 1: Choose an IPFS Pinning Service

IPFS pinning services keep your files accessible on the IPFS network. Choose one:

### Option A: Pinata (Recommended for Beginners)
- **Free Tier**: 1 GB storage, unlimited requests
- **Sign up**: https://www.pinata.cloud/
- **Easy to use**: Simple API, good documentation

### Option B: Web3.Storage
- **Free Tier**: 5 GB storage
- **Sign up**: https://web3.storage/
- **Developer-friendly**: Built by Protocol Labs

### Option C: NFT.Storage
- **Free Tier**: Unlimited storage
- **Sign up**: https://nft.storage/
- **Best for**: Large-scale deployments

## Step 2: Get Your API Keys

### For Pinata:

1. Sign up at https://www.pinata.cloud/
2. Go to **API Keys** in your dashboard
3. Click **New Key**
4. Give it a name (e.g., "Delphi Health")
5. Copy your:
   - **API Key** (starts with something like `a1b2c3d4...`)
   - **Secret API Key** (starts with something like `e5f6g7h8...`)

### For Web3.Storage:

1. Sign up at https://web3.storage/
2. Go to **Account** → **API Tokens**
3. Click **Create API Token**
4. Copy your token (starts with `eyJ...`)

## Step 3: Configure Environment Variables

Add these to your `.env.local` file:

### For Pinata:
```env
# IPFS Configuration (Pinata)
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs
```

### For Web3.Storage:
```env
# IPFS Configuration (Web3.Storage)
WEB3_STORAGE_TOKEN=your_web3_storage_token_here
IPFS_GATEWAY=https://w3s.link/ipfs
```

**Important**: Never commit your API keys to version control!

## Step 4: Test IPFS Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to the drug verification page
3. Verify a drug using a NAFDAC code
4. Check the verification result - you should see:
   - Verification source badge
   - IPFS CID if registered
   - Link to view on IPFS

## How It Works

### Verification Flow:

1. **External API (EMDEX)** - Tries first (will fail if unpaid)
2. **IPFS** - Checks decentralized storage for existing drug
3. **Database** - Falls back to local MongoDB database

**Note**: Drugs are NOT auto-registered. Only admins can register drugs to IPFS via the admin panel.

### When an Admin Registers a Drug to IPFS:

1. Admin fills out drug registration form in admin panel
2. Drug information is converted to JSON format
3. JSON file is uploaded to IPFS via Pinata/Web3.Storage
4. IPFS returns a Content ID (CID) - a unique hash
5. CID is stored in MongoDB index for quick lookup
6. Drug record is now permanently on IPFS network

**Admin Access**: Only users with `role: 'admin'` can register drugs.

### Viewing IPFS Records:

- Use the IPFS gateway link in verification results
- Or visit: `https://gateway.pinata.cloud/ipfs/YOUR_CID`
- The CID is permanent - the file can't be changed

## Troubleshooting

### "IPFS not configured" error
- Make sure you've added API keys to `.env.local`
- Restart your development server after adding env variables
- Check that keys don't have extra spaces or quotes

### "Failed to upload to IPFS"
- Check your API keys are correct
- Verify you haven't exceeded free tier limits
- Check Pinata/Web3.Storage dashboard for errors

### Drugs not appearing on IPFS
- Check MongoDB `ipfs_index` collection
- Verify IPFS upload succeeded (check console logs)
- Try verifying the same drug again

## Free Tier Limits

### Pinata Free Tier:
- 1 GB storage
- Unlimited requests
- Files pinned for free (as long as you have space)

### Web3.Storage Free Tier:
- 5 GB storage
- Unlimited requests
- Files stored permanently

## Next Steps

1. ✅ Set up IPFS account (Pinata or Web3.Storage)
2. ✅ Add API keys to `.env.local`
3. ✅ Test drug verification
4. ✅ Verify drugs appear on IPFS
5. 🔄 When external API is available, uncomment the API call in `drug-verification.ts`

## Understanding IPFS CIDs

A CID (Content Identifier) is like a fingerprint for your file:
- **Unique**: Each file has a unique CID
- **Immutable**: Same file = same CID
- **Permanent**: CID never changes
- **Example**: `QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`

## Security Notes

- API keys are server-side only (never exposed to client)
- Drug records on IPFS are public (by design of IPFS)
- Don't store sensitive personal information in IPFS records
- Use IPFS for verification data only, not user data

## Need Help?

- Pinata Docs: https://docs.pinata.cloud/
- Web3.Storage Docs: https://web3.storage/docs/
- IPFS Docs: https://docs.ipfs.io/

## Migration from Smart Contracts

If you previously set up smart contracts:
- The blockchain code is still in `src/lib/blockchain.ts` (can be removed)
- IPFS is simpler and free - no need for smart contracts
- You can use both if needed (IPFS for storage, blockchain for verification)

