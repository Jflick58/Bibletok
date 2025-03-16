import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
      <p className="text-white">Loading verses...</p>
    </div>
  );
};