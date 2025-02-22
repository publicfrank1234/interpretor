import React, { useState, useRef } from "react";
import realtimeService from "../services/RealtimeAPISingleton";

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

const PCMRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const startRecording = async () => {
    try {
      // Create an AudioContext with the desired sample rate
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      // Resume the AudioContext if it's suspended
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      await audioContext.audioWorklet.addModule("/pcm-processor.js");

      // Get access to the microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Create a MediaStreamAudioSourceNode from the stream
      const source = audioContext.createMediaStreamSource(stream);

      // Create an AudioWorkletNode that uses our PCM processor
      const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");
      workletNodeRef.current = workletNode;

      // Connect the source to the worklet node
      source.connect(workletNode);

      // Listen for messages from the worklet (each message is an ArrayBuffer of PCM16 data)
      workletNode.port.onmessage = (event) => {
        const pcmBuffer = event.data;
        const base64Audio = arrayBufferToBase64(pcmBuffer);
        // Send the Base64-encoded PCM16 audio to the API using realtimeService
        realtimeService.sendEvent({
          type: "input_audio_buffer.append",
          audio: base64Audio,
        });
        //console.log("Received PCM16 chunk (Base64):", base64Audio);
      };

      setRecording(true);
      console.log("Recording started using AudioWorklet (PCM16).");
    } catch (err) {
      console.error(
        "Error accessing microphone or initializing AudioWorklet:",
        err
      );
    }
  };

  const stopRecording = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setRecording(false);
    console.log("Recording stopped.");
  };

  return (
    <div>
      <button onClick={startRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>
    </div>
  );
};

export default PCMRecorder;
