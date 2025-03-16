import React, { useState } from 'react';
import { Book, X } from 'lucide-react';
import { useBible } from '../contexts/BibleContext';

export const VersionSelector: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { availableBibles, currentBible, setCurrentBible } = useBible();

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleVersionSelect = (bibleId: string) => {
    setCurrentBible(bibleId);
    setIsModalOpen(false);
  };

  return (
    <>
      <button 
        onClick={toggleModal}
        className="p-2 rounded-full hover:bg-white/10"
        aria-label="Select Bible version"
      >
        <Book className="h-6 w-6 text-white" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg p-6 w-80 max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Bible Versions</h2>
              <button 
                onClick={toggleModal}
                className="text-white/70 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {availableBibles.map((bible) => (
                <button
                  key={bible.id}
                  onClick={() => handleVersionSelect(bible.id)}
                  className={`w-full p-3 text-left rounded-lg ${
                    currentBible?.id === bible.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  <span className="font-semibold">{bible.abbreviation}</span>
                  <p className="text-sm opacity-80">{bible.name}</p>
                  {bible.language.nameLocal !== bible.language.name && (
                    <p className="text-xs opacity-60 mt-1">{bible.language.nameLocal}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};