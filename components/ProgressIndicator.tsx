'use client';

interface ProgressIndicatorProps {
  currentIndex: number;
  totalItems: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentIndex,
  totalItems,
}) => {
  const progress = ((totalItems - currentIndex) / totalItems) * 100;

  return (
    <div className="absolute top-0 right-0 bottom-0 w-1 z-10">
      <div
        className="bg-white/60 rounded-b-full"
        style={{ height: `${progress}%`, transition: "height 0.3s ease" }}
      ></div>
    </div>
  );
};