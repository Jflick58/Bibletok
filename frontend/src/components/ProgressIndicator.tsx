import React from 'react';

interface ProgressIndicatorProps {
  currentIndex: number;
  totalItems: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentIndex, 
  totalItems 
}) => {
  const percentage = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0;
  
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
      <div 
        className="h-full bg-white"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};