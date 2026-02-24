"use client";

import { useState, useRef } from "react";
import { Send, Link as LinkIcon, Image as ImageIcon, MessageSquare, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Agent } from "@/lib/dispersl/global.types";
import { AI_MODELS, mapModelToAgent } from "@/lib/models";

export type InputMode = "question" | "link" | "image";

interface RightPanelProps {
  selectedAgents: Agent[];
  onAgentToggle: (agent: Agent) => void;
  onSubmit: (prompt: string, mode: InputMode, extraData?: string) => void;
  isProcessing: boolean;
}

export function RightPanel({
  selectedAgents,
  onAgentToggle,
  onSubmit,
  isProcessing,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<InputMode>("question");
  const [text, setText] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const [showAgentSelection, setShowAgentSelection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!text.trim() && activeTab !== "image") return;
    if (activeTab === "link" && !linkInput.trim()) return;
    if (activeTab === "image" && !imageBase64) return;
    if (selectedAgents.length === 0) return; // Must select at least one agent

    let extraData = "";
    if (activeTab === "link") extraData = linkInput;
    if (activeTab === "image") extraData = imageBase64 || "";

    onSubmit(text, activeTab, extraData);
  };

  return (
    <div className="w-full h-full glass-panel rounded-2xl flex flex-col overflow-hidden relative border border-white/5 shadow-2xl">
      {/* Tabs Header */}
      <div className="flex items-center p-2 gap-2 border-b border-white/5 bg-zinc-900/50">
        {[
          { id: "question", icon: MessageSquare, label: "Question" },
          { id: "link", icon: LinkIcon, label: "News Link" },
          { id: "image", icon: ImageIcon, label: "Image" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as InputMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative overflow-hidden ${activeTab === tab.id
              ? "text-white bg-white/10"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <tab.icon size={16} className="relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Conditional Top Input based on Tab */}
        <AnimatePresence mode="popLayout">
          {activeTab === "link" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-2"
            >
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest pl-1">
                Target URL
              </label>
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </motion.div>
          )}

          {activeTab === "image" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-2 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-8 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              {imageBase64 ? (
                <div className="relative w-full max-w-sm rounded-lg overflow-hidden border border-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageBase64} alt="Upload preview" className="w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium">Click to replace</p>
                  </div>
                </div>
              ) : (
                <>
                  <ImageIcon size={32} className="text-zinc-600 mb-2" />
                  <p className="text-sm font-medium text-zinc-400">Click to upload image</p>
                  <p className="text-xs text-zinc-600">JPG, PNG, WEBP up to 5MB</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* Unified Message Box */}
        <div className="mt-auto bg-zinc-900 border border-white/10 rounded-2xl flex flex-col shadow-inner overflow-hidden focus-within:ring-1 focus-within:ring-white/20 transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isProcessing}
            placeholder={
              activeTab === "question"
                ? "Ask the magic agents..."
                : activeTab === "link"
                  ? "What should the agents analyze in this link?"
                  : "Describe what the agents should look for in the image..."
            }
            className="w-full bg-transparent p-4 min-h-[120px] resize-none text-white focus:outline-none placeholder-zinc-600"
          />

          {/* Bottom Row of Message Box */}
          <div className="flex items-center justify-between p-3 border-t border-white/5 bg-zinc-950/50 relative">
            <div className="relative">
              <button
                onClick={() => setShowAgentSelection(!showAgentSelection)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 border border-white/10 transition-colors"
                title="Select Models"
              >
                <Plus size={14} />
                <span>{selectedAgents.length} Models</span>
              </button>

              {/* Agent Selection Popover */}
              <AnimatePresence>
                {showAgentSelection && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-3 w-64 md:w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] max-h-80 flex flex-col"
                  >
                    <div className="p-3 border-b border-white/5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Select Models for Consensus
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                      {AI_MODELS.map((modelConfig) => {
                        const agent = mapModelToAgent(modelConfig);
                        const isSelected = selectedAgents.some((a) => a.id === agent.id);
                        return (
                          <div
                            key={agent.id}
                            onClick={() => onAgentToggle(agent)}
                            className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-white/10" : "hover:bg-white/5"
                              }`}
                          >
                            <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-zinc-600 text-transparent"
                              }`}>
                              <Check size={12} strokeWidth={3} />
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              <div
                                className="w-6 h-6 text-zinc-400 opacity-80"
                                dangerouslySetInnerHTML={{ __html: modelConfig.iconSvg }}
                              />
                              <div>
                                <p className="text-sm font-medium text-white">{modelConfig.name}</p>
                                <p className="text-xs text-zinc-500">{modelConfig.provider}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleSubmit}
              disabled={
                isProcessing ||
                selectedAgents.length === 0 ||
                (!text.trim() && activeTab === "question" ||
                  (activeTab === "link" && !linkInput.trim()) ||
                  (activeTab === "image" && !imageBase64))
              }
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all ${isProcessing
                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                : selectedAgents.length === 0
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                }`}
            >
              {isProcessing ? "Consulting..." : "Ask Agents"}
              {!isProcessing && <Send size={16} />}
            </button>
          </div>
        </div>
      </div>

      {showAgentSelection && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAgentSelection(false)}
        />
      )}
    </div>
  );
}
