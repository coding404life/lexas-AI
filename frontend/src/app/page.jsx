"use client";

import AiResponseCard from "@/components/AiResponseCard";
import QueryCard from "@/components/QueryCard";
import { handleStreamData } from "@/lib/handleStreamData";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

// Main page component
export default function Home() {
  const [chatHistory, setChatHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef("");
  const responseAreaRef = useRef(null);

  // Session ID management
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("sessionId");
      if (storedId) return storedId;
      const newId = uuidv4();
      localStorage.setItem("sessionId", newId);
      return newId;
    }
    return uuidv4();
  });

  // Auto-scroll to the bottom of the response area
  useEffect(() => {
    if (responseAreaRef.current) {
      responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const updateHistory = async (data) => {
    setChatHistory((history) => [
      ...history,
      {
        type: "ai",
        content: data,
        timestamp: Date.now(),
      },
    ]);
  };

  // Send query to the backend and handle SSE using fetch :)
  const sendQuery = async (query) => {
    setIsProcessing(true);

    try {
      const response = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          session_id: sessionId,
          query,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to connect to SSE endpoint: ${response.status} - ${errorText}`
        );
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        handleStreamData(value, updateHistory, setIsProcessing);
      }
    } catch (e) {
      console.error("Failed to connect to SSE endpoint:", e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const inputValue = inputRef.current.value;

    setChatHistory((history) => [
      ...history,
      {
        id: uuidv4(),
        type: "query",
        content: inputValue,
        timestamp: Date.now(),
      },
    ]);

    if (inputValue.trim() && !isProcessing) {
      sendQuery(inputValue);
      inputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">SuperCar Virtual Assistant</h1>
      </header>

      <main className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto p-4">
        <div
          ref={responseAreaRef}
          className="flex-1 overflow-y-auto space-y-4 py-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#888 transparent" }}
        >
          {chatHistory
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((chat, idx) =>
              chat.type === "query" ? (
                <QueryCard key={`key-${idx + 1}`} content={chat.content} />
              ) : (
                <AiResponseCard key={`key-${idx + 1}`} content={chat.content} />
              )
            )}

          {isProcessing && (
            <div className="text-center italic text-gray-500">
              Processing your request...
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-2 p-2 border-t border-gray-700"
        >
          <input
            type="text"
            ref={inputRef}
            placeholder="Ask Lex about SuperCar..."
            className="flex-1 p-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            Submit
          </button>
        </form>
      </main>
    </div>
  );
}
