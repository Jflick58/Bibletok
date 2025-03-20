import { NextRequest, NextResponse } from 'next/server';
import { getBibleById } from '@/lib/services/bibleService';
import logger from '@/lib/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { bibleId: string } }
) {
  try {
    const bibleId = params.bibleId;
    const bible = await getBibleById(bibleId);
    logger.info(`Retrieved Bible: ${bible.name}`);
    return NextResponse.json({ bible });
  } catch (error: any) {
    logger.error(`Failed to get Bible with ID: ${params.bibleId}`);
    return NextResponse.json(
      { error: 'Failed to fetch bible details' },
      { status: error.status || 500 }
    );
  }
}