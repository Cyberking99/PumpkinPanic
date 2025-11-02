import React from "react";

type ScoreboardProps = {
  soulSeeds: number;
  wave: number;
  lanternHealth: number;
  playerDamage: number;
};

export default function Scoreboard({ soulSeeds, wave, lanternHealth, playerDamage }: ScoreboardProps) {
  return (
    <div className="flex flex-wrap justify-between gap-1 sm:gap-3 bg-gray-800 rounded-lg p-2 sm:p-3 text-xs sm:text-sm md:text-lg shadow-lg overflow-hidden">
      <p className="whitespace-nowrap">
        🌱 <span className="hidden sm:inline">Soul Seeds: </span><span className="sm:hidden">Seeds: </span><span className="text-orange-400 font-bold">{soulSeeds}</span>
      </p>
      <p className="whitespace-nowrap">
        🌊 Wave: <span className="text-orange-400 font-bold">{wave}</span>
      </p>
      <p className="whitespace-nowrap">
        🕯️ <span className="hidden sm:inline">Lantern: </span><span className="text-orange-400 font-bold">{lanternHealth}</span>
      </p>
      {playerDamage > 1 && (
        <p className="whitespace-nowrap text-yellow-400 font-bold">
          ⚡ x{playerDamage}
        </p>
      )}
    </div>
  );
}
