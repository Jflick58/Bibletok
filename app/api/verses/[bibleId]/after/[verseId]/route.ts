import { NextRequest, NextResponse } from 'next/server';
import { getVersesAfter } from '@/lib/services/bibleService';
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
    
    const verses = await getVersesAfter(bibleId, verseId, count);
    
    // Validate response before sending to client
    if (!verses || !Array.isArray(verses)) {
      // Create fallback verse if no valid response
      const fallbackVerse = {
        id: `fallback-after-${Date.now()}`,
        reference: "Philippians 3:14",
        text: "I press on toward the goal for the prize of the upward call of God in Christ Jesus.",
        copyright: "Fallback verse"
      };
      
      logger.warn(`Invalid verses response for Bible ${bibleId} after ${verseId}`);
      return NextResponse.json(
        { verses: [fallbackVerse] },
        { status: 200 }
      );
    }
    
    logger.info(`Retrieved ${verses.length} verses after ${verseId}`);
    
    return NextResponse.json(
      { verses },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error(`Failed to get verses after ${params.verseId} for Bible ${params.bibleId}: ${error.message}`);
    
    // Create fallback verses for error cases
    const fallbackVerses = [
      {
        id: `fallback-after-error-${Date.now()}`,
        reference: "Philippians 4:13",
        text: "I can do all things through him who strengthens me.",
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