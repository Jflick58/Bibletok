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
    
    // Ensure we have a valid array of verses with at least one item
    if (!verses || !Array.isArray(verses) || verses.length === 0) {
      // Create a fallback verse if none are returned
      const fallbackVerse = {
        id: `fallback-${Date.now()}`,
        reference: "Psalm 119:105",
        text: "Your word is a lamp to my feet and a light to my path.",
        copyright: "Fallback verse"
      };
      
      return NextResponse.json(
        { verses: [fallbackVerse] },
        { status: 200 }
      );
    }
    
    // Return JSON using NextResponse.json()
    return NextResponse.json(
      { verses },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error(`Failed to get verses for Bible ${params.bibleId}: ${error.message}`);
    
    // Create fallback verses for error cases to ensure app still works
    const fallbackVerses = [
      {
        id: `fallback-error-${Date.now()}-1`,
        reference: "Romans 8:28",
        text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
        copyright: "Fallback verse"
      },
      {
        id: `fallback-error-${Date.now()}-2`,
        reference: "Isaiah 41:10",
        text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.",
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