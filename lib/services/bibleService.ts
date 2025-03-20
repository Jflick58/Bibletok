import axios from 'axios';
import { Bible, Verse, BibleAPIResponse } from '../types/bible';
import { APIError } from '../utils/errors';
import logger from '../utils/logger';

// Environment variables will be injected by Next.js from .env.local
// Get API key as a function to ensure we always get the latest value
const getApiKey = () => process.env.BIBLE_API_KEY || '';

// Bible.api.bible endpoints and constants
const API_BASE_URL = 'https://api.scripture.api.bible/v1';

// Books available in most Bible translations
const BIBLE_BOOKS = [
  // Old Testament
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', 
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  // New Testament
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', 
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
];

// Set of well-known valid passages as fallbacks
const KNOWN_VALID_PASSAGES = [
  'JHN.3.16',  // John 3:16
  'PSA.23.1',  // Psalm 23:1
  'GEN.1.1',   // Genesis 1:1
  'ROM.8.28',  // Romans 8:28
  'PHP.4.13',  // Philippians 4:13
  'MAT.11.28', // Matthew 11:28
  'JER.29.11', // Jeremiah 29:11
  'ROM.12.2',  // Romans 12:2
  'PRO.3.5',   // Proverbs 3:5
  'ISA.40.31', // Isaiah 40:31
  'PSA.46.1',  // Psalm 46:1
  'GAL.5.22',  // Galatians 5:22
  'HEB.11.1',  // Hebrews 11:1
  '2TI.3.16',  // 2 Timothy 3:16
  'MAT.28.19', // Matthew 28:19
  '1JN.4.19',  // 1 John 4:19
  'PHP.4.6',   // Philippians 4:6
  'JHN.14.6',  // John 14:6
  'EPH.2.8',   // Ephesians 2:8
  'ROM.5.8'    // Romans 5:8
];

// Generate random passages to use
const getRandomPassages = (count = 10) => {
  const passages = [];
  
  // Always include some known valid passages to ensure we get at least some successful responses
  const knownPassages = [...KNOWN_VALID_PASSAGES]
    .sort(() => Math.random() - 0.5)  // Shuffle the array
    .slice(0, Math.min(count / 2, KNOWN_VALID_PASSAGES.length));
  
  passages.push(...knownPassages);
  
  // Fill the rest with random passages
  const remainingCount = count - passages.length;
  
  for (let i = 0; i < remainingCount; i++) {
    // Get a random book
    const book = BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
    
    // Generate random chapter and verse with better constraints based on Bible structure
    // Most books have fewer than 30 chapters, and most chapters have fewer than 40 verses
    const chapter = Math.floor(Math.random() * 10) + 1; // Use lower chapters (1-10) which exist in all books
    const verse = Math.floor(Math.random() * 20) + 1;   // Use lower verse numbers (1-20) which exist in most chapters
    
    passages.push(`${book}.${chapter}.${verse}`);
  }
  
  // Shuffle again to mix known and random passages
  return passages.sort(() => Math.random() - 0.5);
};

// Create a function to get a configured axios instance with the latest API key
const getBibleAPI = () => {
  const apiKey = getApiKey();
  
  // Log if API key is missing or empty
  if (!apiKey) {
    logger.warn('Bible API Key is missing or empty');
  }
  
  // Recreate the axios instance each time to ensure it has the latest API key
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'api-key': apiKey,
      'Accept': 'application/json'
    }
  });
};

// Handle API response with proper error handling
const handleAPIResponse = async <T>(
  request: Promise<{ data: BibleAPIResponse<T> }>
): Promise<T> => {
  try {
    const response = await request;
    
    // Validate response structure
    if (!response || !response.data || !response.data.data) {
      throw new Error('Invalid response structure from Bible API');
    }
    
    return response.data.data;
  } catch (error: any) {
    logger.error(`Bible API Error: ${error.message}`);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const statusCode = error.response.status || 500;
      const errorMessage = error.response.data?.message || 'Bible API error';
      
      logger.error(`Bible API responded with status ${statusCode}: ${errorMessage}`);
      
      throw new APIError(errorMessage, statusCode);
    } else if (error.request) {
      // The request was made but no response was received
      logger.error('No response received from Bible API');
      throw new APIError('No response from Bible API', 503);
    } else {
      // Something happened in setting up the request
      logger.error(`Error setting up Bible API request: ${error.message}`);
      throw new APIError('Error setting up request', 500);
    }
  }
};

