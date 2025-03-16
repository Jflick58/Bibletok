import axios from 'axios';
import { getAvailableBibles, getBibleById, getFeaturedVerses, getVersesAfter, getVersesBefore } from '../../services/bibleService';
import { Bible, Verse } from '../../types/bible';
import { APIError } from '../../utils/errors';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Bible Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableBibles', () => {
    test('should return available bibles', async () => {
      // Prepare mock data
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

      // Setup axios mock
      mockedAxios.create.mockReturnThis();
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: mockBibles
        }
      });

      // Execute
      const result = await getAvailableBibles();

      // Verify
      expect(mockedAxios.get).toHaveBeenCalledWith('/bibles');
      expect(result).toEqual(mockBibles);
    });

    test('should throw an error when API call fails', async () => {
      // Setup axios mock to fail
      mockedAxios.create.mockReturnThis();
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      });

      // Execute and verify
      await expect(getAvailableBibles()).rejects.toThrow(APIError);
    });
  });

  describe('getBibleById', () => {
    test('should return a bible by ID', async () => {
      // Prepare mock data
      const mockBible: Bible = {
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
      };

      // Setup axios mock
      mockedAxios.create.mockReturnThis();
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: mockBible
        }
      });

      // Execute
      const result = await getBibleById('bible1');

      // Verify
      expect(mockedAxios.get).toHaveBeenCalledWith('/bibles/bible1');
      expect(result).toEqual(mockBible);
    });
  });

  describe('getFeaturedVerses', () => {
    test('should return featured verses', async () => {
      // Prepare mock data
      const mockVerse = {
        id: 'JHN.3.16',
        reference: 'John 3:16',
        content: 'For God so loved the world...',
        copyright: '© NIV'
      };

      // Setup axios mock
      mockedAxios.create.mockReturnThis();
      mockedAxios.get.mockResolvedValue({
        data: {
          data: mockVerse
        }
      });

      // Execute
      const result = await getFeaturedVerses('bible1');

      // Verify
      expect(mockedAxios.get).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
      // Since all API calls return the same mock, all verses will be identical
      expect(result[0]).toEqual({
        id: mockVerse.id,
        reference: mockVerse.reference,
        text: mockVerse.content,
        copyright: mockVerse.copyright
      });
    });
  });

  describe('getVersesAfter', () => {
    test('should return verses after a specific verse ID', async () => {
      // Mock chapter data
      const mockChapter = {
        id: 'JHN.3',
        reference: 'John 3',
        verseCount: 36,
        next: { id: 'JHN.4', bookId: 'JHN', number: '4' }
      };

      // Mock verses list
      const mockVerses = [
        { id: 'JHN.3.16', reference: 'John 3:16', orgId: 'JHN.3.16' },
        { id: 'JHN.3.17', reference: 'John 3:17', orgId: 'JHN.3.17' },
        { id: 'JHN.3.18', reference: 'John 3:18', orgId: 'JHN.3.18' }
      ];

      // Mock verse content
      const mockVerseContent = {
        id: 'JHN.3.17',
        reference: 'John 3:17',
        content: 'For God did not send his Son into the world to condemn the world...',
        copyright: '© NIV'
      };

      // Setup axios mock for different calls
      mockedAxios.create.mockReturnThis();
      // First call to get chapter info
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockChapter }
      });
      // Second call to get verses in the chapter
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockVerses }
      });
      // Third call to get verse content
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockVerseContent }
      });

      // Execute
      const result = await getVersesAfter('bible1', 'JHN.3.16', 1);

      // Verify
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({
        id: mockVerseContent.id,
        reference: mockVerseContent.reference,
        text: mockVerseContent.content,
        copyright: mockVerseContent.copyright
      });
    });

    test('should throw an error with invalid verse ID format', async () => {
      await expect(getVersesAfter('bible1', 'invalid-id', 1)).rejects.toThrow(
        new APIError('Invalid verse ID format', 400)
      );
    });
  });

  describe('getVersesBefore', () => {
    test('should return verses before a specific verse ID', async () => {
      // Mock chapter data
      const mockChapter = {
        id: 'JHN.3',
        reference: 'John 3',
        verseCount: 36,
        previous: { id: 'JHN.2', bookId: 'JHN', number: '2' }
      };

      // Mock verses list
      const mockVerses = [
        { id: 'JHN.3.14', reference: 'John 3:14', orgId: 'JHN.3.14' },
        { id: 'JHN.3.15', reference: 'John 3:15', orgId: 'JHN.3.15' },
        { id: 'JHN.3.16', reference: 'John 3:16', orgId: 'JHN.3.16' }
      ];

      // Mock verse content
      const mockVerseContent = {
        id: 'JHN.3.15',
        reference: 'John 3:15',
        content: 'that everyone who believes may have eternal life in him.',
        copyright: '© NIV'
      };

      // Setup axios mock for different calls
      mockedAxios.create.mockReturnThis();
      // First call to get chapter info
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockChapter }
      });
      // Second call to get verses in the chapter
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockVerses }
      });
      // Third call to get verse content
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockVerseContent }
      });

      // Execute
      const result = await getVersesBefore('bible1', 'JHN.3.16', 1);

      // Verify
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({
        id: mockVerseContent.id,
        reference: mockVerseContent.reference,
        text: mockVerseContent.content,
        copyright: mockVerseContent.copyright
      });
    });

    test('should throw an error with invalid verse ID format', async () => {
      await expect(getVersesBefore('bible1', 'invalid-id', 1)).rejects.toThrow(
        new APIError('Invalid verse ID format', 400)
      );
    });
  });
});