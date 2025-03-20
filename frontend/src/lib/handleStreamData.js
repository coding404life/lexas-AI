let concatenatedResponse = "";

export const handleStreamData = (value, updateHistory, setIsProcessing) => {
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
    const timestamp = Date.now();

    // Handle different event types
    switch (eventType) {
      case "chunk":
        concatenatedResponse += data;
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
              timestamp: timestamp,
            },
          ]);
        } catch (e) {
          console.error("Failed to parse tool_use data:", e);
        }
        break;

      case "tool_output":
        try {
          const outputData = JSON.parse(data);
          const toolType = outputData.tool_name; // get the tool type
          setAiResponse((prev) => [
            ...prev,
            {
              type: "tool_output",
              toolType,
              result: outputData.output,
              timestamp: timestamp,
            },
          ]);
        } catch (e) {
          console.error("Failed to parse tool_output data:", e);
        }
        break;

      case "error":
        setAiResponse((prev) => [
          ...prev,
          {
            type: "error",
            content: data,
            timestamp: timestamp,
          },
        ]);
        setIsProcessing(false);
        break;

      case "end":
        updateHistory(concatenatedResponse);
        concatenatedResponse = "";
        setIsProcessing(false);
        break;

      default:
        console.log(`Unknown event type: ${eventType}`);
    }
  });
};
