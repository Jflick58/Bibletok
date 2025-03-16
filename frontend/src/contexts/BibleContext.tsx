import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Bible, VerseWithBackground } from '../types/Bible';

const backgroundGradients = [
  "from-blue-900 to-indigo-800",
  "from-green-900 to-teal-800", 
  "from-purple-900 to-pink-800",
  "from-red-900 to-orange-800",
  "from-emerald-900 to-cyan-800",
  "from-amber-900 to-yellow-700",
  "from-violet-900 to-fuchsia-800"
];

interface BibleContextProps {
  loading: boolean;
  availableBibles: Bible[];
  currentBible: Bible | null;
  currentVerses: VerseWithBackground[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  fetchNextVerses: () => Promise<void>;
  fetchPreviousVerses: () => Promise<void>;
  setCurrentBible: (bibleId: string) => void;
  likes: Record<string, boolean>;
  toggleLike: (verseId: string) => void;
}

const BibleContext = createContext<BibleContextProps | undefined>(undefined);

export const BibleContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [availableBibles, setAvailableBibles] = useState<Bible[]>([]);
  const [currentBible, setCurrentBible] = useState<Bible | null>(null);
  const [currentVerses, setCurrentVerses] = useState<VerseWithBackground[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchBibles = async () => {
      try {
        const response = await fetch('/api/bibles');
        const data = await response.json();
        
        if (data.bibles && data.bibles.length > 0) {
          setAvailableBibles(data.bibles);
          const savedBibleId = localStorage.getItem('currentBible');
          const initialBible = savedBibleId 
            ? data.bibles.find((bible: Bible) => bible.id === savedBibleId) 
            : data.bibles[0];
            
          if (initialBible) {
            setCurrentBible(initialBible);
          }
        }
      } catch (error) {
        console.error('Error fetching bibles:', error);
      }
    };
    
    const savedLikes = localStorage.getItem('bibletok-likes');
    if (savedLikes) {
      setLikes(JSON.parse(savedLikes));
    }
    
    fetchBibles();
  }, []);

  useEffect(() => {
    localStorage.setItem('bibletok-likes', JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    if (currentBible) {
      localStorage.setItem('currentBible', currentBible.id);
      fetchInitialVerses();
    }
  }, [currentBible]);

  const fetchInitialVerses = async () => {
    if (!currentBible) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/verses/${currentBible.id}`);
      const data = await response.json();
      
      if (data.verses) {
        const versesWithBackgrounds = data.verses.map((verse: any, index: number) => ({
          ...verse,
          backgroundGradient: backgroundGradients[index % backgroundGradients.length]
        }));
        
        setCurrentVerses(versesWithBackgrounds);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextVerses = async () => {
    if (!currentBible || currentVerses.length === 0) return;
    
    if (currentIndex < currentVerses.length - 3) return;
    
    setLoading(true);
    try {
      const lastVerseId = currentVerses[currentVerses.length - 1].id;
      const response = await fetch(`/api/verses/${currentBible.id}/after/${lastVerseId}`);
      const data = await response.json();
      
      if (data.verses && data.verses.length > 0) {
        const newVersesWithBackgrounds = data.verses.map((verse: any, index: number) => ({
          ...verse,
          backgroundGradient: backgroundGradients[(currentVerses.length + index) % backgroundGradients.length]
        }));
        
        setCurrentVerses(prevVerses => [...prevVerses, ...newVersesWithBackgrounds]);
      }
    } catch (error) {
      console.error('Error fetching next verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousVerses = async () => {
    if (!currentBible || currentVerses.length === 0 || currentIndex > 2) return;
    
    setLoading(true);
    try {
      const firstVerseId = currentVerses[0].id;
      const response = await fetch(`/api/verses/${currentBible.id}/before/${firstVerseId}`);
      const data = await response.json();
      
      if (data.verses && data.verses.length > 0) {
        const newVersesWithBackgrounds = data.verses.map((verse: any, index: number) => ({
          ...verse,
          backgroundGradient: backgroundGradients[index % backgroundGradients.length]
        }));
        
        setCurrentVerses(prevVerses => [...newVersesWithBackgrounds, ...prevVerses]);
        setCurrentIndex(prev => prev + data.verses.length);
      }
    } catch (error) {
      console.error('Error fetching previous verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeBible = useCallback((bibleId: string) => {
    const bible = availableBibles.find(b => b.id === bibleId);
    if (bible) {
      setCurrentBible(bible);
    }
  }, [availableBibles]);

  const toggleLike = (verseId: string) => {
    setLikes(prev => ({
      ...prev,
      [verseId]: !prev[verseId]
    }));
  };

  return (
    <BibleContext.Provider value={{
      loading,
      availableBibles,
      currentBible,
      currentVerses,
      currentIndex,
      setCurrentIndex,
      fetchNextVerses,
      fetchPreviousVerses,
      setCurrentBible: changeBible,
      likes,
      toggleLike
    }}>
      {children}
    </BibleContext.Provider>
  );
};

export const useBible = () => {
  const context = useContext(BibleContext);
  if (context === undefined) {
    throw new Error('useBible must be used within a BibleContextProvider');
  }
  return context;
};