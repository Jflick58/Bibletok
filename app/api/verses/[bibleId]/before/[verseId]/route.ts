import { NextRequest, NextResponse } from 'next/server';
import { getVersesBefore } from '@/lib/services/bibleService';
import logger from '@/lib/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { bibleId: string; verseId: string } }
) {
  try {
    const { bibleId, verseId } = params;
    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get('count') || '5');
    
    const verses = await getVersesBefore(bibleId, verseId, count);
    logger.info(`Retrieved ${verses.length} verses before ${verseId}`);
    return NextResponse.json({ verses });
  } catch (error: any) {
    logger.error(`Failed to get verses before ${params.verseId} for Bible ${params.bibleId}: ${error.message}`);
    return NextResponse.json(
      { error: 'Failed to fetch verses' },
      { status: error.status || 500 }
    );
  }
}