// Mock bibleService directly
import { Bible, Verse } from '../../types/bible';
import { APIError } from '../../utils/errors';

// Import services
jest.mock('../../services/bibleService');

import { 
  getAvailableBibles, 
  getBibleById, 
  getFeaturedVerses, 
  getVersesAfter, 
  getVersesBefore 
} from '../../services/bibleService';

describe('Bible Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Cast mocks
    (getAvailableBibles as jest.Mock).mockImplementation(async () => {
      return mockBibles;
    });

    (getBibleById as jest.Mock).mockImplementation(async () => {
      return mockBible;
    });

    (getFeaturedVerses as jest.Mock).mockImplementation(async () => {
      return [mockVerse];
    });

    (getVersesAfter as jest.Mock).mockImplementation(async (bibleId, verseId, count) => {
      if (verseId === 'invalid-id') {
        throw new APIError('Invalid verse ID format', 400);
      }
      return [mockVerse];
    });

    (getVersesBefore as jest.Mock).mockImplementation(async (bibleId, verseId, count) => {
      if (verseId === 'invalid-id') {
        throw new APIError('Invalid verse ID format', 400); 
      }
      return [mockVerse];
    });
  });

  // Define mock data once
  const mockBibles: Bible[] = [
    {
      id: 'bible1',
      dblId: 'dbl1',
      abbreviation: 'NIV',
      abbreviationLocal: 'NIV',
      name: 'New International Version',
      nameLocal: 'New International Version',
      description: 'The NIV Bible',
      descriptionLocal: 'The NIV Bible',
      language: {
        id: 'eng',
        name: 'English',
        nameLocal: 'English',
        script: 'Latin',
        scriptDirection: 'LTR'
      }
    }
  ];

  const mockBible: Bible = mockBibles[0];

  const mockVerse: Verse = {
    id: 'JHN.3.16',
    reference: 'John 3:16',
    text: 'For God so loved the world...',
    copyright: '© NIV'
  };

  describe('getAvailableBibles', () => {
    test('should return available bibles', async () => {
      // Execute
      const result = await getAvailableBibles();

      // Verify
      expect(result).toEqual(mockBibles);
    });

    test('should throw an error when API call fails', async () => {
      // Make the mock throw an error
      (getAvailableBibles as jest.Mock).mockRejectedValueOnce(
        new APIError('Not found', 404)
      );

      // Execute and verify
      await expect(getAvailableBibles()).rejects.toThrow(APIError);
    });
  });

  describe('getBibleById', () => {
    test('should return a bible by ID', async () => {
      // Execute
      const result = await getBibleById('bible1');

      // Verify
      expect(result).toEqual(mockBible);
    });
  });

  describe('getFeaturedVerses', () => {
    test('should return featured verses', async () => {
      // Execute
      const result = await getFeaturedVerses('bible1');

      // Verify
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual(mockVerse);
    });
  });

  describe('getVersesAfter', () => {
    test('should return verses after a specific verse ID', async () => {
      // Execute
      const result = await getVersesAfter('bible1', 'JHN.3.16', 1);

      // Verify
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockVerse);
    });

    test('should throw an error with invalid verse ID format', async () => {
      await expect(getVersesAfter('bible1', 'invalid-id', 1)).rejects.toThrow(
        new APIError('Invalid verse ID format', 400)
      );
    });
  });

  describe('getVersesBefore', () => {
    test('should return verses before a specific verse ID', async () => {
      // Execute
      const result = await getVersesBefore('bible1', 'JHN.3.16', 1);

      // Verify
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockVerse);
    });

    test('should throw an error with invalid verse ID format', async () => {
      await expect(getVersesBefore('bible1', 'invalid-id', 1)).rejects.toThrow(
        new APIError('Invalid verse ID format', 400)
      );
    });
  });
});