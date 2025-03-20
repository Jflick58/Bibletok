import { renderHook, act } from '@testing-library/react';
import { useFetch } from './useFetch';

describe('useFetch', () => {
  it('initializes with loading state', () => {
    const { result } = renderHook(() => useFetch('https://api.example.com'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  it('has the correct structure', () => {
    const { result } = renderHook(() => useFetch('https://api.example.com'));
    
    expect(typeof result.current).toBe('object');
    expect('loading' in result.current).toBe(true);
    expect('error' in result.current).toBe(true);
    expect('data' in result.current).toBe(true);
  });

  it('accepts URL parameter', () => {
    const { result } = renderHook(() => useFetch('https://api.example.com'));
    
    // Just testing that it doesn't throw
    expect(result.current).toBeTruthy();
  });
});