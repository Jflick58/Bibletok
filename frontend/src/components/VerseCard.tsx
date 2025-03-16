import React, { useState } from 'react';
import { Heart, Share, ExternalLink } from 'lucide-react';
import { VerseWithBackground } from '../types/Bible';
import { useBible } from '../contexts/BibleContext';

interface VerseCardProps {
  verse: VerseWithBackground;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
}

export const VerseCard: React.FC<VerseCardProps> = ({ verse, onSwipeUp, onSwipeDown }) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [swipeTransition, setSwipeTransition] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(null);
  const { likes, toggleLike } = useBible();

  const isLiked = likes[verse.id] || false;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      handleSwipeUp();
    } else if (touchEnd - touchStart > 100) {
      handleSwipeDown();
    }
  };

  const handleSwipeUp = () => {
    setSwipeDirection('up');
    setSwipeTransition(true);
    setTimeout(() => {
      onSwipeUp();
      setTimeout(() => {
        setSwipeTransition(false);
      }, 50);
    }, 200);
  };

  const handleSwipeDown = () => {
    setSwipeDirection('down');
    setSwipeTransition(true);
    setTimeout(() => {
      onSwipeDown();
      setTimeout(() => {
        setSwipeTransition(false);
      }, 50);
    }, 200);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: verse.reference,
          text: verse.text,
          url: window.location.href
        });
      } else {
        const text = `${verse.reference}\n${verse.text}`;
        await navigator.clipboard.writeText(text);
        alert('Verse copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDoubleTap = () => {
    toggleLike(verse.id);
  };

  return (
    <div 
      className={`h-full w-full flex items-center justify-center bg-gradient-to-b ${verse.backgroundGradient} ${
        swipeTransition 
        ? swipeDirection === 'up' 
          ? 'animate-slide-up' 
          : 'animate-slide-down'
        : ''
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleTap}
    >
      <div className="w-full max-w-md text-center px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6 text-white">{verse.text}</h1>
          <p className="text-lg text-white/90 mb-2">{verse.reference}</p>
        </div>
        
        {/* Action buttons */}
        <div className="fixed bottom-8 right-4 flex flex-col items-center space-y-4">
          <button 
            className="flex flex-col items-center"
            onClick={() => toggleLike(verse.id)}
          >
            <Heart className={`h-8 w-8 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            <span className="text-xs mt-1 text-white">Like</span>
          </button>
          
          <button className="flex flex-col items-center" onClick={handleShare}>
            <Share className="h-8 w-8 text-white" />
            <span className="text-xs mt-1 text-white">Share</span>
          </button>
          
          <a 
            href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(verse.reference)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center"
          >
            <ExternalLink className="h-8 w-8 text-white" />
            <span className="text-xs mt-1 text-white">Read</span>
          </a>
        </div>
      </div>
    </div>
  );
};