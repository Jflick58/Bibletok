'use client';

import { useState } from 'react';
import { useBible } from './contexts/BibleContext';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const Header: React.FC = () => {
  const router = useRouter();
  const { currentBible, availableBibles, setCurrentBible, likes } = useBible();
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  
  // Count liked verses
  const likedCount = Object.values(likes).filter(Boolean).length;
  
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/40 to-transparent pb-10">
      <div className="flex items-center gap-2">
        <div className="text-white text-2xl font-bold drop-shadow-lg">
          BibleTok
        </div>
        
        <button
          onClick={() => router.push('/likes')}
          className="flex items-center ml-3 bg-black/40 text-white rounded-full px-2 py-1.5 text-sm backdrop-blur-sm border border-white/10 drop-shadow-lg"
          aria-label="View liked verses"
        >
          <Heart className={`h-4 w-4 ${likedCount > 0 ? 'fill-red-500 text-red-500' : 'text-white'} mr-1`} />
          <span>{likedCount}</span>
        </button>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setIsSelectOpen(!isSelectOpen)}
          className="bg-black/40 text-white rounded-full px-3 py-1.5 text-sm backdrop-blur-sm border border-white/10 drop-shadow-lg"
        >
          {currentBible?.name?.length > 15 
            ? currentBible?.name.substring(0, 15) + '...' 
            : currentBible?.name || 'Select Bible'}
        </button>
        
        {isSelectOpen && (
          <>
            {/* Backdrop for closing dropdown when clicking outside */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsSelectOpen(false)}
            />
            
            <div className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg max-h-[70vh] overflow-y-auto z-20">
              {availableBibles.map(bible => (
                <button
                  key={bible.id}
                  className="block w-full text-left px-4 py-3 text-white hover:bg-white/10 text-sm"
                  onClick={() => {
                    setCurrentBible(bible.id);
                    setIsSelectOpen(false);
                  }}
                >
                  <div className="font-semibold">{bible.name}</div>
                  {bible.description && (
                    <div className="text-gray-400 text-xs mt-1 line-clamp-2">{bible.description}</div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};