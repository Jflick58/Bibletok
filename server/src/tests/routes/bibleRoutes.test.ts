import request from 'supertest';
import express from 'express';
import bibleRoutes from '../../routes/bibleRoutes';
import * as bibleService from '../../services/bibleService';
import { Bible, Verse } from '../../types/bible';

// Mock the bible service
jest.mock('../../services/bibleService');
const mockedBibleService = bibleService as jest.Mocked<typeof bibleService>;

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api', bibleRoutes);

// Generic error handler for tests
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message
  });
});

describe('Bible Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/bibles', () => {
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

      // Mock service
      mockedBibleService.getAvailableBibles.mockResolvedValueOnce(mockBibles);

      // Execute request
      const response = await request(app).get('/api/bibles');

      // Verify
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ bibles: mockBibles });
    });
  });

  describe('GET /api/bibles/:bibleId', () => {
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

      // Mock service
      mockedBibleService.getBibleById.mockResolvedValueOnce(mockBible);

      // Execute request
      const response = await request(app).get('/api/bibles/bible1');

      // Verify
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ bible: mockBible });
    });
  });

  describe('GET /api/verses/:bibleId', () => {
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

      // Mock service
      mockedBibleService.getFeaturedVerses.mockResolvedValueOnce(mockVerses);

      // Execute request
      const response = await request(app).get('/api/verses/bible1');

      // Verify
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ verses: mockVerses });
    });
  });

  describe('GET /api/verses/:bibleId/after/:verseId', () => {
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

      // Mock service
      mockedBibleService.getVersesAfter.mockResolvedValueOnce(mockVerses);

      // Execute request
      const response = await request(app).get('/api/verses/bible1/after/JHN.3.16?count=3');

      // Verify
      expect(response.status).toBe(200);
      expect(mockedBibleService.getVersesAfter).toHaveBeenCalledWith('bible1', 'JHN.3.16', 3);
      expect(response.body).toEqual({ verses: mockVerses });
    });
  });

  describe('GET /api/verses/:bibleId/before/:verseId', () => {
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

      // Mock service
      mockedBibleService.getVersesBefore.mockResolvedValueOnce(mockVerses);

      // Execute request
      const response = await request(app).get('/api/verses/bible1/before/JHN.3.16?count=2');

      // Verify
      expect(response.status).toBe(200);
      expect(mockedBibleService.getVersesBefore).toHaveBeenCalledWith('bible1', 'JHN.3.16', 2);
      expect(response.body).toEqual({ verses: mockVerses });
    });
  });
});