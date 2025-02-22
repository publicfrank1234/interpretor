import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setApiKey } from "../store/configSlice";

const SetupPage = () => {
  const [key, setKey] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSave = () => {
    if (key.trim()) {
      dispatch(setApiKey(key.trim()));
      navigate("/translation");
    } else {
      alert("Please enter a valid OpenAI API key.");
    }
  };

  return (
    <div style={styles.container}>
      <h1> Setup OpenAI API Key</h1>
      <p>
        Enter your OpenAI API key below to start using the Translation
        Assistant.
      </p>

      <input
        type="text"
        placeholder="Enter OpenAI API Key..."
        value={key}
        onChange={(e) => setKey(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleSave} style={styles.button}>
        Save & Continue
      </button>

      <div style={styles.videoContainer}>
        <h2>📽️ Demo Video</h2>
        <iframe
          width="100%"
          height="315"
          src="https://www.loom.com/embed/0c9d39151199403696082f938818ad0d"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "auto",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    fontSize: "16px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  videoContainer: {
    marginTop: "20px",
  },
};

export default SetupPage;
