import axios from 'axios';
import { Bible, Verse, BibleAPIResponse } from '../types/bible';
import { APIError } from '../utils/errors';
import logger from '../utils/logger';

// Bible.api.bible endpoints and constants
const API_BASE_URL = 'https://api.scripture.api.bible/v1';
const API_KEY = process.env.BIBLE_API_KEY || '1e8feaeef5ec6e5b91a9ab886a1fa57e';

// Sample featured passages for initial load
const FEATURED_PASSAGES = [
  'JHN.3.16', // John 3:16
  'PSA.23', // Psalm 23
  'PRO.3.5-PRO.3.6', // Proverbs 3:5-6
  'MAT.6.26', // Matthew 6:26
  'ROM.8.28', // Romans 8:28
  'PHP.4.13', // Philippians 4:13
  'JER.29.11', // Jeremiah 29:11
  'PSA.19.1', // Psalm 19:1
  'ISA.40.31', // Isaiah 40:31
  'MAT.28.19-MAT.28.20' // Matthew 28:19-20
];

// Configure axios instance for Bible API
const bibleAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'api-key': API_KEY,
    'Accept': 'application/json'
  }
});

// Handle API response with proper error handling
const handleAPIResponse = async <T>(
  request: Promise<{ data: BibleAPIResponse<T> }>
): Promise<T> => {
  try {
    const response = await request;
    return response.data.data;
  } catch (error: any) {
    logger.error(`Bible API Error: ${error.message}`);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new APIError(
        error.response.data?.message || 'Bible API error',
        error.response.status
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new APIError('No response from Bible API', 503);
    } else {
      // Something happened in setting up the request
      throw new APIError('Error setting up request', 500);
    }
  }
};

// Get available Bibles
export const getAvailableBibles = async (): Promise<Bible[]> => {
  try {
    return await handleAPIResponse<Bible[]>(
      bibleAPI.get('/bibles')
    );
  } catch (error) {
    logger.error('Failed to get available Bibles');
    throw error;
  }
};

// Get a specific Bible by ID
export const getBibleById = async (bibleId: string): Promise<Bible> => {
  try {
    return await handleAPIResponse<Bible>(
      bibleAPI.get(`/bibles/${bibleId}`)
    );
  } catch (error) {
    logger.error(`Failed to get Bible with ID: ${bibleId}`);
    throw error;
  }
};

// Get featured verses for a Bible
export const getFeaturedVerses = async (bibleId: string): Promise<Verse[]> => {
  try {
    const verses = await Promise.all(
      FEATURED_PASSAGES.map(async (passage) => {
        try {
          // Extract clean text from HTML content
          const verseData = await handleAPIResponse<{
            id: string;
            reference: string;
            content: string;
            copyright: string;
          }>(
            bibleAPI.get(`/bibles/${bibleId}/passages/${passage}`, {
              params: {
                'content-type': 'text',
                'include-titles': false,
                'include-chapter-numbers': false,
                'include-verse-numbers': false
              }
            })
          );
          
          return {
            id: verseData.id,
            reference: verseData.reference,
            text: verseData.content,
            copyright: verseData.copyright
          };
        } catch (error) {
          logger.warn(`Failed to get passage ${passage} for Bible ${bibleId}`);
          return null;
        }
      })
    );
    
    // Filter out any null values (failed requests)
    return verses.filter((verse): verse is Verse => verse !== null);
  } catch (error) {
    logger.error(`Failed to get featured verses for Bible ${bibleId}`);
    throw error;
  }
};

