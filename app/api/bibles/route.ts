import { NextResponse } from 'next/server';
import { getAllBibles } from '@/lib/services/bibleService';
import logger from '@/lib/utils/logger';

export async function GET() {
  try {
    const bibles = await getAllBibles();
    logger.info(`Retrieved ${bibles.length} Bibles`);
    return NextResponse.json({ bibles });
  } catch (error: any) {
    logger.error(`Failed to get available Bibles: ${error.message}`);
    return NextResponse.json(
      { error: 'Failed to fetch bibles' },
      { status: error.status || 500 }
    );
  }
}