// Get available Bibles
export const getAllBibles = async (): Promise<Bible[]> => {
  try {
    // Use getBibleAPI() to ensure we have the latest API key
    const bibleAPI = getBibleAPI();
    
    // Get all Bibles since the language filter might be causing issues
    const allBibles = await handleAPIResponse<Bible[]>(
      bibleAPI.get('/bibles')
    );
    
    // Filter to only include English Bibles
    const englishBibles = allBibles.filter(bible => 
      bible.language?.id === 'eng' || 
      bible.language?.name === 'English' ||
      bible.language?.nameLocal === 'English'
    );
    
    logger.info(`Filtered to ${englishBibles.length} English Bibles from ${allBibles.length} total Bibles`);
    
    return englishBibles;
  } catch (error) {
    logger.error('Failed to get available Bibles');
    throw error;
  }
};

// Get a specific Bible by ID
export const getBibleById = async (bibleId: string): Promise<Bible> => {
  try {
    // Use getBibleAPI() to ensure we have the latest API key
    const bibleAPI = getBibleAPI();
    
    return await handleAPIResponse<Bible>(
      bibleAPI.get(`/bibles/${bibleId}`)
    );
  } catch (error) {
    logger.error(`Failed to get Bible with ID: ${bibleId}`);
    throw error;
  }
};

// Get random verses for a Bible
export const getFeaturedVerses = async (bibleId: string): Promise<Verse[]> => {
  try {
    // Use getBibleAPI() to ensure we have the latest API key
    const bibleAPI = getBibleAPI();
    
    // Generate random passages each time this function is called
    const randomPassages = getRandomPassages(15); // Increase count to improve chances of success
    
    // Safe text parsing helper function to handle unexpected formats
    const safeParseContent = (content: string): string => {
      try {
        if (!content) return '';
        
        // Strip any HTML tags
        return content.replace(/<\/?[^>]+(>|$)/g, '').trim();
      } catch (e) {
        return content || '';
      }
    };
    
    const verses = await Promise.all(
      randomPassages.map(async (passage) => {
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
            id: verseData.id || passage, // Fallback to passage if id is missing
            reference: verseData.reference || passage, // Fallback to passage if reference is missing
            text: safeParseContent(verseData.content),
            copyright: verseData.copyright || ''
          };
        } catch (error) {
          logger.warn(`Failed to get passage ${passage} for Bible ${bibleId}`);
          return null;
        }
      })
    );
    
    // Filter out any null values (failed requests) or verses with empty text
    const validVerses = verses.filter((verse): verse is Verse => 
      verse !== null && 
      verse.text && 
      verse.text.trim().length > 0
    );
    
    // Ensure we have at least one verse, even if all fail
    if (validVerses.length === 0) {
      logger.warn(`No valid verses found for Bible ${bibleId}, using fallback`);
      return [createFallbackVerse("John 3:16")];
    }
    
    return validVerses;
  } catch (error) {
    logger.error(`Failed to get random verses for Bible ${bibleId}: ${error instanceof Error ? error.message : String(error)}`);
    // Return fallback verses instead of throwing
    return [
      createFallbackVerse("John 3:16"),
      createFallbackVerse("Psalm 23:1", "The LORD is my shepherd; I shall not want."),
      createFallbackVerse("Proverbs 3:5-6", "Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.")
    ];
  }
};

// Helper function to create fallback verses
function createFallbackVerse(reference: string, text?: string): Verse {
  return {
    id: `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    reference,
    text: text || "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
    copyright: "Fallback verse"
  };
}

// Get verses after a specific verse ID
export const getVersesAfter = async (
  bibleId: string,
  verseId: string,
  count: number = 5
): Promise<Verse[]> => {
  try {
    // Use getBibleAPI() to ensure we have the latest API key
    const bibleAPI = getBibleAPI();
    
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
          // Get fresh API instance for this request
          const bibleAPI = getBibleAPI();
          
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
    // Use getBibleAPI() to ensure we have the latest API key
    const bibleAPI = getBibleAPI();
    
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
      // Get fresh API instance for this request
      const bibleAPI = getBibleAPI();
      
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
          // Get fresh API instance for this request
          const bibleAPI = getBibleAPI();
          
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
          // Get fresh API instance for this request
          const bibleAPI = getBibleAPI();
          
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