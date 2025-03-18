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

  // Free Bible Version ID
  const FREE_BIBLE_VERSION_ID = '65eec8e0b60e656b-01';
  
  useEffect(() => {
    const fetchBibles = async () => {
      try {
        const response = await fetch('/api/bibles');
        const data = await response.json();
        
        // Safer data handling - check if data.bibles is an array
        if (data && data.bibles && Array.isArray(data.bibles) && data.bibles.length > 0) {
          // Map API Bible objects to our frontend Bible interface with safer property access
          const mappedBibles = data.bibles.map((apiBible: any) => {
            // Make sure we're getting a valid object
            if (!apiBible || typeof apiBible !== 'object') {
              console.error('Invalid Bible object:', apiBible);
              return null;
            }
            
            return {
              id: apiBible.id || '',
              name: apiBible.name || '',
              abbreviation: apiBible.abbreviation || '',
              description: apiBible.description || '',
              language: {
                id: (apiBible.language && apiBible.language.id) || '',
                name: (apiBible.language && apiBible.language.name) || '',
                nameLocal: (apiBible.language && apiBible.language.nameLocal) || '',
                script: (apiBible.language && apiBible.language.script) || '',
                scriptDirection: (apiBible.language && apiBible.language.scriptDirection) || 'ltr'
              }
            };
          }).filter(bible => bible !== null); // Remove any nulls

          // Sort Bibles alphabetically by name
          const sortedBibles = [...mappedBibles].sort((a, b) => {
            // If one of them is the Free Bible Version, prioritize it
            if (a.id === FREE_BIBLE_VERSION_ID) return -1;
            if (b.id === FREE_BIBLE_VERSION_ID) return 1;
            
            // Otherwise, sort alphabetically
            return a.name.localeCompare(b.name);
          });
          
          setAvailableBibles(sortedBibles);
          
          // Try to get the saved Bible ID from localStorage
          const savedBibleId = localStorage.getItem('currentBible');
          
          // Find the saved Bible if available, or use Free Bible Version by default
          let initialBible;
          
          if (savedBibleId) {
            initialBible = sortedBibles.find((bible: Bible) => bible.id === savedBibleId);
          }
          
          // If no saved Bible or it wasn't found, look for the Free Bible Version
          if (!initialBible) {
            initialBible = sortedBibles.find((bible: Bible) => bible.id === FREE_BIBLE_VERSION_ID) || sortedBibles[0];
          }
            
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
        // Shuffle the verses to get random non-sequential verses
        const shuffledVerses = [...data.verses].sort(() => Math.random() - 0.5);
        
        // Map API verses to our frontend verse interface
        const mappedVerses = shuffledVerses.map((apiVerse: any) => ({
          id: apiVerse.id || '',
          reference: apiVerse.reference || '',
          text: apiVerse.text || '',
          copyright: apiVerse.copyright || ''
        }));
        
        const versesWithBackgrounds = mappedVerses.map((verse, index: number) => ({
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
      // Instead of fetching verses sequentially, get fresh featured verses
      const response = await fetch(`/api/verses/${currentBible.id}`);
      const data = await response.json();
      
      if (data.verses && data.verses.length > 0) {
        // Shuffle the verses to get random non-sequential verses
        const shuffledVerses = [...data.verses].sort(() => Math.random() - 0.5);
        
        // Filter out verses that are already in currentVerses to avoid duplicates
        const existingVerseIds = new Set(currentVerses.map(v => v.id));
        const newVerses = shuffledVerses.filter(v => !existingVerseIds.has(v.id));
        
        if (newVerses.length === 0) {
          // If all verses are already present, create some variation by reshuffling
          const randomVerses = shuffledVerses.slice(0, 5);
          
          // Map API verses to our frontend verse interface
          const mappedVerses = randomVerses.map((apiVerse: any) => ({
            id: apiVerse.id || '',
            reference: apiVerse.reference || '',
            text: apiVerse.text || '',
            copyright: apiVerse.copyright || ''
          }));
          
          const newVersesWithBackgrounds = mappedVerses.map((verse, index: number) => ({
            ...verse,
            backgroundGradient: backgroundGradients[(currentVerses.length + index) % backgroundGradients.length]
          }));
          
          setCurrentVerses(prevVerses => [...prevVerses, ...newVersesWithBackgrounds]);
        } else {
          // Map API verses to our frontend verse interface
          const mappedVerses = newVerses.map((apiVerse: any) => ({
            id: apiVerse.id || '',
            reference: apiVerse.reference || '',
            text: apiVerse.text || '',
            copyright: apiVerse.copyright || ''
          }));
          
          const newVersesWithBackgrounds = mappedVerses.map((verse, index: number) => ({
            ...verse,
            backgroundGradient: backgroundGradients[(currentVerses.length + index) % backgroundGradients.length]
          }));
          
          setCurrentVerses(prevVerses => [...prevVerses, ...newVersesWithBackgrounds]);
        }
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
      // Instead of fetching verses sequentially, get fresh featured verses
      const response = await fetch(`/api/verses/${currentBible.id}`);
      const data = await response.json();
      
      if (data.verses && data.verses.length > 0) {
        // Shuffle the verses to get random non-sequential verses
        const shuffledVerses = [...data.verses].sort(() => Math.random() - 0.5);
        
        // Filter out verses that are already in currentVerses to avoid duplicates
        const existingVerseIds = new Set(currentVerses.map(v => v.id));
        const newVerses = shuffledVerses.filter(v => !existingVerseIds.has(v.id));
        
        if (newVerses.length === 0) {
          // If all verses are already present, create some variation by reshuffling
          const randomVerses = shuffledVerses.slice(0, 5);
          
          // Map API verses to our frontend verse interface
          const mappedVerses = randomVerses.map((apiVerse: any) => ({
            id: apiVerse.id || '',
            reference: apiVerse.reference || '',
            text: apiVerse.text || '',
            copyright: apiVerse.copyright || ''
          }));
          
          const newVersesWithBackgrounds = mappedVerses.map((verse, index: number) => ({
            ...verse,
            backgroundGradient: backgroundGradients[index % backgroundGradients.length]
          }));
          
          setCurrentVerses(prevVerses => [...newVersesWithBackgrounds, ...prevVerses]);
          setCurrentIndex(prev => prev + randomVerses.length);
        } else {
          // Map API verses to our frontend verse interface
          const mappedVerses = newVerses.slice(0, 5).map((apiVerse: any) => ({
            id: apiVerse.id || '',
            reference: apiVerse.reference || '',
            text: apiVerse.text || '',
            copyright: apiVerse.copyright || ''
          }));
          
          const newVersesWithBackgrounds = mappedVerses.map((verse, index: number) => ({
            ...verse,
            backgroundGradient: backgroundGradients[index % backgroundGradients.length]
          }));
          
          setCurrentVerses(prevVerses => [...newVersesWithBackgrounds, ...prevVerses]);
          setCurrentIndex(prev => prev + mappedVerses.length);
        }
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