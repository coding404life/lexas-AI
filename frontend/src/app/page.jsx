"use client";

import AiResponseCard from "@/components/AiResponseCard";
import QueryCard from "@/components/QueryCard";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

// Main page component
export default function Home() {
  const [responses, setResponses] = useState([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState([]);
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
  }, [responses, aiResponse]);

  const handleStreamData = (value) => {
    // input: 'event: chunk\r\ndata:  go\r\n\r\n'
    // Split the value into individual events
    const events = value.split(/\r?\n\r?\n/).filter((e) => e.trim());

    // Process each event
    events.forEach((eventStr) => {
      // Split the event into lines
      const eventLines = eventStr.split(/\r?\n/);

      // Need at least two lines for a valid event (event and data)
      if (eventLines.length < 2) return;

      // Extract event type and data
      const eventLine = eventLines[0];
      const dataLine = eventLines[1];

      if (!eventLine.startsWith("event:") || !dataLine.startsWith("data:"))
        return;

      const eventType = eventLine.replace("event:", "").trim();
      const data = dataLine.replace("data:", "");

      // Handle different event types
      switch (eventType) {
        case "chunk":
          setAiResponse((prev) => [...prev, { type: "text", content: data }]);
          break;

        case "tool_use":
          try {
            const toolData = JSON.parse(data);
            setAiResponse((prev) => [
              ...prev,
              {
                type: "tool_use",
                tool: toolData.name,
                arguments: toolData.arguments,
                toolCallId: toolData.id,
              },
            ]);
          } catch (e) {
            console.error("Failed to parse tool_use data:", e);
          }
          break;

        case "tool_output":
          try {
            const outputData = JSON.parse(data);
            setAiResponse((prev) => [
              ...prev,
              {
                type: "tool_output",
                result: outputData.output,
              },
            ]);
          } catch (e) {
            console.error("Failed to parse tool_output data:", e);
          }
          break;

        case "end":
          setIsProcessing(false);
          break;

        default:
          console.log(`Unknown event type: ${eventType}`);
      }
    });
  };

  // Send query to the backend and handle SSE using fetch :)
  const sendQuery = async (query) => {
    setResponses((prev) => [...prev, { type: "query", content: query }]);
    setAiResponse([]);
    setIsProcessing(true);

    const response = await fetch("http://localhost:8000/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        session_id: sessionId,
        query: query,
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

      handleStreamData(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      sendQuery(input);
      setInput("");
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
          {responses.map((item, idx) => (
            <QueryCard key={idx + 1} content={item.content} />
          ))}

          {aiResponse.length > 0 && <AiResponseCard content={aiResponse} />}

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
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