// Get a verse after a specific verse ID
export const getVersesAfter = async (
  bibleId: string,
  verseId: string,
  count: number = 5
): Promise<Verse[]> => {
  try {
    // Parse the verse ID to determine book, chapter, verse
    const parts = verseId.split('.');
    if (parts.length < 3) {
      throw new APIError('Invalid verse ID format', 400);
    }
    
    const bookId = parts[0];
    let chapterId = parts[1];
    let verseNum = parseInt(parts[2]);
    
    // Get the chapter
    const chapter = await handleAPIResponse<{
      id: string;
      reference: string;
      verseCount: number;
      next?: { id: string; bookId: string; number: string };
    }>(
      bibleAPI.get(`/bibles/${bibleId}/chapters/${bookId}.${chapterId}`)
    );
    
    // Build result array
    const results: Verse[] = [];
    let currentChapterId = `${bookId}.${chapterId}`;
    let currentChapterData: any = chapter;
    
    // While we need more verses and there are more chapters
    while (results.length < count && currentChapterData) {
      // Get the verses for this chapter
      const verses = await handleAPIResponse<{
        id: string;
        reference: string;
        orgId: string;
      }[]>(
        bibleAPI.get(`/bibles/${bibleId}/chapters/${currentChapterId}/verses`)
      );
      
      // Filter verses that come after our current verse
      const versesAfter = verses
        .filter(v => {
          const vNum = parseInt(v.id.split('.')[2]);
          return vNum > verseNum;
        })
        .slice(0, count - results.length);
      
      // Get full verse content for each verse
      for (const verse of versesAfter) {
        try {
          const verseData = await handleAPIResponse<{
            id: string;
            reference: string;
            content: string;
            copyright: string;
          }>(
            bibleAPI.get(`/bibles/${bibleId}/verses/${verse.id}`, {
              params: {
                'content-type': 'text',
                'include-verse-numbers': false
              }
            })
          );
          
          results.push({
            id: verseData.id,
            reference: verseData.reference,
            text: verseData.content,
            copyright: verseData.copyright
          });
          
          if (results.length >= count) break;
        } catch (error) {
          logger.warn(`Failed to get verse ${verse.id}`);
        }
      }
      
      // If we still need more verses and there's a next chapter, go to it
      if (results.length < count && currentChapterData.next) {
        // Reset verse number since we're in a new chapter
        verseNum = 0;
        currentChapterId = currentChapterData.next.id;
        
        try {
          currentChapterData = await handleAPIResponse<{
            id: string;
            reference: string;
            verseCount: number;
            next?: { id: string; bookId: string; number: string };
          }>(
            bibleAPI.get(`/bibles/${bibleId}/chapters/${currentChapterId}`)
          );
        } catch (error) {
          logger.warn(`Failed to get next chapter ${currentChapterId}`);
          currentChapterData = null;
        }
      } else {
        break;
      }
    }
    
    return results;
  } catch (error) {
    logger.error(`Failed to get verses after ${verseId} for Bible ${bibleId}`);
    throw error;
  }
};

// Get verses before a specific verse ID
export const getVersesBefore = async (
  bibleId: string,
  verseId: string,
  count: number = 5
): Promise<Verse[]> => {
  try {
    // Parse the verse ID to determine book, chapter, verse
    const parts = verseId.split('.');
    if (parts.length < 3) {
      throw new APIError('Invalid verse ID format', 400);
    }
    
    const bookId = parts[0];
    let chapterId = parts[1];
    let verseNum = parseInt(parts[2]);
    
    // Get the chapter
    const chapter = await handleAPIResponse<{
      id: string;
      reference: string;
      verseCount: number;
      previous?: { id: string; bookId: string; number: string };
    }>(
      bibleAPI.get(`/bibles/${bibleId}/chapters/${bookId}.${chapterId}`)
    );
    
    // Build result array
    const results: Verse[] = [];
    let currentChapterId = `${bookId}.${chapterId}`;
    let currentChapterData: any = chapter;
    
    // While we need more verses and there are more chapters
    while (results.length < count && currentChapterData) {
      // Get the verses for this chapter
      const verses = await handleAPIResponse<{
        id: string;
        reference: string;
        orgId: string;
      }[]>(
        bibleAPI.get(`/bibles/${bibleId}/chapters/${currentChapterId}/verses`)
      );
      
      // Filter verses that come before our current verse
      const versesBefore = verses
        .filter(v => {
          const vNum = parseInt(v.id.split('.')[2]);
          return vNum < verseNum;
        })
        .reverse() // To get verses in descending order
        .slice(0, count - results.length);
      
      // Get full verse content for each verse
      for (const verse of versesBefore) {
        try {
          const verseData = await handleAPIResponse<{
            id: string;
            reference: string;
            content: string;
            copyright: string;
          }>(
            bibleAPI.get(`/bibles/${bibleId}/verses/${verse.id}`, {
              params: {
                'content-type': 'text',
                'include-verse-numbers': false
              }
            })
          );
          
          results.unshift({
            id: verseData.id,
            reference: verseData.reference,
            text: verseData.content,
            copyright: verseData.copyright
          });
          
          if (results.length >= count) break;
        } catch (error) {
          logger.warn(`Failed to get verse ${verse.id}`);
        }
      }
      
      // If we still need more verses and there's a previous chapter, go to it
      if (results.length < count && currentChapterData.previous) {
        currentChapterId = currentChapterData.previous.id;
        
        try {
          currentChapterData = await handleAPIResponse<{
            id: string;
            reference: string;
            verseCount: number;
            previous?: { id: string; bookId: string; number: string };
          }>(
            bibleAPI.get(`/bibles/${bibleId}/chapters/${currentChapterId}`)
          );
          
          // Get the verse count to set verseNum to include all verses in the previous chapter
          const prevChapterVerses = await handleAPIResponse<{
            id: string;
            reference: string;
            orgId: string;
          }[]>(
            bibleAPI.get(`/bibles/${bibleId}/chapters/${currentChapterId}/verses`)
          );
          
          verseNum = prevChapterVerses.length + 1; // Set to a number higher than the last verse
        } catch (error) {
          logger.warn(`Failed to get previous chapter ${currentChapterId}`);
          currentChapterData = null;
        }
      } else {
        break;
      }
    }
    
    return results;
  } catch (error) {
    logger.error(`Failed to get verses before ${verseId} for Bible ${bibleId}`);
    throw error;
  }
};