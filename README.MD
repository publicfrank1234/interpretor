# Interpreter Proof-of-Concept

## What Are We Building?

1. **Hands-Free System:**
   - Involves speech input, speech output, and visual text.
2. **Primary Use Case:**
   - Designed to remove communication barriers between patients and doctors.
3. **Intended Environment:**
   - Typically used in patient rooms during doctor-patient consultations.

---

## What Features Does This Product Deliver?

1. **Conversation Summary:**
   - A detailed summary of the full conversation in English will be provided at the end.
   - Translations can be displayed on-screen in English or both languages, depending on design choices.
2. **Interrupt Capability (Barge In):**
   - Doctors can interrupt the interpreter to add more information.
3. **Command Functionality:**
   - Doctors can use voice commands like "repeat that" to have the system repeat the previous sentence.
4. **Intent Detection:**
   - The system detects and parses specific intents (e.g., schedule a follow-up appointment) along with any associated parameters.

---

## Workflow

### During the Conversation

- The system continuously captures all spoken interactions
- The "repeat that" feature allows users to repeat last output

### After the Conversation

- **Chat History:**
  - A complete record of the conversation is stored.
- **Conversation Summary:**
  - A detailed summary of the full conversation in English is provided.
- **Intent Detection:**
  - Detected intents (such as scheduling follow-up appointments, sending lab orders, or referrals) are displayed along with any parsed parameters.

### Separation of Concerns

Each part of the app has a **clear responsibility**, ensuring modularity and maintainability:

- **Audio Handling** → `PCMRecorder.js` (Captures & processes microphone audio)
- **WebSocket Communication** → `RealtimeAPI.js` and `RealtimeAPISingleton` (Manages real-time API events)
- **Chat History & UI** → `RealtimeChat.js` (Displays transcriptions and translations)
- **Configuration & State** → **Redux Store** (Manages API key, chat history)

This **structured approach** makes it **easy to debug, modify, and extend** without affecting other components.

## Audio Ingestion

Since the use case is for **in-person visits**, there's no need for **WebRTC communication** between remote devices. However, **WebRTC** can still be leveraged for **low-latency transcription**.

### **Option 1: Using Janus-SFU or On-Device ASR**

- **Janus-SFU**: Extracts audio and displays real-time transcriptions on the same screen.
- **On-Device ASR**: Alternatives like **React-Voice** provide speech-to-text processing without external API dependencies.

### **Option 2: Using OpenAI Realtime API (Chosen Approach)**

- OpenAI Realtime API was **recommended in the documentation**.
- Supports **both WebSocket and WebRTC**; we use **WebSocket** for simplicity.
- Ideal for **chunking audio** while ensuring **real-time processing**.
- Uses **PCM16 audio format** (required by OpenAI Realtime API).

---

## Features Not Implemented

The proof of concept **implements all core features** to showcase the workflow, but the following features were **not included** due to scope and cost considerations:

### **Persistent Data Storage**

- Currently, **chat history is only stored in Redux**.
- A production version should store history in a **database** (e.g., Firebase, PostgreSQL).
- **Skipping cloud database** for now to **reduce costs** and **simplify the PoC**.

### **Spanish-to-English Translation Display**

- OpenAI Realtime API **outputs only audio translations**, even when configured for **dual modality (text & audio)**.
- **For the demo**, we display **only the transcribed input** (e.g., if a patient speaks Spanish, the UI will not show the English translation).
- A full implementation would include **manual text translation handling**.

### **API Key Security**

- **Demo users must enter their OpenAI API key manually**.
- Ideally, a **backend proxy** should handle API keys securely.
- Since this PoC is **frontend-based**, it is **not safe** to store API keys on the client.

### **Webhook Action Execution**

- The OpenAI Realtime API **detects intents** (e.g., "schedule follow-up appointment").
- **Webhook calls** (e.g., sending a request to an external system) are **only simulated**.
- A real implementation would require **registering a webhook** and **executing real API calls**.

---

**Next Steps**  
To move beyond the PoC:

1. **Store chat history in a database**.
2. **Ensure text translations are properly displayed**.
3. **Implement a secure backend for API key handling**.
4. **Enable real webhook integration for detected actions**.

---
