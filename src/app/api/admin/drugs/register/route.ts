import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { registerDrugToIPFS } from '@/lib/drug-verification';
import { DrugVerification } from '@/types';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Check if user is admin
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nafdacCode, drugInfo } = body;

    // Validate input
    if (!nafdacCode) {
      return NextResponse.json(
        { error: 'NAFDAC code is required' },
        { status: 400 }
      );
    }

    if (!drugInfo || !drugInfo.name || !drugInfo.manufacturer) {
      return NextResponse.json(
        { error: 'Drug name and manufacturer are required' },
        { status: 400 }
      );
    }

    // Register drug to IPFS
    const result = await registerDrugToIPFS(
      nafdacCode,
      drugInfo as Partial<DrugVerification['drugInfo']>,
      session.user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to register drug' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Drug registered to IPFS successfully',
      nafdacCode,
      ipfsCID: result.cid,
    });
  } catch (error) {
    console.error('Admin drug registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register drug' },
      { status: 500 }
    );
  }
}

