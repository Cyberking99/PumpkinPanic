import React, { useState, useRef, useEffect, useCallback } from "react";
import Pumpkin from "./Pumpkin";
import Scoreboard from "./ScoreBoard";
import GameOverModal from "./GameOverModal";
import PowerUp from "./PowerUp";
import backgroundMusicFile from "../assets/sounds/background.mp3";

type LeaderboardEntry = { name: string; soulSeeds: number; wave: number };
type PumpkinEntity = {
  id: string;
  x: number;
  y: number;
  health: number;
  active: boolean;
};
type PowerUpEntity = {
  id: string;
  x: number;
  y: number;
  active: boolean;
};

const LANTERN_START_HEALTH = 100;
const LANTERN_X = 50;
const LANTERN_Y = 50;
const ATTACK_RANGE = 15;

export default function Game() {
  const [soulSeeds, setSoulSeeds] = useState(0);
  const [wave, setWave] = useState(0);
  const [lanternHealth, setLanternHealth] = useState(LANTERN_START_HEALTH);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [pumpkins, setPumpkins] = useState<PumpkinEntity[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUpEntity[]>([]);
  const [playerDamage, setPlayerDamage] = useState(1);
  const [powerUpActive, setPowerUpActive] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const bgMusic = useRef<HTMLAudioElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const currentSoulSeedsRef = useRef(0);
  const currentWaveRef = useRef(0);
  const waveAdvancingRef = useRef(false);

  useEffect(() => {
    const item = localStorage.getItem("pumpkin-leaderboard");
    const stored = item ? JSON.parse(item) : [];
    setLeaderboard(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("pumpkin-leaderboard", JSON.stringify(leaderboard));
  }, [leaderboard]);

  const startGame = () => {
    setSoulSeeds(0);
    setWave(0);
    currentSoulSeedsRef.current = 0;
    currentWaveRef.current = 0;
    waveAdvancingRef.current = false;
    setLanternHealth(LANTERN_START_HEALTH);
    setIsGameOver(false);
    setIsGameStarted(true);
    setShowLeaderboard(false);
    setPumpkins([]);
    setPowerUps([]);
    setPlayerDamage(1);
    setPowerUpActive(false);

    if (bgMusic.current) {
      bgMusic.current.currentTime = 0;
      bgMusic.current.play();
    }

    startWave(1);
  };

  const goToMainMenu = () => {
    setSoulSeeds(0);
    setWave(0);
    currentSoulSeedsRef.current = 0;
    currentWaveRef.current = 0;
    waveAdvancingRef.current = false;
    setLanternHealth(LANTERN_START_HEALTH);
    setIsGameOver(false);
    setIsGameStarted(false);
    setShowLeaderboard(false);
    setPumpkins([]);
    setPowerUps([]);
    setPlayerDamage(1);
    setPowerUpActive(false);

    if (bgMusic.current) {
      bgMusic.current.pause();
      bgMusic.current.currentTime = 0;
    }
  };

  const startWave = useCallback((waveNumber: number) => {
    setWave(waveNumber);
    currentWaveRef.current = waveNumber;
    waveAdvancingRef.current = false;
    const pumpkinCount = 3 + waveNumber * 2; // More pumpkins each wave
    const newPumpkins: PumpkinEntity[] = [];

    for (let i = 0; i < pumpkinCount; i++) {
      const side = Math.floor(Math.random() * 4);
      let x = 50;
      let y = 50;

      switch (side) {
        case 0: // Top
          x = Math.random() * 100;
          y = -5;
          break;
        case 1: // Right
          x = 105;
          y = Math.random() * 100;
          break;
        case 2: // Bottom
          x = Math.random() * 100;
          y = 105;
          break;
        case 3: // Left
          x = -5;
          y = Math.random() * 100;
          break;
      }

      newPumpkins.push({
        id: `pumpkin-${waveNumber}-${i}-${Date.now()}`,
        x,
        y,
        health: 1 + Math.floor(waveNumber / 3),
        active: true,
      });
    }

    setPumpkins(newPumpkins);
    // setPowerUps([]); // Clear power-ups when starting new wave
  }, []);

  // Spawn power-ups randomly during gameplay
  useEffect(() => {
    if (!isGameStarted || isGameOver || wave === 0) return;

    const spawnPowerUp = () => {
      // 30% chance to spawn a power-up every 5-8 seconds
      if (Math.random() < 0.3 && powerUps.length === 0) {
        const x = 20 + Math.random() * 60; // Spawn away from edges
        const y = 20 + Math.random() * 60;
        
        const newPowerUp: PowerUpEntity = {
          id: `powerup-${Date.now()}-${Math.random()}`,
          x,
          y,
          active: true,
        };
        
        setPowerUps([newPowerUp]);
        
        // Power-up disappears after 7 seconds if not collected
        setTimeout(() => {
          setPowerUps((prev) => prev.filter((p) => p.id !== newPowerUp.id));
        }, 7000);
      }
    };

    const powerUpInterval = setInterval(spawnPowerUp, 5000 + Math.random() * 3000);
    
    return () => clearInterval(powerUpInterval);
  }, [isGameStarted, isGameOver, wave, powerUps.length]);

  const attackPumpkin = useCallback((pumpkinId: string) => {
    setPumpkins((prev) => {
      const updated = prev.map((p) => {
        if (p.id === pumpkinId) {
          const newHealth = p.health - playerDamage;
          if (newHealth <= 0) {
            // Pumpkin defeated - award Soul Seeds
            setSoulSeeds((seeds) => {
              const newSeeds = seeds + 10;
              currentSoulSeedsRef.current = newSeeds;
              return newSeeds;
            });
            return { ...p, active: false };
          }
          return { ...p, health: newHealth };
        }
        return p;
      });

      // Check if all pumpkins are defeated
      const activeCount = updated.filter((p) => p.active).length;
      if (activeCount === 0 && updated.length > 0 && !waveAdvancingRef.current) {
        waveAdvancingRef.current = true; // Prevent double advancement
        // Wave cleared - award bonus Soul Seeds
        setSoulSeeds((seeds) => {
          const newSeeds = seeds + 50;
          currentSoulSeedsRef.current = newSeeds;
          return newSeeds;
        });
        // Use functional update to get current wave
        setWave((currentWave) => {
          const nextWave = currentWave + 1;
          setTimeout(() => {
            if (!waveAdvancingRef.current || currentWaveRef.current === currentWave) {
              startWave(nextWave);
            }
          }, 1000);
          return currentWave; // Keep current wave until next wave starts
        });
      }

      return updated;
    });
  }, [startWave, playerDamage]);

  const collectPowerUp = useCallback((powerUpId: string) => {
    setPowerUps((prev) => prev.filter((p) => p.id !== powerUpId));
    
    // Activate power boost: +2 damage for 10 seconds
    setPlayerDamage(3);
    setPowerUpActive(true);
    
    setTimeout(() => {
      setPlayerDamage(1);
      setPowerUpActive(false);
    }, 10000);
  }, []);

  const handlePumpkinClick = useCallback((pumpkinId: string) => {
    // Direct pumpkin click - always works
    attackPumpkin(pumpkinId);
  }, [attackPumpkin]);

  const handleGameBoardClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isGameStarted || isGameOver) return;
    
    const gameBoard = event.currentTarget;
    const rect = gameBoard.getBoundingClientRect();
    
    // Calculate click position as percentage of game board
    const clickX = ((event.clientX - rect.left) / rect.width) * 100;
    const clickY = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Find the nearest active pumpkin within attack range
    let nearestPumpkinId: string | null = null;
    let nearestDistance = ATTACK_RANGE; // Only attack if within range
    
    pumpkins.forEach((pumpkin) => {
      if (!pumpkin.active) return;
      
      const dx = clickX - pumpkin.x;
      const dy = clickY - pumpkin.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPumpkinId = pumpkin.id;
      }
    });
    
    // Attack the nearest pumpkin if found
    if (nearestPumpkinId) {
      attackPumpkin(nearestPumpkinId);
    }
  }, [isGameStarted, isGameOver, pumpkins, attackPumpkin]);

  const handleGameBoardTouch = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!isGameStarted || isGameOver) return;
    
    const gameBoard = event.currentTarget;
    const rect = gameBoard.getBoundingClientRect();
    const touch = event.touches[0] || event.changedTouches[0];
    
    if (!touch) return;
    
    // Calculate touch position as percentage of game board
    const touchX = ((touch.clientX - rect.left) / rect.width) * 100;
    const touchY = ((touch.clientY - rect.top) / rect.height) * 100;
    
    // Find the nearest active pumpkin within attack range
    let nearestPumpkinId: string | null = null;
    let nearestDistance = ATTACK_RANGE; // Only attack if within range
    
    pumpkins.forEach((pumpkin) => {
      if (!pumpkin.active) return;
      
      const dx = touchX - pumpkin.x;
      const dy = touchY - pumpkin.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPumpkinId = pumpkin.id;
      }
    });
    
    if (nearestPumpkinId) {
      event.preventDefault();
      attackPumpkin(nearestPumpkinId);
    }
  }, [isGameStarted, isGameOver, pumpkins, attackPumpkin]);

  const saveScore = useCallback((soulSeeds: number, wave: number) => {
    const player = prompt("Enter your name:", "Player");
    const updated = [
      ...leaderboard,
      { name: player || "Anonymous", soulSeeds, wave },
    ];
    updated.sort((a, b) => {
      if (b.soulSeeds !== a.soulSeeds) return b.soulSeeds - a.soulSeeds;
      return b.wave - a.wave;
    });
    const top5 = updated.slice(0, 5);
    setLeaderboard(top5);
  }, [leaderboard]);

  // Game loop - move pumpkins toward lantern
  useEffect(() => {
    if (!isGameStarted || isGameOver) return;

    gameLoopRef.current = window.setInterval(() => {
      setPumpkins((prev) => {
        const updated = prev.map((pumpkin) => {
          if (!pumpkin.active) return pumpkin;

          const dx = LANTERN_X - pumpkin.x;
          const dy = LANTERN_Y - pumpkin.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const speed = 0.1 + wave * 0.02; // Faster in later waves

          if (distance < 2) {
            // Pumpkin reached lantern - damage it
            setLanternHealth((health) => {
              const newHealth = health - 5;
              if (newHealth <= 0) {
                setIsGameOver(true);
                if (bgMusic.current) bgMusic.current.pause();
                
                saveScore(currentSoulSeedsRef.current, currentWaveRef.current);
                return 0;
              }
              return newHealth;
            });
            // Remove pumpkin after hitting lantern
            return { ...pumpkin, active: false };
          }

          // Move toward lantern
          const moveX = (dx / distance) * speed;
          const moveY = (dy / distance) * speed;

          return {
            ...pumpkin,
            x: pumpkin.x + moveX,
            y: pumpkin.y + moveY,
          };
        });

        // Check if all pumpkins are inactive (defeated or reached lantern)
        const activeCount = updated.filter((p) => p.active).length;
        if (activeCount === 0 && updated.length > 0 && !waveAdvancingRef.current) {
          waveAdvancingRef.current = true;

          // Wave cleared - award bonus Soul Seeds and advance to next wave
          setSoulSeeds((seeds) => {
            const newSeeds = seeds + 50;
            currentSoulSeedsRef.current = newSeeds;
            return newSeeds;
          });
          
          // Use functional update to get current wave
          setWave((currentWave) => {
            const nextWave = currentWave + 1;
            setTimeout(() => {
              if (!waveAdvancingRef.current || currentWaveRef.current === currentWave) {
                startWave(nextWave);
              }
            }, 1000);
            return currentWave;
          });
        }

        return updated;
      });
    }, 16); // ~60 FPS

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isGameStarted, isGameOver, wave, startWave, saveScore]);

  return (
    <div className="relative w-full max-w-6xl mx-auto p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 min-h-0 overflow-x-hidden">
      <audio ref={bgMusic} src={backgroundMusicFile} loop preload="auto" />
      <h1 className="text-lg sm:text-3xl md:text-5xl font-bold text-center text-orange-400 mb-1 sm:mb-2 drop-shadow-lg px-1 break-words">
        🎃 Pumpkin Panic
      </h1>
      <Scoreboard soulSeeds={soulSeeds} wave={wave} lanternHealth={lanternHealth} playerDamage={playerDamage} />
      {!isGameStarted ? (
        <div className="text-center mt-4 sm:mt-10 bg-gray-900 p-3 sm:p-6 rounded-xl shadow-xl mx-1 sm:mx-0 max-w-full overflow-hidden">
          <h2 className="text-lg sm:text-2xl md:text-4xl text-orange-400 font-bold mb-3 sm:mb-4 break-words px-1">
            Welcome to Gloomvale
          </h2>
          <p className="mb-4 text-xs sm:text-base md:text-lg text-gray-300 px-2 break-words">
            Defend the lantern from the ghostly pumpkins!<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Click or tap on pumpkins to attack them before they reach the lantern.
          </p>
          <button
            onClick={startGame}
            className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold py-3 sm:py-3 px-6 sm:px-8 rounded-lg text-sm sm:text-lg min-h-[44px] touch-manipulation transition-colors w-full sm:w-auto"
          >
            Start Game
          </button>
        </div>
      ) : !isGameOver ? (
        <div 
          className="relative w-full max-w-[95vw] sm:max-w-3xl md:max-w-4xl mx-auto bg-gradient-to-b from-purple-950 to-black rounded-xl border-2 border-orange-900 overflow-hidden cursor-crosshair"
          style={{
            aspectRatio: "1 / 1",
            maxHeight: "calc(100vh - 200px)",
            maxWidth: "min(95vw, 100%)",
          }}
          onClick={handleGameBoardClick}
          onTouchEnd={handleGameBoardTouch}
        >
          {/* Lantern in center */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-4xl sm:text-6xl md:text-8xl"
            style={{ left: `${LANTERN_X}%`, top: `${LANTERN_Y}%` }}
          >
            🕯️
          </div>
          {/* Pumpkins */}
          {pumpkins.map((pumpkin) => (
            pumpkin.active && (
              <Pumpkin
                key={pumpkin.id}
                id={pumpkin.id}
                x={pumpkin.x}
                y={pumpkin.y}
                health={pumpkin.health}
                onClick={() => handlePumpkinClick(pumpkin.id)}
              />
            )
          ))}
          {/* Power-ups */}
          {powerUps.map((powerUp) => (
            powerUp.active && (
              <PowerUp
                key={powerUp.id}
                id={powerUp.id}
                x={powerUp.x}
                y={powerUp.y}
                onClick={() => collectPowerUp(powerUp.id)}
              />
            )
          ))}
          {/* Power-up active indicator */}
          {powerUpActive && (
            <div className="absolute top-2 left-2 bg-yellow-500 bg-opacity-80 text-black font-bold px-3 py-1 rounded-lg text-xs sm:text-sm z-30 animate-pulse">
              ⚡ POWER BOOST ACTIVE!
            </div>
          )}
        </div>
      ) : (
        <GameOverModal
          soulSeeds={soulSeeds}
          wave={wave}
          onRestart={startGame}
          onMainMenu={goToMainMenu}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
      )}
      {showLeaderboard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="bg-gray-900 p-4 sm:p-6 rounded-xl w-full max-w-sm">
            <h2 className="text-lg sm:text-xl mb-3 text-orange-400 font-bold text-center">
              🏆 Leaderboard
            </h2>
            <ul className="text-xs sm:text-sm space-y-1 max-h-[60vh] overflow-y-auto">
              {leaderboard.length === 0 ? (
                <li className="text-gray-400 text-center py-4">No scores yet</li>
              ) : (
                leaderboard.map((entry, i) => (
                  <li key={i} className="flex justify-between items-center py-1">
                    <span className="truncate mr-2">
                      {i + 1}. {entry.name}
                    </span>
                    <span className="text-orange-300 text-right whitespace-nowrap flex-shrink-0">
                      {entry.soulSeeds} seeds<br className="sm:hidden" />
                      <span className="sm:inline"> (Wave {entry.wave})</span>
                    </span>
                  </li>
                ))
              )}
            </ul>
            <button
              onClick={() => setShowLeaderboard(false)}
              className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white py-2 sm:py-2 px-4 rounded-lg mt-4 w-full min-h-[44px] touch-manipulation transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
