'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Bible, VerseWithBackground } from '@/lib/types/bible';

const backgroundGradients = [
  "from-blue-900 to-indigo-800",
  "from-green-900 to-teal-800", 
  "from-purple-900 to-pink-800",
  "from-red-900 to-orange-800",
  "from-emerald-900 to-cyan-800",
  "from-amber-900 to-yellow-700",
  "from-violet-900 to-fuchsia-800",
  "from-blue-900 via-purple-800 to-pink-900",
  "from-green-900 via-emerald-800 to-teal-900",
  "from-rose-900 via-red-800 to-orange-900",
  "from-indigo-900 via-violet-800 to-purple-900",
  "from-cyan-900 via-sky-800 to-blue-900",
  "from-fuchsia-900 via-pink-800 to-rose-900",
  "from-yellow-900 via-amber-800 to-orange-900"
];

interface BibleContextProps {
  loading: boolean;
  availableBibles: Bible[];
  currentBible: Bible | null;
  currentVerses: VerseWithBackground[];
  currentIndex: number;
  setCurrentIndex: (currentIndex: number) => void;
  fetchNextVerses: () => Promise<void>;
  fetchPreviousVerses: () => Promise<void>;
  setCurrentBible: (currentBibleId: string) => void;
  likes: Record<string, boolean>;
  toggleLike: (likedVerseId: string) => void;
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
          // Define a more specific type for the API response
          interface ApiBibleData {
            id?: string;
            name?: string; 
            abbreviation?: string;
            description?: string;
            language?: {
              id?: string;
              name?: string;
              nameLocal?: string;
              script?: string;
              scriptDirection?: string;
            };
            [key: string]: unknown;
          }
          
          const mappedBibles = data.bibles.map((apiBible: ApiBibleData) => {
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
          }).filter((bible: Bible | null): bible is Bible => bible !== null); // Remove any nulls

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
          let savedBibleId: string | null = null;
          
          // Only access localStorage in browser environment
          if (typeof window !== 'undefined') {
            savedBibleId = localStorage.getItem('currentBible');
          }
          
          // Find the saved Bible if available, or use Free Bible Version by default
          let initialBible: Bible | undefined;
          
          if (savedBibleId) {
            initialBible = sortedBibles.find(bible => bible.id === savedBibleId);
          }
          
          // If no saved Bible or it wasn't found, look for the Free Bible Version
          if (!initialBible) {
            initialBible = sortedBibles.find(bible => bible.id === FREE_BIBLE_VERSION_ID) || sortedBibles[0];
          }
            
