import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VerseCard } from '../../components/VerseCard';
import { BibleContextProvider } from '../../contexts/BibleContext';

// Fix jest-dom matchers
import '@testing-library/jest-dom';

// Mock the useBible hook
vi.mock('../../contexts/BibleContext', async () => {
  const actual = await vi.importActual('../../contexts/BibleContext');
  return {
    ...actual,
    useBible: () => ({
      likes: { 'JHN.3.16': true, 'PSA.23.1': false },
      toggleLike: vi.fn()
    })
  };
});

describe('VerseCard', () => {
  const mockVerse = {
    id: 'JHN.3.16',
    reference: 'John 3:16',
    text: 'For God so loved the world...',
    copyright: '© NIV',
    backgroundGradient: 'from-blue-900 to-indigo-800'
  };

  const mockCallbacks = {
    onSwipeUp: vi.fn(),
    onSwipeDown: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the verse content correctly', () => {
    render(
      <BibleContextProvider>
        <VerseCard verse={mockVerse} {...mockCallbacks} />
      </BibleContextProvider>
    );

    expect(screen.getByText(mockVerse.text)).toBeInTheDocument();
    expect(screen.getByText(mockVerse.reference)).toBeInTheDocument();
  });

  test('handles touch events correctly', async () => {
    render(
      <BibleContextProvider>
        <VerseCard verse={mockVerse} {...mockCallbacks} />
      </BibleContextProvider>
    );

    // Find the root container of the card
    const card = screen.getByTestId('verse-card-container') || screen.getByText(mockVerse.text).closest('.w-full');
    expect(card).not.toBeNull();

    if (card) {
      // Verify that swipe callbacks are called
      // Simulate swipe up
      fireEvent.touchStart(card, { targetTouches: [{ clientY: 500 }] });
      fireEvent.touchMove(card, { targetTouches: [{ clientY: 300 }] });
      fireEvent.touchEnd(card);

      // Verify the callback was called
      await new Promise(r => setTimeout(r, 300)); // Wait for animation timeout
      expect(mockCallbacks.onSwipeUp).toHaveBeenCalledTimes(1);
      
      // Simulate swipe down
      fireEvent.touchStart(card, { targetTouches: [{ clientY: 300 }] });
      fireEvent.touchMove(card, { targetTouches: [{ clientY: 500 }] });
      fireEvent.touchEnd(card);

      // Verify the callback was called
      await new Promise(r => setTimeout(r, 300)); // Wait for animation timeout
      expect(mockCallbacks.onSwipeDown).toHaveBeenCalledTimes(1);
    }
  });

  test('renders action buttons', () => {
    render(
      <BibleContextProvider>
        <VerseCard verse={mockVerse} {...mockCallbacks} />
      </BibleContextProvider>
    );

    // Find action buttons
    expect(screen.getByText('Like')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Read')).toBeInTheDocument();
  });

  test('external link points to correct URL', () => {
    render(
      <BibleContextProvider>
        <VerseCard verse={mockVerse} {...mockCallbacks} />
      </BibleContextProvider>
    );

    // Find the "Read" link and check its href
    const readLink = screen.getByText('Read').closest('a');
    expect(readLink).toHaveAttribute(
      'href', 
      `https://www.biblegateway.com/passage/?search=${encodeURIComponent(mockVerse.reference)}`
    );
    expect(readLink).toHaveAttribute('target', '_blank');
    expect(readLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});