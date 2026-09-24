"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  isApiKeyDialogOpen: boolean;
  openApiKeyDialog: () => void;
  closeApiKeyDialog: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const OPENROUTER_KEY = "openrouter_api_key";
const LEGACY_DISPERSL_KEY = "dispersl_api_key";

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState("");
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(OPENROUTER_KEY);
    if (storedKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setApiKeyState(storedKey);
      return;
    }

    const legacy = localStorage.getItem(LEGACY_DISPERSL_KEY);
    if (legacy?.startsWith("sk-or-")) {
      localStorage.setItem(OPENROUTER_KEY, legacy);
      localStorage.removeItem(LEGACY_DISPERSL_KEY);
      setApiKeyState(legacy);
    } else if (legacy) {
      localStorage.removeItem(LEGACY_DISPERSL_KEY);
    }
  }, []);

  const setApiKey = (key: string) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    if (trimmed) {
      localStorage.setItem(OPENROUTER_KEY, trimmed);
    } else {
      localStorage.removeItem(OPENROUTER_KEY);
    }
  };

  const openApiKeyDialog = () => setIsApiKeyDialogOpen(true);
  const closeApiKeyDialog = () => setIsApiKeyDialogOpen(false);

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        setApiKey,
        isApiKeyDialogOpen,
        openApiKeyDialog,
        closeApiKeyDialog,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }
  return context;
}
