import React from "react";

type GameOverModalProps = {
  soulSeeds: number;
  wave: number;
  onRestart: () => void;
  onMainMenu: () => void;
  onShowLeaderboard: () => void;
};

export default function GameOverModal({ 
  soulSeeds, 
  wave, 
  onRestart,
  onMainMenu,
  onShowLeaderboard 
}: GameOverModalProps) {
  return (
    <div className="text-center mt-4 sm:mt-10 bg-gray-900 p-3 sm:p-6 rounded-xl shadow-xl mx-1 sm:mx-0 max-w-full overflow-hidden">
      <h2 className="text-lg sm:text-2xl md:text-4xl text-orange-400 font-bold mb-2 break-words px-1">Game Over!</h2>
      <p className="mb-2 text-xs sm:text-base md:text-xl break-words px-2">
        The lantern was destroyed! Gloomvale falls into darkness... 🌑
      </p>
      <div className="mb-4 space-y-2">
        <p className="text-sm sm:text-lg break-words px-2">
          You survived <span className="font-bold text-orange-300">Wave {wave}</span>
        </p>
        <p className="text-sm sm:text-lg break-words px-2">
          You collected <span className="font-bold text-orange-300">{soulSeeds} Soul Seeds</span> 🌱
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={onRestart}
          className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold py-3 px-6 rounded-lg min-h-[44px] touch-manipulation transition-colors text-base sm:text-lg"
        >
          Try Again
        </button>
        <button
          onClick={onMainMenu}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg min-h-[44px] touch-manipulation transition-colors text-base sm:text-lg"
        >
          Main Menu
        </button>
        <button
          onClick={onShowLeaderboard}
          className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg min-h-[44px] touch-manipulation transition-colors text-base sm:text-lg"
        >
          View Leaderboard
        </button>
      </div>
    </div>
  );
}
