import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupMockServer } from './mocks/server';

// Set up MSW server for tests
setupMockServer();

// Automatically clean up after each test
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});

// Mock navigator.share
Object.defineProperty(window, 'navigator', {
  writable: true,
  value: {
    ...window.navigator,
    share: vi.fn().mockResolvedValue(true),
    clipboard: {
      writeText: vi.fn().mockResolvedValue(true)
    }
  }
});