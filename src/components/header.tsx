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
    <header className="z-50 flex h-11 w-full shrink-0 items-center justify-between gap-2 border-b border-border/50 px-3 glass-panel">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-tr from-zinc-800 to-zinc-600">
          <span className="text-[10px] font-bold text-white">8</span>
        </div>
        <h1 className="truncate text-sm font-semibold tracking-tight text-white/90">
          Jev 8 Ball
        </h1>
      </div>

      <button
        type="button"
        onClick={() => {
          setTempKey(apiKey);
          setIsOpen(true);
        }}
        className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
          apiKey
            ? "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
            : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
        }`}
        title={apiKey ? "OpenRouter API Key Set" : "Set OpenRouter Key"}
      >
        {apiKey ? <ShieldCheck size={12} /> : <KeyRound size={12} />}
        <span className="hidden sm:inline">
          {apiKey ? "API Key Set" : "Set OpenRouter Key"}
        </span>
        <span className="sm:hidden">Key</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-4">
                <h2 className="text-base font-semibold text-white">
                  OpenRouter API Key
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3 p-4">
                <p className="text-sm text-zinc-400">
                  Enter your OpenRouter API key to ask Jev. Your key is stored
                  only in this browser and is billed to your OpenRouter account.{" "}
                  <a
                    href="https://openrouter.ai/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
                  >
                    Get a key
                  </a>
                </p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="sk-or-..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white transition-all focus:border-transparent focus:ring-2 focus:ring-zinc-700 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-white/5 bg-white/[0.02] p-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApiKey("");
                    setTempKey("");
                    setIsOpen(false);
                  }}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
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
