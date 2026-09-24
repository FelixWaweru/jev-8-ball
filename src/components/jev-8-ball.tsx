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
      const newBubbles = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        size: Math.random() * 14 + 4,
        left: Math.random() * 70 + 15,
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
      ? `${(confidence * 100).toFixed(0)}% conf.`
      : "";

  return (
    <div className="relative h-full w-full">
      <motion.div
        animate={
          isThinking
            ? {
                x: [0, -3, 3, -3, 3, 0],
                y: [0, 2, -2, 2, -2, 0],
              }
            : {}
        }
        transition={{
          duration: 0.5,
          repeat: isThinking ? Infinity : 0,
          repeatType: "mirror",
        }}
        className="absolute inset-0 overflow-hidden rounded-full border border-zinc-800 bg-gradient-to-tr from-black via-zinc-900 to-zinc-700 shadow-[inset_-16px_-16px_48px_rgba(0,0,0,0.9)]"
      >
        <div className="pointer-events-none absolute top-[10%] left-[18%] h-[28%] w-[38%] -rotate-45 rounded-full bg-gradient-to-b from-white/20 to-transparent blur-md" />

        {/* Inner window — size container so type scales with the ball, not the viewport */}
        <div
          className="@container/window absolute inset-[18%] overflow-hidden rounded-full border-[3px] border-zinc-800/80 bg-zinc-950 shadow-[inset_0_0_24px_rgba(0,0,0,1)]"
          style={{ clipPath: "circle(50% at 50% 50%)" }}
        >
          <motion.div
            animate={{
              y: isThinking ? ["0%", "5%", "-5%", "0%"] : "0%",
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-20%] rounded-[40%] bg-gradient-to-b from-blue-900/40 to-black opacity-60 blur-sm mix-blend-screen"
          />

          {isThinking && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
                  className="absolute rounded-full bg-blue-400/30 blur-[1px]"
                  style={{
                    width: bubble.size,
                    height: bubble.size,
                    left: `${bubble.left}%`,
                  }}
                />
              ))}
            </div>
          )}

          {/*
            Triangle + copy are one layer. The window clips to a circle so
            the die can float in from below / out the top without leaking.
          */}
          <AnimatePresence mode="wait">
            <motion.div
              key={text}
              initial={{ opacity: 0, y: "52%" }}
              animate={{ opacity: 1, y: "0%" }}
              exit={{
                opacity: 0,
                y: "-52%",
                transition: {
                  duration: 0.4,
                  ease: [0.4, 0, 0.8, 1],
                  opacity: { duration: 0.28, ease: "easeIn" },
                },
              }}
              transition={{
                duration: 0.48,
                ease: [0.22, 1, 0.36, 1],
                opacity: { duration: 0.36, ease: "easeOut" },
              }}
              className="absolute inset-0"
            >
              <svg
                className="absolute inset-0 h-full w-full drop-shadow-[0_0_12px_rgba(59,130,246,0.45)]"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden
              >
                <polygon
                  points="16,20 84,20 50,84"
                  fill="#1e3a8a"
                  fillOpacity="0.85"
                  stroke="#3b82f6"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              <div
                className="absolute z-10 flex flex-col items-center justify-center overflow-hidden text-center"
                style={{
                  // Rectangle inscribed in inverted triangle (base y=20, tip y=84).
                  // At y≈48 the triangle is ~40 wide → keep the box at 40% centered.
                  left: "30%",
                  width: "40%",
                  top: "24%",
                  height: "30%",
                }}
              >
                <p className="w-full break-words text-[length:clamp(7px,7.2cqi,13px)] leading-[1.15] font-bold tracking-normal text-blue-100 uppercase">
                  {displayText}
                </p>
                {subText ? (
                  <p className="mt-[2px] w-full truncate text-[length:clamp(6px,4.6cqi,9px)] leading-none tracking-normal text-blue-300/80 uppercase">
                    {subText}
                  </p>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_16px_16px_rgba(255,255,255,0.05)]" />
        </div>
      </motion.div>
    </div>
  );
}
