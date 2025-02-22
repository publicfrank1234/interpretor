import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import realtimeService from "../services/RealtimeAPISingleton";

const SummaryPage = () => {
  const history = useSelector((state) => state.chat.history);
  const [summary, setSummary] = useState("");
  const [actions, setActions] = useState([]);
  const [webhookStatus, setWebhookStatus] = useState("");

  useEffect(() => {
    if (history.length === 0) return;

    // Format the conversation history
    const chatHistoryText = history
      .map(
        (entry) =>
          `[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.type}: ${
            entry.content
          }`
      )
      .join("\n");

    const summaryInstruction = `
      Please summarize the following conversation. 
      Additionally, detect and extract any intent related to:
      - Scheduling a follow-up appointment.
      - Sending a lab order.
      
      If any intent is detected, format your response as:
      {
        "summary": "<conversation summary>",
        "actions": [
          { "type": "schedule_appointment", "details": "<details>" },
          { "type": "send_lab_order", "details": "<details>" }
        ]
      }
      
      If no actions are found, return:
      {
        "summary": "<conversation summary>",
        "actions": []
      }
      
      Conversation:
      ${chatHistoryText}
    `;

    realtimeService.sendEvent({
      type: "response.create",
      response: {
        modalities: ["text"],
        instructions: summaryInstruction,
      },
    });

    // Handler for summary response
    const summaryHandler = (data) => {
      console.log("Summary and detected actions received:", data.text);
      try {
        const parsedResponse = JSON.parse(data.text);
        setSummary(parsedResponse.summary || "No summary available.");
        setActions(parsedResponse.actions || []);

        if (parsedResponse.actions.length > 0) {
          setWebhookStatus("✅ Webhook triggered for detected actions."); // simulate webhook
          parsedResponse.actions.forEach((action) => {
            console.log("Webhook simulated for action:", action);
          });
        } else {
          setWebhookStatus("No actions detected.");
        }
      } catch (error) {
        console.error("Error parsing summary response:", error);
      }
    };

    realtimeService.on("response.text.done", summaryHandler);

    return () => {
      realtimeService.off("response.text.done", summaryHandler);
    };
  }, [history]);

  return (
    <div style={styles.container}>
      <h1> Conversation Summary</h1>

      <div style={styles.card}>
        <h2>Summary</h2>
        {summary ? <p>{summary}</p> : <p>⏳ Generating summary...</p>}
      </div>

      <div style={styles.card}>
        <h2>Detected Actions</h2>
        {actions.length > 0 ? (
          <ul>
            {actions.map((action, index) => (
              <li key={index}>
                <strong>{action.type.replace("_", " ").toUpperCase()}:</strong>{" "}
                {action.details}
              </li>
            ))}
          </ul>
        ) : (
          <p>No actions detected.</p>
        )}
      </div>

      <div style={styles.card}>
        <h2>Webhook Status</h2>
        <p>{webhookStatus}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: "15px",
    margin: "15px 0",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
};

export default SummaryPage;
