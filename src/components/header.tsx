"use client";

import { useState } from "react";
import { useApiKey } from "@/context/api-key-context";
import { KeyRound, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
    const { apiKey, setApiKey } = useApiKey();
    const [isOpen, setIsOpen] = useState(false);
    const [tempKey, setTempKey] = useState("");

    const handleSave = () => {
        setApiKey(tempKey);
        setIsOpen(false);
    };

    return (
        <header className="w-full h-16 border-b border-border/50 glass-panel flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-600 flex items-center justify-center shadow-inner border border-white/10">
                    <span className="font-bold text-white text-sm">8</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white/90">Magic Consensus</h1>
            </div>

            <button
                onClick={() => {
                    setTempKey(apiKey);
                    setIsOpen(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${apiKey
                        ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                        : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
                    }`}
            >
                {apiKey ? <ShieldCheck size={16} /> : <KeyRound size={16} />}
                {apiKey ? "API Key Set" : "Set API Key"}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
                                <h2 className="text-lg font-semibold text-white">Dispersal API Key</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-5 space-y-4">
                                <p className="text-sm text-zinc-400">
                                    Enter your Dispersal API key to enable agentic consensus. Your key is stored locally in your browser.
                                </p>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                        API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={tempKey}
                                        onChange={(e) => setTempKey(e.target.value)}
                                        placeholder="sk-..."
                                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                            <div className="p-5 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                >
                                    Save Key
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </header>
    );
}
