'use client';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-white text-lg">Loading Bible verses...</p>
      </div>
    </div>
  );
};