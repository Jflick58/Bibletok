import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface NavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoUp: boolean;
  canGoDown: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  onPrevious, 
  onNext,
  canGoUp,
  canGoDown
}) => {
  return (
    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex flex-col space-y-4">
      <button 
        onClick={onPrevious} 
        disabled={!canGoUp}
        className={`p-2 rounded-full bg-white/20 ${!canGoUp ? 'opacity-50' : 'hover:bg-white/30'}`}
        aria-label="Previous verse"
      >
        <ChevronUp className="h-6 w-6 text-white" />
      </button>
      <button 
        onClick={onNext} 
        disabled={!canGoDown}
        className={`p-2 rounded-full bg-white/20 ${!canGoDown ? 'opacity-50' : 'hover:bg-white/30'}`}
        aria-label="Next verse"
      >
        <ChevronDown className="h-6 w-6 text-white" />
      </button>
    </div>
  );
};