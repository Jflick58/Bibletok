import { NextRequest, NextResponse } from 'next/server';
import { getFeaturedVerses } from '@/lib/services/bibleService';
import logger from '@/lib/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { bibleId: string } }
) {
  try {
    const bibleId = params.bibleId;
    const verses = await getFeaturedVerses(bibleId);
    logger.info(`Retrieved ${verses.length} featured verses for Bible ${bibleId}`);
    return NextResponse.json({ verses });
  } catch (error: any) {
    logger.error(`Failed to get verses for Bible ${params.bibleId}: ${error.message}`);
    return NextResponse.json(
      { error: 'Failed to fetch verses' },
      { status: error.status || 500 }
    );
  }
}