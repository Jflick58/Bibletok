import { APIError, handleError } from '../../utils/errors';

describe('Error Utilities', () => {
  describe('APIError', () => {
    test('should create an error with correct properties', () => {
      const errorMessage = 'Test error message';
      const statusCode = 400;
      const error = new APIError(errorMessage, statusCode);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(APIError);
      expect(error.message).toBe(errorMessage);
      expect(error.statusCode).toBe(statusCode);
      expect(error.name).toBe('APIError');
    });
  });

  describe('handleError', () => {
    test('should handle APIError correctly', () => {
      const errorMessage = 'API Error Message';
      const statusCode = 400;
      const error = new APIError(errorMessage, statusCode);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      handleError(error, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode,
        message: errorMessage
      });
    });

    test('should handle generic Error correctly', () => {
      const errorMessage = 'Generic Error Message';
      const error = new Error(errorMessage);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      handleError(error, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 500,
        message: errorMessage
      });
    });

    test('should handle error without message', () => {
      const error = { stack: 'Error stack' };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      handleError(error, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 500,
        message: 'Internal Server Error'
      });
    });
  });
});