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

    // Handle different event types
    switch (eventType) {
      case "chunk":
        concatenatedResponse += data;
        break;

      case "tool_output":
        try {
          const outputData = JSON.parse(data);
          updateHistory(outputData);
        } catch (e) {
          console.error("Failed to parse tool_output data:", e);
        }
        break;

      case "error":
        console.error("Failed to parse tool_output data:", e);
        setIsProcessing(false);
        break;

      case "end":
        updateHistory({ content: concatenatedResponse, type: "ai" });
        concatenatedResponse = "";
        setIsProcessing(false);
        break;

      default:
        console.log(`Unknown event type: ${eventType}`);
    }
  });
};
