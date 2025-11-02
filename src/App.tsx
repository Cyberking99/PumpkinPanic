import React from "react";
import Game from "./components/Game";
import AnimatedBackground from "./components/AnimatedBackground";

export default function App() {
  return (
    <div className="relative min-h-screen sm:min-h-screen bg-gradient-to-b from-orange-950 to-black flex items-center justify-center text-white font-mono overflow-x-hidden overflow-y-hidden sm:overflow-y-auto py-2 sm:py-4 w-full">
      <AnimatedBackground />
      <div className="w-full max-w-full">
        <Game />
      </div>
    </div>
  );
}