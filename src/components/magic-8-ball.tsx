"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { AgentResponse } from "@/lib/dispersl/consensus";

interface Magic8BallProps {
    text: string;
    isThinking: boolean;
    responses?: AgentResponse[];
}

export function Magic8Ball({ text, isThinking, responses }: Magic8BallProps) {
    const [bubbles, setBubbles] = useState<Array<{ id: number; size: number; left: number; delay: number; duration: number }>>([]);
    const [displayIndex, setDisplayIndex] = useState(0);

    useEffect(() => {
        if (isThinking) {
            // Generate random bubbles when thinking
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

    useEffect(() => {
        if (!isThinking && responses && responses.length > 0) {
            const interval = setInterval(() => {
                setDisplayIndex((prev) => (prev + 1) % responses.length);
            }, 6000); // cycle every 6 seconds
            return () => clearInterval(interval);
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDisplayIndex(0);
        }
    }, [isThinking, responses]);

    let displayText = text || "AWAITING INQUIRY";
    let subText = "";
    if (!isThinking && responses && responses.length > 0) {
        const item = responses[displayIndex];
        displayText = item.vote || text;
        subText = item.agent.name;
    }

    return (
        <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto flex items-center justify-center filter drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            {/* Outer Ball Shape */}
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
                {/* Reflection Highlight */}
                <div className="absolute top-[10%] left-[20%] w-[40%] h-[30%] bg-gradient-to-b from-white/20 to-transparent rounded-full blur-md transform -rotate-45" />

                {/* Inner Window Component */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-zinc-950 shadow-[inset_0_0_30px_rgba(0,0,0,1)] border-4 border-zinc-800/80 relative overflow-hidden">

                        {/* Liquid Background */}
                        <motion.div
                            animate={{
                                y: isThinking ? ["0%", "5%", "-5%", "0%"] : "0%",
                                rotate: isThinking ? [0, 2, -2, 0] : 0,
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-[-20%] bg-gradient-to-b from-blue-900/40 to-black rounded-[40%] blur-sm opacity-60 mix-blend-screen"
                        />

                        {/* Bubbles Animation */}
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

                        {/* Glowing Text Triangle / Float Area */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={text}
                                initial={{ opacity: 0, y: 30, scale: 0.8, rotateX: 60 }}
                                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                                exit={{ opacity: 0, y: -20, scale: 0.9, filter: "blur(4px)" }}
                                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                                className="absolute inset-0 flex items-center justify-center p-6 text-center z-10"
                            >
                                {/* Blue Triangle Behind Text (Classic 8-ball look) */}
                                <svg className="absolute inset-0 w-full h-full opacity-60 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" viewBox="0 0 100 100">
                                    <polygon points="50,15 90,80 10,80" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" strokeLinejoin="round" />
                                </svg>

                                <div className="flex flex-col items-center justify-center z-20 max-w-[80%]">
                                    <h4 className="text-blue-100 font-bold text-sm md:text-base tracking-widest leading-snug drop-shadow-md mix-blend-plus-lighter text-center uppercase">
                                        {displayText}
                                    </h4>
                                    {subText && (
                                        <p className="text-[10px] text-blue-300/80 mt-1 uppercase tracking-wider backdrop-blur-sm">
                                            - {subText}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Inner Glass Overlay */}
                        <div className="absolute inset-0 rounded-full shadow-[inset_0_20px_20px_rgba(255,255,255,0.05)] pointer-events-none" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
