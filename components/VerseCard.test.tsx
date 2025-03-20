import { render, screen, fireEvent } from '@testing-library/react';
import { VerseCard } from './VerseCard';

// Mock the BibleContext hook
jest.mock('./contexts/BibleContext', () => ({
  useBible: () => ({
    toggleLike: jest.fn(),
    likes: { '123': true }
  })
}));

describe('VerseCard Component', () => {
  const mockVerse = {
    id: '123',
    reference: 'John 3:16',
    text: 'For God so loved the world...',
    backgroundGradient: 'from-blue-900 to-indigo-800'
  };

  it('renders verse text and reference correctly', () => {
    render(<VerseCard verse={mockVerse} onSwipeUp={jest.fn()} onSwipeDown={jest.fn()} />);
    
    expect(screen.getByText('For God so loved the world...')).toBeInTheDocument();
    expect(screen.getByText('John 3:16')).toBeInTheDocument();
  });

  it('applies the correct background gradient', () => {
    render(<VerseCard verse={mockVerse} onSwipeUp={jest.fn()} onSwipeDown={jest.fn()} />);
    
    const cardElement = screen.getByTestId('verse-card');
    expect(cardElement).toHaveClass('from-blue-900');
    expect(cardElement).toHaveClass('to-indigo-800');
  });

  it('renders the like button correctly', () => {
    render(<VerseCard verse={mockVerse} onSwipeUp={jest.fn()} onSwipeDown={jest.fn()} />);
    
    // Find the like button (the Heart icon)
    const likeButton = screen.getByText('Like', { exact: false });
    expect(likeButton).toBeInTheDocument();
  });
});