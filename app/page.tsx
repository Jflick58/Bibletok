'use client';

import { useEffect } from 'react';
import { VerseCard } from '@/components/VerseCard';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { useBible } from '@/components/contexts/BibleContext';

export default function Home() {
  const { 
    loading, 
    currentVerses, 
    currentIndex, 
    setCurrentIndex,
    fetchNextVerses,
    fetchPreviousVerses
  } = useBible();

  useEffect(() => {
    // Preload more verses when we're getting close to the end
    if (currentIndex >= currentVerses.length - 3) {
      fetchNextVerses();
    }
    
    // Preload previous verses when we're close to the beginning
    if (currentIndex <= 2 && currentIndex > 0) {
      fetchPreviousVerses();
    }
  }, [currentIndex, currentVerses.length, fetchNextVerses, fetchPreviousVerses]);

  const handleSwipeUp = () => {
    if (currentIndex < currentVerses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeDown = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading && currentVerses.length === 0) {
    return <LoadingIndicator />;
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-black relative">
      <Header />
      
      {currentVerses.length > 0 && (
        <div className="h-full w-full">
          <VerseCard 
            verse={currentVerses[currentIndex]} 
            onSwipeUp={handleSwipeUp}
            onSwipeDown={handleSwipeDown}
          />
          
          {/* Only show navigation arrows on non-touch devices, positioned on left side */}
          <div className="hidden md:block">
            <Navigation 
              onPrevious={handleSwipeDown}
              onNext={handleSwipeUp}
              canGoUp={currentIndex > 0}
              canGoDown={currentIndex < currentVerses.length - 1}
              position="left"
            />
          </div>
          
          <ProgressIndicator 
            currentIndex={currentIndex} 
            totalItems={currentVerses.length} 
          />
        </div>
      )}
    </div>
  );
}