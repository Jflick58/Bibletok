import React, { useEffect } from 'react';
import { VerseCard } from './components/VerseCard';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ProgressIndicator } from './components/ProgressIndicator';
import { useBible } from './contexts/BibleContext';

const App: React.FC = () => {
  const { 
    loading, 
    currentVerses, 
    currentIndex, 
    setCurrentIndex,
    fetchNextVerses,
    fetchPreviousVerses
  } = useBible();

  useEffect(() => {
    if (currentIndex >= currentVerses.length - 3) {
      fetchNextVerses();
    }
  }, [currentIndex, currentVerses.length, fetchNextVerses]);

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
          
          <Navigation 
            onPrevious={handleSwipeDown}
            onNext={handleSwipeUp}
            canGoUp={currentIndex > 0}
            canGoDown={currentIndex < currentVerses.length - 1}
          />
          
          <ProgressIndicator 
            currentIndex={currentIndex} 
            totalItems={currentVerses.length} 
          />
        </div>
      )}
    </div>
  );
};

export default App;