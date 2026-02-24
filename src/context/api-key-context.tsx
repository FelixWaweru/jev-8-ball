"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ApiKeyContextType {
    apiKey: string;
    setApiKey: (key: string) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
    const [apiKey, setApiKeyState] = useState("");

    useEffect(() => {
        const storedKey = localStorage.getItem("dispersl_api_key");
        if (storedKey) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setApiKeyState(storedKey);
        }
    }, []);

    const setApiKey = (key: string) => {
        setApiKeyState(key);
        localStorage.setItem("dispersl_api_key", key);
    };

    return (
        <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
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
