import React from "react";
import AudioRecorder from "../components/PCMRecorder";
import RealtimeChat from "../components/RealtimeChat";
import { useSelector } from "react-redux";
import realtimeService from "../services/RealtimeAPISingleton";

const TranslationPage = () => {
  const apiKey = useSelector((state) => state.config.apiKey);

  // Set API Key in singleton when the page loads
  if (apiKey) {
    realtimeService.setApiKey(apiKey);
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}> Translation Assistant</h1>

      <div style={styles.card}>
        <h2> Speak & Translate</h2>
        <p>
          Start speaking, and the system will detect and translate between
          English and Spanish.
        </p>
        <AudioRecorder />
      </div>

      <div style={styles.card}>
        <h2> Conversation History</h2>
        <p>View live transcriptions and translations below.</p>
        <RealtimeChat />
      </div>
    </div>
  );
};

// Simple inline styles for a cleaner UI
const styles = {
  container: {
    maxWidth: "800px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    fontSize: "26px",
    marginBottom: "20px",
    color: "#333",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: "15px",
    margin: "15px 0",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
};

export default TranslationPage;
