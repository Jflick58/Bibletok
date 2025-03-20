'use client';

import { useState } from 'react';
import { Heart, Share } from 'lucide-react';
import { VerseWithBackground } from '@/lib/types/bible';
import { useBible } from './contexts/BibleContext';

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
      data-testid="verse-card"
    >
      <div className="w-full h-full flex flex-col justify-center items-center px-4 md:px-6">
        <div className="max-w-md w-full text-center flex flex-col justify-center items-center h-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-8 text-white drop-shadow-lg whitespace-pre-wrap leading-relaxed">{verse.text}</h1>
          <p className="text-base sm:text-lg text-white/90 drop-shadow-lg">{verse.reference}</p>
          {/* Copyright removed as requested */}
        </div>
        
        {/* Action buttons */}
        <div className="fixed bottom-16 right-4 flex flex-col items-center space-y-6 z-10">
          <button 
            className="flex flex-col items-center"
            onClick={() => toggleLike(verse.id)}
            aria-label="Like verse"
          >
            <Heart className={`h-10 w-10 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            <span className="text-xs mt-1 text-white">{isLiked ? 'Liked' : 'Like'}</span>
          </button>
          
          <button 
            className="flex flex-col items-center" 
            onClick={handleShare}
            aria-label="Share verse"
          >
            <Share className="h-10 w-10 text-white" />
            <span className="text-xs mt-1 text-white">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};