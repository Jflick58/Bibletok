import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BibleContextProvider, useBible } from '../../contexts/BibleContext';

// Test component to expose context values
const TestComponent = () => {
  const { 
    currentBible, 
    currentVerses, 
    currentIndex, 
    loading,
    likes,
    setCurrentIndex,
    fetchNextVerses,
    fetchPreviousVerses,
    toggleLike
  } = useBible();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="current-bible">{currentBible ? currentBible.name : 'No Bible'}</div>
      <div data-testid="current-index">{currentIndex}</div>
      <div data-testid="verses-count">{currentVerses.length}</div>
      
      {currentVerses.length > 0 && currentIndex < currentVerses.length && (
        <div data-testid="current-verse-text">
          {currentVerses[currentIndex]?.text}
        </div>
      )}
      
      <button 
        data-testid="like-button" 
        onClick={() => currentVerses.length > 0 && toggleLike(currentVerses[currentIndex].id)}
      >
        Like
      </button>
      
      <div data-testid="is-liked">
        {currentVerses.length > 0 && likes[currentVerses[currentIndex]?.id] ? 'Liked' : 'Not Liked'}
      </div>
      
      <button data-testid="next-verse" onClick={() => setCurrentIndex(currentIndex + 1)}>
        Next
      </button>
      
      <button data-testid="prev-verse" onClick={() => setCurrentIndex(currentIndex - 1)}>
        Previous
      </button>
      
      <button data-testid="fetch-next" onClick={() => fetchNextVerses()}>
        Fetch Next
      </button>
      
      <button data-testid="fetch-prev" onClick={() => fetchPreviousVerses()}>
        Fetch Previous
      </button>
    </div>
  );
};

describe('BibleContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('should fetch bibles and initial verses', async () => {
    render(
      <BibleContextProvider>
        <TestComponent />
      </BibleContextProvider>
    );

    // Should initially show loading
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // Wait for data to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Should have loaded the first Bible
    expect(screen.getByTestId('current-bible').textContent).toBe('New International Version');
    
    // Should have loaded some verses
    expect(parseInt(screen.getByTestId('verses-count').textContent || '0')).toBeGreaterThan(0);
    
    // Should start at index 0
    expect(screen.getByTestId('current-index').textContent).toBe('0');
    
    // Should show the first verse text
    expect(screen.getByTestId('current-verse-text')).toBeInTheDocument();
  });

  test('should navigate between verses', async () => {
    const user = userEvent.setup();
    
    render(
      <BibleContextProvider>
        <TestComponent />
      </BibleContextProvider>
    );

    // Wait for data to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Initial index should be 0
    expect(screen.getByTestId('current-index').textContent).toBe('0');
    
    // Navigate to next verse
    await user.click(screen.getByTestId('next-verse'));
    
    // Index should now be 1
    expect(screen.getByTestId('current-index').textContent).toBe('1');
    
    // Navigate back to first verse
    await user.click(screen.getByTestId('prev-verse'));
    
    // Index should be back to 0
    expect(screen.getByTestId('current-index').textContent).toBe('0');
  });

  test('should toggle verse likes', async () => {
    const user = userEvent.setup();
    
    render(
      <BibleContextProvider>
        <TestComponent />
      </BibleContextProvider>
    );

    // Wait for data to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Initially verse should not be liked
    expect(screen.getByTestId('is-liked').textContent).toBe('Not Liked');
    
    // Toggle like
    await user.click(screen.getByTestId('like-button'));
    
    // Verse should now be liked
    expect(screen.getByTestId('is-liked').textContent).toBe('Liked');
    
    // Toggle like again
    await user.click(screen.getByTestId('like-button'));
    
    // Verse should now be unliked
    expect(screen.getByTestId('is-liked').textContent).toBe('Not Liked');
  });

  test('should fetch additional verses', async () => {
    const user = userEvent.setup();
    
    render(
      <BibleContextProvider>
        <TestComponent />
      </BibleContextProvider>
    );

    // Wait for data to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Get initial verse count
    const initialCount = parseInt(screen.getByTestId('verses-count').textContent || '0');
    
    // Fetch next verses
    await user.click(screen.getByTestId('fetch-next'));
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Get updated verse count
    const newCount = parseInt(screen.getByTestId('verses-count').textContent || '0');
    
    // Should have more verses now or at least the same number (if we were at the end)
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });
});