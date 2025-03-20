import { NextRequest, NextResponse } from 'next/server';
import { getFeaturedVerses } from '@/lib/services/bibleService';
import logger from '@/lib/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { bibleId: string } }
) {
  try {
    // Validate bibleId parameter
    const bibleId = params.bibleId;
    if (!bibleId || typeof bibleId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid Bible ID' },
        { status: 400 }
      );
    }
    
    // Get verses from Bible API
    const verses = await getFeaturedVerses(bibleId);
    
    // Validate response before sending to client
    if (!verses || !Array.isArray(verses)) {
      throw new Error('Invalid response from Bible service');
    }
    
    logger.info(`Retrieved ${verses.length} featured verses for Bible ${bibleId}`);
    
    // Return JSON using NextResponse.json() instead of new NextResponse() with manual JSON.stringify
    return NextResponse.json(
      { verses },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error(`Failed to get verses for Bible ${params.bibleId}: ${error.message}`);
    
    // Properly format error response with appropriate status code
    return NextResponse.json(
      { error: 'Failed to fetch verses' },
      { status: error.status || 500 }
    );
  }
}