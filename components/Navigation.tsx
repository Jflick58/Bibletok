'use client';

interface NavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoUp: boolean;
  canGoDown: boolean;
  position?: 'left' | 'right';
}

export const Navigation: React.FC<NavigationProps> = ({
  onPrevious,
  onNext,
  canGoUp,
  canGoDown,
  position = 'right'
}) => {
  return (
    <div className={`absolute bottom-16 ${position === 'left' ? 'left-5' : 'right-5'} z-10 flex flex-col space-y-2`}>
      <button
        onClick={onPrevious}
        disabled={!canGoUp}
        className={`${
          canGoUp ? "bg-white text-black" : "bg-gray-600 text-gray-400"
        } h-12 w-12 rounded-full flex items-center justify-center shadow-lg`}
        aria-label="Previous verse"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
      <button
        onClick={onNext}
        disabled={!canGoDown}
        className={`${
          canGoDown ? "bg-white text-black" : "bg-gray-600 text-gray-400"
        } h-12 w-12 rounded-full flex items-center justify-center shadow-lg`}
        aria-label="Next verse"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
};