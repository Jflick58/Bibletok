import { Request, Response } from 'express';
import * as bibleService from '../../services/bibleService';
import * as bibleController from '../../controllers/bibleController';
import { Bible, Verse } from '../../types/bible';

// Mock the bible service
jest.mock('../../services/bibleService');
const mockedBibleService = bibleService as jest.Mocked<typeof bibleService>;

describe('Bible Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBibles', () => {
    test('should return all bibles', async () => {
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

      // Mock service
      mockedBibleService.getAvailableBibles.mockResolvedValueOnce(mockBibles);

      // Execute
      await bibleController.getAllBibles(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Verify
      expect(mockedBibleService.getAvailableBibles).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ bibles: mockBibles });
    });

    test('should call next with error when service fails', async () => {
      // Mock service error
      const error = new Error('Service error');
      mockedBibleService.getAvailableBibles.mockRejectedValueOnce(error);

      // Execute
      await bibleController.getAllBibles(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Verify
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getBible', () => {
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

      // Setup request
      mockRequest = {
        params: { bibleId: 'bible1' }
      };

      // Mock service
      mockedBibleService.getBibleById.mockResolvedValueOnce(mockBible);

      // Execute
      await bibleController.getBible(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Verify
      expect(mockedBibleService.getBibleById).toHaveBeenCalledWith('bible1');
      expect(mockResponse.json).toHaveBeenCalledWith({ bible: mockBible });
    });
  });

  describe('getVerses', () => {
    test('should return verses for a Bible', async () => {
      // Mock verses
      const mockVerses: Verse[] = [
        {
          id: 'JHN.3.16',
          reference: 'John 3:16',
          text: 'For God so loved the world...',
          copyright: '© NIV'
        }
      ];

      // Setup request
      mockRequest = {
        params: { bibleId: 'bible1' }
      };

      // Mock service
      mockedBibleService.getFeaturedVerses.mockResolvedValueOnce(mockVerses);

      // Execute
      await bibleController.getVerses(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Verify
      expect(mockedBibleService.getFeaturedVerses).toHaveBeenCalledWith('bible1');
      expect(mockResponse.json).toHaveBeenCalledWith({ verses: mockVerses });
    });
  });

  describe('getVersesAfter', () => {
    test('should return verses after a specific verse', async () => {
      // Mock verses
      const mockVerses: Verse[] = [
        {
          id: 'JHN.3.17',
          reference: 'John 3:17',
          text: 'For God did not send his Son into the world to condemn the world...',
          copyright: '© NIV'
        }
      ];

      // Setup request
      mockRequest = {
        params: { bibleId: 'bible1', verseId: 'JHN.3.16' },
        query: { count: '3' }
      };

      // Mock service
      mockedBibleService.getVersesAfter.mockResolvedValueOnce(mockVerses);

      // Execute
      await bibleController.getVersesAfter(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Verify
      expect(mockedBibleService.getVersesAfter).toHaveBeenCalledWith('bible1', 'JHN.3.16', 3);
      expect(mockResponse.json).toHaveBeenCalledWith({ verses: mockVerses });
    });

    test('should use default count when not provided', async () => {
      // Mock verses
      const mockVerses: Verse[] = [
        {
          id: 'JHN.3.17',
          reference: 'John 3:17',
          text: 'For God did not send his Son into the world to condemn the world...',
          copyright: '© NIV'
        }
      ];

      // Setup request with no count
      mockRequest = {
        params: { bibleId: 'bible1', verseId: 'JHN.3.16' },
        query: {}
      };

      // Mock service
      mockedBibleService.getVersesAfter.mockResolvedValueOnce(mockVerses);

      // Execute
      await bibleController.getVersesAfter(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Default count should be used
      expect(mockedBibleService.getVersesAfter).toHaveBeenCalledWith('bible1', 'JHN.3.16', 5);
    });
  });

  describe('getVersesBefore', () => {
    test('should return verses before a specific verse', async () => {
      // Mock verses
      const mockVerses: Verse[] = [
        {
          id: 'JHN.3.15',
          reference: 'John 3:15',
          text: 'that everyone who believes may have eternal life in him.',
          copyright: '© NIV'
        }
      ];

      // Setup request
      mockRequest = {
        params: { bibleId: 'bible1', verseId: 'JHN.3.16' },
        query: { count: '2' }
      };

      // Mock service
      mockedBibleService.getVersesBefore.mockResolvedValueOnce(mockVerses);

      // Execute
      await bibleController.getVersesBefore(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Verify
      expect(mockedBibleService.getVersesBefore).toHaveBeenCalledWith('bible1', 'JHN.3.16', 2);
      expect(mockResponse.json).toHaveBeenCalledWith({ verses: mockVerses });
    });
  });
});