import React from 'react';
import { VersionSelector } from './VersionSelector';

export const Header: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-white">BibleTok</div>
      <VersionSelector />
    </div>
  );
};