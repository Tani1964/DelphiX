import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import {
  verifyDrugByNAFDAC,
  verifyDrugByImage,
  verifyDrugByText,
  determineResult,
} from '@/lib/drug-verification';
import { getDrugVerificationsCollection } from '@/lib/mongodb';
import { DrugVerification } from '@/types';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const method = formData.get('method') as string;
    let nafdacCode = formData.get('nafdacCode') as string;
    const text = formData.get('text') as string;
    const imageFile = formData.get('image') as File | null;

    let verificationResult;
    let imageUrl: string | undefined;

    // Handle different verification methods
    if (method === 'image' && imageFile) {
      // Image verification (OCR + verification)
      verificationResult = await verifyDrugByImage(imageFile);
      // Use extracted NAFDAC code if found
      if (verificationResult.extractedNafdacCode) {
        nafdacCode = verificationResult.extractedNafdacCode;
      }
      // TODO: Upload image to cloud storage and set imageUrl
    } else if (method === 'code' && nafdacCode) {
      // NAFDAC code verification
      verificationResult = await verifyDrugByNAFDAC(nafdacCode);
    } else if (method === 'text' && text) {
      // Text search verification
      verificationResult = await verifyDrugByText(text);
    } else {
      return NextResponse.json(
        { error: 'Invalid verification method or missing data' },
        { status: 400 }
      );
    }

    const { drugInfo, source, ipfsCID, extractedNafdacCode } = verificationResult;
    const result = determineResult(drugInfo);

    // Determine NAFDAC code to store
    // Priority: extracted from image > provided code > undefined
    const storedNafdacCode = extractedNafdacCode || (method === 'code' ? nafdacCode : undefined);

    // Create verification record
    const verification: Omit<DrugVerification, '_id'> = {
      userId: session.user.id,
      nafdacCode: storedNafdacCode,
      verificationMethod: method as 'code' | 'image' | 'text',
      drugInfo: drugInfo as DrugVerification['drugInfo'],
      imageUrl,
      result,
      createdAt: new Date(),
    };

    // Save to database
    const verifications = await getDrugVerificationsCollection();
    const insertResult = await verifications.insertOne(verification);

    // Return response with source information
    return NextResponse.json({
      ...verification,
      _id: insertResult.insertedId.toString(),
      verificationSource: source, // Where the verification came from
      ipfsCID, // IPFS Content ID if registered on IPFS
    });
  } catch (error) {
    console.error('Drug verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify drug' },
      { status: 500 }
    );
  }
}
