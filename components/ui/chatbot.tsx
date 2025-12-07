"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "./button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  fieldContext?: {
    fieldName: string;
    fieldLabel: string;
    currentValue: string;
    fieldType?: "textarea" | "input" | "select";
  };
  onSuggestion?: (suggestion: string) => void;
  onQuestion?: (question: string) => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  fieldContext,
  onSuggestion,
  onQuestion,
}) => {
  // Chatbot jest zawsze otwarty, jeśli jest fieldContext
  const [isOpen, setIsOpen] = useState(!!fieldContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const previousFieldNameRef = useRef<string | undefined>(undefined);

  // Gdy jest fieldContext, chatbot jest zawsze otwarty
  const alwaysOpen = !!fieldContext;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Automatycznie otwieraj chatbota i czyść wiadomości przy zmianie pola
  useEffect(() => {
    const currentFieldName = fieldContext?.fieldName;
    const previousFieldName = previousFieldNameRef.current;

    // Jeśli jest fieldContext, upewnij się, że chatbot jest otwarty
    if (fieldContext) {
      // Zawsze otwieraj chatbota, gdy jest fieldContext
      setIsOpen(true);
      
      // Jeśli zmieniło się pole (nie jest to pierwsze renderowanie)
      if (currentFieldName && currentFieldName !== previousFieldName && previousFieldName !== undefined) {
        // Wyczyść poprzednie wiadomości, aby uniknąć zamieszania
        setMessages([]);
      }
    }

    // Zaktualizuj referencję
    previousFieldNameRef.current = currentFieldName;
  }, [fieldContext?.fieldName, fieldContext]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content.trim(),
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          fieldContext: fieldContext
            ? {
                fieldName: fieldContext.fieldName,
                fieldLabel: fieldContext.fieldLabel,
                currentValue: fieldContext.currentValue,
                fieldType: fieldContext.fieldType,
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If there's a suggestion, notify parent
      if (data.suggestion && onSuggestion) {
        onSuggestion(data.suggestion);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Przepraszam, wystąpił błąd. Spróbuj ponownie.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (action: "help" | "improve" | "questions") => {
    let message = "";
    switch (action) {
      case "help":
        message = fieldContext
          ? `Pomóż mi wypełnić pole "${fieldContext.fieldLabel}". Co powinienem tutaj wpisać?`
          : "Jak mogę wypełnić ten formularz?";
        break;
      case "improve":
        message = fieldContext?.currentValue
          ? `Popraw błędy ortograficzne i ulepsz moją odpowiedź w polu "${fieldContext.fieldLabel}": "${fieldContext.currentValue}"`
          : "Nie mam jeszcze tekstu do poprawienia.";
        break;
      case "questions":
        message = fieldContext
          ? `Jakie pytania pomocnicze powinienem sobie zadać, aby dobrze wypełnić pole "${fieldContext.fieldLabel}"?`
          : "Jakie pytania pomocnicze mogą mi pomóc w wypełnieniu formularza?";
        break;
    }
    if (message) {
      sendMessage(message);
    }
  };

  return (
    <>
      {/* Chatbot Button - pokazuj tylko gdy nie ma fieldContext (chatbot nie jest zawsze otwarty) */}
      {!alwaysOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Otwórz chatbota"
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          )}
          {!isOpen && messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
              {messages.length}
            </span>
          )}
        </button>
      )}

      {/* Chatbot Window - zawsze widoczny gdy jest fieldContext */}
      {(isOpen || alwaysOpen) && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Asystent formularza</h3>
                {fieldContext && (
                  <p className="text-xs text-blue-100">
                    Pomoc dla: {fieldContext.fieldLabel}
                  </p>
                )}
              </div>
            </div>
            {/* Przycisk zamykania - ukryj gdy chatbot jest zawsze otwarty */}
            {!alwaysOpen && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Zamknij"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Quick Actions */}
          {fieldContext && (
            <div 
              className="p-3 bg-gray-50 border-b border-gray-200 flex gap-2 flex-wrap"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuickAction("help");
                }}
                className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
              >
                💡 Pomoc
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuickAction("questions");
                }}
                className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
              >
                ❓ Pytania
              </button>
              {fieldContext.currentValue && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuickAction("improve");
                  }}
                  className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                >
                  ✏️ Popraw tekst
                </button>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                <p className="mb-2">👋 Cześć! Jestem tutaj, aby pomóc.</p>
                <p>
                  {fieldContext
                    ? `Mogę pomóc Ci wypełnić pole "${fieldContext.fieldLabel}".`
                    : "Zadaj mi pytanie lub użyj szybkich akcji powyżej."}
                </p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  {message.role === "assistant" &&
                    message.content.includes("SUGEROWANA_ODPOWIEDŹ:") && (
                      <button
                        type="button"
                        onClick={() => {
                          const suggestion = message.content
                            .split("SUGEROWANA_ODPOWIEDŹ:")[1]
                            .trim();
                          if (onSuggestion) {
                            onSuggestion(suggestion);
                          }
                        }}
                        className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Użyj tej odpowiedzi
                      </button>
                    )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div 
            className="p-4 bg-white border-t border-gray-200"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder="Zadaj pytanie..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                rows={2}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(e);
                }}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
