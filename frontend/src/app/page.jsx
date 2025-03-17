"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!input.trim()) return;

    const userMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: "12345",
          query: input,
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true }).trim();

        console.log("Received chunk:", chunk); // Debugging

        // Handle multiple events in a single chunksss
        const events = chunk
          .split("\n")
          .filter((line) => line.startsWith("data:"));

        for (const event of events) {
          const jsonData = event.replace("data: ", "").trim();
          console.log("Parsed JSON:", jsonData); // Debugging

          try {
            const data = JSON.parse(jsonData);
            console.log({ data });
            setMessages((prev) => [
              ...prev,
              { type: data.type, text: jsonData },
            ]);

            if (data.type === "end") {
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error("JSON Parse Error:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  console.log(messages);

  return (
    <div className="flex flex-col h-screen p-4 max-w-md mx-auto md:max-w-lg lg:max-w-xl">
      <div className="flex-1 overflow-y-auto border p-4 mb-4 rounded-lg bg-gray-100">
        {messages.map((msg, index) => (
          <div
            key={index + 2}
            className={`p-2 my-2 rounded-lg max-w-xs md:max-w-sm lg:max-w-md ${
              msg.type === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-200 text-gray-800 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border p-2 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50"
          onClick={sendMessage}
          // disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
