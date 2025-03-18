import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { BibleContextProvider } from '../contexts/BibleContext';
import '@testing-library/jest-dom';

describe('App Component', () => {
  beforeEach(() => {
    // Reset localStorage between tests
    localStorage.clear();
  });

  test('renders loading indicator when loading', async () => {
    render(
      <BibleContextProvider>
        <App />
      </BibleContextProvider>
    );
    
    // Loading indicator should be visible initially
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });

  test('renders verse card after loading', async () => {
    render(
      <BibleContextProvider>
        <App />
      </BibleContextProvider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Header should be rendered
    expect(screen.getByText('BibleTok')).toBeInTheDocument();
    
    // A verse card should be rendered
    const verseText = screen.getByText(/For God so loved the world/i);
    expect(verseText).toBeInTheDocument();
    
    // Navigation controls should be visible
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    
    // Progress indicator should be visible
    expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
  });

  test('navigation buttons work correctly', async () => {
    const user = userEvent.setup();
    render(
      <BibleContextProvider>
        <App />
      </BibleContextProvider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Find navigation buttons
    const upButton = screen.getByLabelText('Previous verse');
    const downButton = screen.getByLabelText('Next verse');
    
    // Initially, we should be at verse index 0, so previous button should be disabled
    expect(upButton).toBeDisabled();
    expect(downButton).not.toBeDisabled();
    
    // Navigate to the next verse
    await user.click(downButton);
    
    // Now previous button should be enabled
    await waitFor(() => {
      expect(upButton).not.toBeDisabled();
    });
    
    // Navigate back to first verse
    await user.click(upButton);
    
    // Previous button should be disabled again
    await waitFor(() => {
      expect(upButton).toBeDisabled();
    });
  });
});