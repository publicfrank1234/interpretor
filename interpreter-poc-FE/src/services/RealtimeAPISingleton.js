import RealtimeAPIService from "./RealtimeAPI";
import { store } from "../store/store";

// Create a singleton instance of the realtime service.
const realtimeServiceInstance = new RealtimeAPIService({
  apiKey: store.getState().config.apiKey || "",
  model: "gpt-4o-realtime-preview-2024-12-17",
});

realtimeServiceInstance.setApiKey = function (newKey) {
  console.log("🔑 API Key Updated:", newKey);
  this.apiKey = newKey;
};

let lastOutput = null;

// Helper: Convert an ArrayBuffer to a Base64 string.
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// --- Event Handlers ---
// Handle transcription of user audio.
realtimeServiceInstance.on(
  "conversation.item.input_audio_transcription.completed",
  (data) => {
    // Depending on how the event is structured, data might be the entire event.
    const transcript = data.transcript;
    console.log("Transcription received:", transcript);

    // Check if the user said "repeat that" (case insensitive).
    if (transcript && transcript.toLowerCase().includes("repeat that")) {
      handleRepeat();
      return;
    }

    // Otherwise, build a translation instruction.
    const translationInstruction = `Please detect the language of the following text and translate it to the opposite language.
    If the text is in Spanish, translate it to English; if it's in English, translate it to Spanish.
    Provide only the translated text in your response. Input: "${transcript}"`;

    //     const translationInstruction = `Please detect the language of the following text.
    // If the text is in English, translate it to Spanish for the audio output.
    // If the text is in Spanish, translate it to English for the audio output.
    // Additionally, always provide an English text transcription of the translatio in the text output not audio output.
    // Input: "${transcript}"`;

    // Send a new response.create event to get the translation.
    realtimeServiceInstance.sendEvent({
      type: "response.create",
      response: {
        modalities: ["audio", "text"],
        instructions: translationInstruction,
      },
    });
  }
);

// 3. Handle streaming audio output.
let audioChunks = [];
realtimeServiceInstance.on("response.audio.delta", (data) => {
  // Each delta is a Base64 chunk.
  audioChunks.push(data.delta);
});
realtimeServiceInstance.on("response.audio.done", (data) => {
  console.log("Audio streaming done.");
  const fullAudioBase64 = audioChunks.join("");
  const binaryString = window.atob(fullAudioBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  // Create a WAV Blob using a helper function (assumes PCM16 at 24kHz mono)
  const wavBlob = createWavBlob(bytes.buffer, 24000, 1);
  const url = URL.createObjectURL(wavBlob);
  lastOutput = { type: "audio", data: url };
  const audio = new Audio(url);
  audio.play().catch((err) => console.error("Error playing audio:", err));
  audioChunks = [];
});

const handleRepeat = () => {
  if (!lastOutput) {
    console.log("No output to repeat.");
    return;
  }
  if (lastOutput.type === "audio") {
    const audio = new Audio(lastOutput.data);
    audio
      .play()
      .catch((err) => console.error("Error playing repeated audio:", err));
    console.log("Repeating audio output.");
  } else if (lastOutput.type === "text") {
    console.log("Repeating text output:", lastOutput.data);
    const utterance = new SpeechSynthesisUtterance(lastOutput.data);
    window.speechSynthesis.speak(utterance);
  }
};

// Helper function to create a WAV Blob from PCM16 data.
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function createWavBlob(pcmBuffer, sampleRate = 24000, numChannels = 1) {
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const pcmDataLength = pcmBuffer.byteLength;
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + pcmDataLength);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + pcmDataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, "data");
  view.setUint32(40, pcmDataLength, true);

  const pcmBytes = new Uint8Array(pcmBuffer);
  const wavBytes = new Uint8Array(buffer);
  wavBytes.set(pcmBytes, headerSize);

  return new Blob([buffer], { type: "audio/wav" });
}

export default realtimeServiceInstance;
