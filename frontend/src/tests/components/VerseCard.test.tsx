import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VerseCard } from '../../components/VerseCard';
import { BibleContextProvider } from '../../contexts/BibleContext';

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

  test('handles touch events correctly', () => {
    render(
      <BibleContextProvider>
        <VerseCard verse={mockVerse} {...mockCallbacks} />
      </BibleContextProvider>
    );

    const card = screen.getByText(mockVerse.text).closest('div');
    expect(card).not.toBeNull();

    if (card) {
      // Simulate swipe up
      fireEvent.touchStart(card, { targetTouches: [{ clientY: 500 }] });
      fireEvent.touchMove(card, { targetTouches: [{ clientY: 300 }] });
      fireEvent.touchEnd(card);

      // There's a timeout in the component, so we can't directly test the callback
      // But we can test that the swipe transition class is applied
      expect(card.className).toContain('animate-slide-up');
      
      // Simulate swipe down
      fireEvent.touchStart(card, { targetTouches: [{ clientY: 300 }] });
      fireEvent.touchMove(card, { targetTouches: [{ clientY: 500 }] });
      fireEvent.touchEnd(card);

      // Test swipe down transition
      expect(card.className).toContain('animate-slide-down');
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