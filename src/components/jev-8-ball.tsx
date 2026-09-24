"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Jev8BallProps {
  text: string;
  isThinking: boolean;
  confidence?: number | null;
}

export function Jev8Ball({ text, isThinking, confidence }: Jev8BallProps) {
  const [bubbles, setBubbles] = useState<
    Array<{
      id: number;
      size: number;
      left: number;
      delay: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    if (isThinking) {
      const newBubbles = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        size: Math.random() * 20 + 5,
        left: Math.random() * 80 + 10,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
      }));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBubbles(newBubbles);
    } else {
      setBubbles([]);
    }
  }, [isThinking]);

  const displayText = text || "AWAITING INQUIRY";
  const subText =
    !isThinking &&
    confidence !== undefined &&
    confidence !== null &&
    Number.isFinite(confidence)
      ? `${(confidence * 100).toFixed(0)}% confidence`
      : "";

  return (
    <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]">
      <motion.div
        animate={
          isThinking
            ? {
                x: [0, -4, 4, -4, 4, 0],
                y: [0, 2, -2, 2, -2, 0],
                rotate: [0, -1, 1, -1, 1, 0],
              }
            : {}
        }
        transition={{
          duration: 0.5,
          repeat: isThinking ? Infinity : 0,
          repeatType: "mirror",
        }}
        className="w-full h-full rounded-full bg-gradient-to-tr from-black via-zinc-900 to-zinc-700 shadow-[inset_-20px_-20px_60px_rgba(0,0,0,0.9),0_20px_40px_rgba(0,0,0,0.8)] border border-zinc-800 relative overflow-hidden"
      >
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[30%] bg-gradient-to-b from-white/20 to-transparent rounded-full blur-md transform -rotate-45" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[55%] h-[55%] rounded-full bg-zinc-950 shadow-[inset_0_0_30px_rgba(0,0,0,1)] border-4 border-zinc-800/80 relative overflow-hidden">
            <motion.div
              animate={{
                y: isThinking ? ["0%", "5%", "-5%", "0%"] : "0%",
                rotate: isThinking ? [0, 2, -2, 0] : 0,
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-[-20%] bg-gradient-to-b from-blue-900/40 to-black rounded-[40%] blur-sm opacity-60 mix-blend-screen"
            />

            {isThinking && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {bubbles.map((bubble) => (
                  <motion.div
                    key={bubble.id}
                    initial={{ y: "120%", x: "-50%", opacity: 0 }}
                    animate={{ y: "-20%", opacity: [0, 0.8, 0] }}
                    transition={{
                      duration: bubble.duration,
                      repeat: Infinity,
                      delay: bubble.delay,
                      ease: "linear",
                    }}
                    className="absolute bg-blue-400/30 rounded-full blur-[1px]"
                    style={{
                      width: bubble.size,
                      height: bubble.size,
                      left: `${bubble.left}%`,
                    }}
                  />
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 30, scale: 0.8, rotateX: 60 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                exit={{
                  opacity: 0,
                  y: -20,
                  scale: 0.9,
                  filter: "blur(4px)",
                }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                {/* Upside-down triangle: wide top, tip bottom */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-60 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <polygon
                    points="10,20 90,20 50,85"
                    fill="#1e3a8a"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Text clipped to triangle interior */}
                <div className="relative z-20 flex flex-col items-center justify-start pt-[18%] w-[58%] max-h-[48%] overflow-hidden text-center px-0.5">
                  <h4 className="text-blue-100 font-bold text-[9px] sm:text-[10px] md:text-xs tracking-wide leading-tight drop-shadow-md mix-blend-plus-lighter uppercase break-words line-clamp-3 w-full">
                    {displayText}
                  </h4>
                  {subText && (
                    <p className="text-[8px] sm:text-[9px] text-blue-300/80 mt-0.5 uppercase tracking-wider leading-tight line-clamp-1 w-full">
                      {subText}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 rounded-full shadow-[inset_0_20px_20px_rgba(255,255,255,0.05)] pointer-events-none" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
