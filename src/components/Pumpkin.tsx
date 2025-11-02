import React, { useState, useEffect } from "react";
import clickSoundFile from "../assets/sounds/click.wav";

type PumpkinProps = {
  id: string;
  x: number;
  y: number;
  health: number;
  onClick: () => void;
};

export default function Pumpkin({ id, x, y, health, onClick }: PumpkinProps) {
  const clickSound = React.useRef<HTMLAudioElement>(null);
  const [scale, setScale] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isTapping, setIsTapping] = useState(false);

  useEffect(() => {
    // Animate scale on mount
    setScale(1);
  }, []);

  const handleClick = () => {
    if (clickSound.current) {
      clickSound.current.currentTime = 0;
      clickSound.current.play().catch(() => {
        // Ignore audio play errors
      });
    }
    onClick();
  };

  const currentScale = isTapping ? 0.9 : isHovering ? 1.2 : scale;

  return (
    <>
      <audio ref={clickSound} src={clickSoundFile} preload="auto" />
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={() => setIsTapping(true)}
        onTouchEnd={() => setIsTapping(false)}
        className="absolute cursor-pointer select-none z-10 touch-manipulation"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          willChange: "transform",
          transform: `translate(-50%, -50%) scale(${currentScale})`,
          transition: isHovering || isTapping ? "transform 0.1s ease" : "none",
          minWidth: "44px",
          minHeight: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="text-3xl sm:text-4xl md:text-6xl filter drop-shadow-lg pointer-events-none">
          🎃
        </div>
        {health > 1 && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none">
            {health}
          </div>
        )}
      </div>
    </>
  );
}
