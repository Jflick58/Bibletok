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
    
    // Validate input parameters
    if (!bibleId || !verseId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const verses = await getVersesBefore(bibleId, verseId, count);
    
    // Validate response before sending to client
    if (!verses || !Array.isArray(verses)) {
      // Create fallback verse if no valid response
      const fallbackVerse = {
        id: `fallback-before-${Date.now()}`,
        reference: "Hebrews 11:1",
        text: "Now faith is the assurance of things hoped for, the conviction of things not seen.",
        copyright: "Fallback verse"
      };
      
      logger.warn(`Invalid verses response for Bible ${bibleId} before ${verseId}`);
      return NextResponse.json(
        { verses: [fallbackVerse] },
        { status: 200 }
      );
    }
    
    logger.info(`Retrieved ${verses.length} verses before ${verseId}`);
    
    return NextResponse.json(
      { verses },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error(`Failed to get verses before ${params.verseId} for Bible ${params.bibleId}: ${error.message}`);
    
    // Create fallback verses for error cases
    const fallbackVerses = [
      {
        id: `fallback-before-error-${Date.now()}`,
        reference: "Psalm 46:1",
        text: "God is our refuge and strength, a very present help in trouble.",
        copyright: "Fallback verse"
      }
    ];
    
    // Return fallback verses with 200 status to prevent app from breaking
    return NextResponse.json(
      { verses: fallbackVerses },
      { status: 200 }
    );
  }
}