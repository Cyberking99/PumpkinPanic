import React from "react";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-200 rounded-full opacity-80 shadow-lg shadow-yellow-400" />
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-[url('/fog1.png')] bg-cover opacity-30"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      />
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-[url('/fog2.png')] bg-cover opacity-20"
        animate={{ x: ["100%", "0%"] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      />
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ top: `${20 + i * 20}%`, left: "-10%" }}
          animate={{ left: "110%" }}
          transition={{ duration: 10 + i * 5, repeat: Infinity, delay: i * 3, ease: "linear" }}
        >
          🦇
        </motion.div>
      ))}
    </div>
  );
}