'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBible } from '@/components/contexts/BibleContext';
import { Heart, ArrowLeft, Download } from 'lucide-react';

export default function LikesPage() {
  const router = useRouter();
  const { likes } = useBible();
  const [likedVerses, setLikedVerses] = useState<Array<{
    id: string;
    reference: string;
    text: string;
    // copyright removed as requested
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get all liked verses from localStorage
    const savedVerses = localStorage.getItem('bibletok-verses');
    if (savedVerses) {
      const allVerses = JSON.parse(savedVerses);
      const likedOnes = Object.entries(likes)
        .filter(([id, isLiked]) => isLiked)
        .map(([id]) => allVerses.find((verse: any) => verse.id === id))
        .filter(Boolean);
      
      setLikedVerses(likedOnes);
    }
    setLoading(false);
  }, [likes]);

  const handleBack = () => {
    router.push('/');
  };

  const handleDownload = () => {
    if (likedVerses.length === 0) return;

    const content = likedVerses.map(verse => (
      `${verse.reference}\n${verse.text}\n\n`
    )).join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-liked-verses.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-900 text-white p-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 mb-8 shadow-lg flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center space-x-2 text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-bold flex items-center">
            <Heart className="h-6 w-6 fill-red-500 text-red-500 mr-2" />
            Liked Verses
          </h1>
          
          <button 
            onClick={handleDownload}
            disabled={likedVerses.length === 0}
            className={`flex items-center space-x-1 p-2 rounded-lg ${
              likedVerses.length === 0 
                ? 'text-gray-500 cursor-not-allowed' 
                : 'text-white hover:bg-white/10 transition-colors'
            }`}
          >
            <Download size={20} />
            <span className="text-sm">Save</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : likedVerses.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <p className="text-xl">No liked verses yet</p>
            <p className="text-gray-400 mt-2">Double-tap or press the heart button on verses you like</p>
          </div>
        ) : (
          <div className="space-y-6">
            {likedVerses.map(verse => (
              <div 
                key={verse.id} 
                className="glass-card bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-xl hover:bg-white/20 transition-all"
              >
                <p className="font-medium text-lg mb-3">{verse.text}</p>
                <p className="text-gray-400">{verse.reference}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}