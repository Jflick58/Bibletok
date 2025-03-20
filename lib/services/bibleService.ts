import axios from 'axios';
import { Bible, Verse, BibleAPIResponse } from '../types/bible';
import { APIError } from '../utils/errors';
import logger from '../utils/logger';

// Environment variables will be injected by Next.js from .env.local
const API_KEY = process.env.BIBLE_API_KEY || '';

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

// Generate random passages to use
const getRandomPassages = (count = 10) => {
  const passages = [];
  
  for (let i = 0; i < count; i++) {
    // Get a random book
    const book = BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
    
    // Generate random chapter (1-20) and verse (1-30)
    // Note: This is a simplification - actual books have varying chapter/verse counts
    const chapter = Math.floor(Math.random() * 20) + 1;
    const verse = Math.floor(Math.random() * 30) + 1;
    
    passages.push(`${book}.${chapter}.${verse}`);
  }
  
  return passages;
};

// Create a function to get a configured axios instance with the latest API key
const getBibleAPI = () => {
  // Recreate the axios instance each time to ensure it has the latest API key
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'api-key': API_KEY,
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
    const randomPassages = getRandomPassages(10);
    
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
    logger.error(`Failed to get random verses for Bible ${bibleId}`);
    throw error;
  }
};

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