          if (initialBible) {
            setCurrentBible(initialBible);
          }
        }
      } catch (error) {
        console.error('Error fetching bibles:', error);
      }
    };
    
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
      const savedLikes = localStorage.getItem('bibletok-likes');
      if (savedLikes) {
        setLikes(JSON.parse(savedLikes));
      }
    }
    
    fetchBibles();
  }, []);

  // Save all verses we've seen for potential access in liked verses page
  useEffect(() => {
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined' && currentVerses.length > 0) {
      // Get existing verses
      const savedVerses = localStorage.getItem('bibletok-verses');
      let allVerses = savedVerses ? JSON.parse(savedVerses) : [];
      
      // Add new verses we don't already have
      const existingIds = new Set(allVerses.map((v: any) => v.id));
      const newVerses = currentVerses.filter(v => !existingIds.has(v.id)).map(v => ({
        id: v.id,
        reference: v.reference,
        text: v.text
        // copyright removed as requested
      }));
      
      if (newVerses.length > 0) {
        allVerses = [...allVerses, ...newVerses];
        localStorage.setItem('bibletok-verses', JSON.stringify(allVerses));
      }
      
      // Also save likes
      localStorage.setItem('bibletok-likes', JSON.stringify(likes));
    }
  }, [likes, currentVerses]);

  // Define fetchInitialVerses with useCallback to avoid dependency issues
  const fetchInitialVerses = useCallback(async () => {
    if (!currentBible) return;
    
    setLoading(true);
    try {
      // Check if the Bible ID matches the Free Bible Version ID
      const isFreeVersion = currentBible.id === FREE_BIBLE_VERSION_ID;
      
      // Add retry logic specifically for Free Bible Version
      let response: Response | null = null;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          response = await fetch(`/api/verses/${currentBible.id}`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            break; // Success, exit the retry loop
          }
          
          // If not successful and it's the Free Bible Version, retry
          if (isFreeVersion) {
            console.warn(`API request failed (attempt ${retries + 1}/${maxRetries}), retrying...`);
            retries++;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retrying
          } else {
            break; // If not Free Bible Version, don't retry
          }
        } catch (fetchError) {
          if (isFreeVersion && retries < maxRetries - 1) {
            console.warn(`API request error (attempt ${retries + 1}/${maxRetries}), retrying...`);
            retries++;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retrying
          } else {
            throw fetchError; // Give up and propagate the error
          }
        }
      }
      
      // Safely parse JSON with error handling
      let data;
      try {
        if (!response) {
          throw new Error('API response is undefined');
        }
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        
        // Generate fallback verses if parsing fails
        const fallbackVerses = [
          {
            id: `fallback-${Date.now()}-1`,
            reference: "Psalm 23:1",
            text: "The LORD is my shepherd; I shall not want.",
            copyright: "",
            backgroundGradient: backgroundGradients[0]
          },
          {
            id: `fallback-${Date.now()}-2`,
            reference: "John 3:16",
            text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
            copyright: "",
            backgroundGradient: backgroundGradients[1]
          }
        ];
        
        setCurrentVerses(fallbackVerses);
        setCurrentIndex(0);
        setLoading(false);
        return;
      }
      
      if (data && data.verses && Array.isArray(data.verses) && data.verses.length > 0) {
        // Shuffle the verses to get random non-sequential verses
        const shuffledVerses = [...data.verses].sort(() => Math.random() - 0.5);
        
        // Map API verses to our frontend verse interface with safety checks
        const mappedVerses = shuffledVerses.map((apiVerse: any) => ({
          id: apiVerse?.id || `fallback-${Date.now()}-${Math.random()}`,
          reference: apiVerse?.reference || 'Bible Verse',
          text: apiVerse?.text || 'The word of God is living and active.',
          copyright: apiVerse?.copyright || ''
        }));
        
        // Filter out any verses with empty text
        const validVerses = mappedVerses.filter(v => v.text && v.text.trim().length > 0);
        
        if (validVerses.length === 0) {
          // Create fallback verse if all filtered out
          validVerses.push({
            id: `fallback-${Date.now()}`,
            reference: "Romans 8:28",
            text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
            copyright: ""
          });
        }
        
        const versesWithBackgrounds = validVerses.map((verse, idx: number) => ({
          ...verse,
          backgroundGradient: backgroundGradients[idx % backgroundGradients.length]
        }));
        
        setCurrentVerses(versesWithBackgrounds);
        setCurrentIndex(0);
      } else {
        // Default fallback if no verses are returned
        const fallbackVerses = [
          {
            id: `fallback-${Date.now()}-1`,
            reference: "Proverbs 3:5-6",
            text: "Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",
            copyright: "",
            backgroundGradient: backgroundGradients[0]
          }
        ];
        
        setCurrentVerses(fallbackVerses);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching verses:', error);
      
      // Generate fallback verses if request fails
      const fallbackVerses = [
        {
          id: `fallback-${Date.now()}-1`,
          reference: "Isaiah 40:31",
          text: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
          copyright: "",
          backgroundGradient: backgroundGradients[0]
        }
      ];
      
      setCurrentVerses(fallbackVerses);
      setCurrentIndex(0);
    } finally {
      setLoading(false);
    }
  }, [currentBible]);

  useEffect(() => {
    if (currentBible) {
      // Only access localStorage in browser environment
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentBible', currentBible.id);
      }
      fetchInitialVerses();
    }
  }, [currentBible, fetchInitialVerses]);

  const fetchNextVerses = async () => {
    if (!currentBible || currentVerses.length === 0) return;
    
    if (currentIndex < currentVerses.length - 3) return;
    
    setLoading(true);
    try {
      // Check if the Bible ID matches the Free Bible Version ID
      const isFreeVersion = currentBible.id === FREE_BIBLE_VERSION_ID;
      
      // Add retry logic specifically for Free Bible Version
      let response: Response | null = null;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          response = await fetch(`/api/verses/${currentBible.id}`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            break; // Success, exit the retry loop
          }
          
          // If not successful and it's the Free Bible Version, retry
          if (isFreeVersion) {
            console.warn(`Next verses request failed (attempt ${retries + 1}/${maxRetries}), retrying...`);
            retries++;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retrying
          } else {
            break; // If not Free Bible Version, don't retry
          }
        } catch (fetchError) {
          if (isFreeVersion && retries < maxRetries - 1) {
            console.warn(`Next verses request error (attempt ${retries + 1}/${maxRetries}), retrying...`);
            retries++;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retrying
          } else {
            throw fetchError; // Give up and propagate the error
          }
        }
      }
      
      // Safely parse JSON with error handling
      let data;
      try {
        if (!response) {
          throw new Error('API response is undefined');
        }
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        setLoading(false);
        return;
      }
      
      if (data && data.verses && Array.isArray(data.verses) && data.verses.length > 0) {
        // Shuffle the verses to get random non-sequential verses
        const shuffledVerses = [...data.verses].sort(() => Math.random() - 0.5);
        
        // Filter out verses that are already in currentVerses to avoid duplicates
        const existingVerseIds = new Set(currentVerses.map(v => v.id));
        const newVerses = shuffledVerses.filter(v => v && v.id && !existingVerseIds.has(v.id));
        
        if (newVerses.length === 0) {
          // If all verses are already present, create some variation by reshuffling
          const randomVerses = shuffledVerses.slice(0, 5);
          
          // Map API verses to our frontend verse interface with safety checks
          const mappedVerses = randomVerses.map((apiVerse: any) => ({
            id: apiVerse?.id || `fallback-${Date.now()}-${Math.random()}`,
            reference: apiVerse?.reference || 'Bible Verse',
            text: apiVerse?.text || 'The word of God is living and active.',
            copyright: apiVerse?.copyright || ''
          }));
          
          const newVersesWithBackgrounds = mappedVerses.map((verse, idx: number) => ({
            ...verse,
            backgroundGradient: backgroundGradients[(currentVerses.length + idx) % backgroundGradients.length]
          }));
          
          setCurrentVerses(prevVerses => [...prevVerses, ...newVersesWithBackgrounds]);
        } else {
          // Map API verses to our frontend verse interface with safety checks
          const mappedVerses = newVerses.map((apiVerse: any) => ({
            id: apiVerse?.id || `fallback-${Date.now()}-${Math.random()}`,
            reference: apiVerse?.reference || 'Bible Verse',
            text: apiVerse?.text || 'The word of God is living and active.',
            copyright: apiVerse?.copyright || ''
          }));
          
          const newVersesWithBackgrounds = mappedVerses.map((verse, idx: number) => ({
            ...verse,
            backgroundGradient: backgroundGradients[(currentVerses.length + idx) % backgroundGradients.length]
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
      // Check if the Bible ID matches the Free Bible Version ID
      const isFreeVersion = currentBible.id === FREE_BIBLE_VERSION_ID;
      
      // Add retry logic specifically for Free Bible Version
      let response: Response | null = null;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          response = await fetch(`/api/verses/${currentBible.id}`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            break; // Success, exit the retry loop
          }
          
          // If not successful and it's the Free Bible Version, retry
          if (isFreeVersion) {
            console.warn(`Previous verses request failed (attempt ${retries + 1}/${maxRetries}), retrying...`);
            retries++;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retrying
          } else {
            break; // If not Free Bible Version, don't retry
          }
        } catch (fetchError) {
          if (isFreeVersion && retries < maxRetries - 1) {
            console.warn(`Previous verses request error (attempt ${retries + 1}/${maxRetries}), retrying...`);
            retries++;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retrying
          } else {
            throw fetchError; // Give up and propagate the error
          }
        }
      }
      
      // Safely parse JSON with error handling
      let data;
      try {
        if (!response) {
          throw new Error('API response is undefined');
        }
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        setLoading(false);
        return;
      }
      
      if (data && data.verses && Array.isArray(data.verses) && data.verses.length > 0) {
        // Shuffle the verses to get random non-sequential verses
        const shuffledVerses = [...data.verses].sort(() => Math.random() - 0.5);
        
        // Filter out verses that are already in currentVerses to avoid duplicates
        const existingVerseIds = new Set(currentVerses.map(v => v.id));
        const newVerses = shuffledVerses.filter(v => v && v.id && !existingVerseIds.has(v.id));
        
        if (newVerses.length === 0) {
          // If all verses are already present, create some variation by reshuffling
          const randomVerses = shuffledVerses.slice(0, 5);
          
          // Map API verses to our frontend verse interface with safety checks
          const mappedVerses = randomVerses.map((apiVerse: any) => ({
            id: apiVerse?.id || `fallback-${Date.now()}-${Math.random()}`,
            reference: apiVerse?.reference || 'Bible Verse',
            text: apiVerse?.text || 'The word of God is living and active.',
            copyright: apiVerse?.copyright || ''
          }));
          
          const newVersesWithBackgrounds = mappedVerses.map((verse, idx: number) => ({
            ...verse,
            backgroundGradient: backgroundGradients[idx % backgroundGradients.length]
          }));
          
          setCurrentVerses(prevVerses => [...newVersesWithBackgrounds, ...prevVerses]);
          setCurrentIndex(prev => prev + randomVerses.length);
        } else {
          // Map API verses to our frontend verse interface with safety checks
          const mappedVerses = newVerses.slice(0, 5).map((apiVerse: any) => ({
            id: apiVerse?.id || `fallback-${Date.now()}-${Math.random()}`,
            reference: apiVerse?.reference || 'Bible Verse',
            text: apiVerse?.text || 'The word of God is living and active.',
            copyright: apiVerse?.copyright || ''
          }));
          
          const newVersesWithBackgrounds = mappedVerses.map((verse, idx: number) => ({
            ...verse,
            backgroundGradient: backgroundGradients[idx % backgroundGradients.length]
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