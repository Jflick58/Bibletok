import { renderHook, act } from '@testing-library/react';
import { useFetch } from './useFetch';

describe('useFetch', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Setup fetch mock
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'test data' }),
      })
    );
  });

  it('should fetch data successfully', async () => {
    const { result } = renderHook(() => useFetch('https://api.example.com'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
    
    // Wait for the fetch to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toEqual({ data: 'test data' });
    expect(fetch).toHaveBeenCalledWith('https://api.example.com', undefined);
  });

  it('should handle fetch errors', async () => {
    // Mock fetch to reject
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.reject(new Error('Network error'))
    );
    
    const { result } = renderHook(() => useFetch('https://api.example.com'));
    
    // Wait for the fetch to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Network error'));
    expect(result.current.data).toBe(null);
  });

  it('should refetch when url changes', async () => {
    const { result, rerender } = renderHook(
      ({ url }) => useFetch(url), 
      { initialProps: { url: 'https://api.example.com/1' } }
    );
    
    // Wait for the first fetch to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/1', undefined);
    
    // Change URL and rerender
    rerender({ url: 'https://api.example.com/2' });
    
    // Wait for the second fetch to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/2', undefined);
  });
});