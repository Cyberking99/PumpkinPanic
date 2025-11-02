import React, { useState, useEffect } from "react";

type PowerUpProps = {
  id: string;
  x: number;
  y: number;
  onClick: () => void;
};

export default function PowerUp({ id, x, y, onClick }: PowerUpProps) {
  const [scale, setScale] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Animate scale on mount
    setScale(1);
  }, []);

  const handleClick = () => {
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="absolute cursor-pointer select-none z-20 touch-manipulation"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        willChange: "transform",
        transform: `translate(-50%, -50%) scale(${isHovering ? 1.2 : scale})`,
        transition: isHovering ? "transform 0.1s ease" : "none",
        minWidth: "44px",
        minHeight: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      <div className="text-2xl sm:text-3xl md:text-4xl pointer-events-none">
        ⚡
      </div>
    </div>
  );
}

