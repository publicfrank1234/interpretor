class RealtimeAPIService {
  constructor({ apiKey, model }) {
    this.apiKey = apiKey;
    this.model = model;
    this.ws = null;
    this.eventHandlers = {};
    this.connectPromise = null;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = new Promise((resolve, reject) => {
      const url = `wss://api.openai.com/v1/realtime?model=${this.model}`;
      const protocols = [
        "realtime",
        "openai-insecure-api-key." + this.apiKey,
        "openai-beta.realtime-v1",
      ];

      this.ws = new WebSocket(url, protocols);
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        console.log("Connected to the Realtime API via WebSocket.");
        this.connectPromise = null;

        this.sendEvent({
          type: "session.update",
          session: {
            input_audio_transcription: { model: "whisper-1" },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200,
              create_response: false, // Disable automatic response creation
              interrupt_response: true,
            },
          },
        });

        resolve();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.connectPromise = null;
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`WebSocket message: `, event);

          // Use data.payload if it exists; otherwise, use data itself.
          const handlerData = data.payload !== undefined ? data.payload : data;
          if (data.type && this.eventHandlers[data.type]) {
            this.eventHandlers[data.type].forEach((handler) =>
              handler(handlerData)
            );
          }
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
        this.ws = null;
      };
    });

    return this.connectPromise;
  }

  on(eventType, handler) {
    if (!this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = [];
    }
    this.eventHandlers[eventType].push(handler);
  }

  off(eventType, handler) {
    if (!this.eventHandlers[eventType]) return;
    this.eventHandlers[eventType] = this.eventHandlers[eventType].filter(
      (h) => h !== handler
    );
  }

  async sendEvent(event) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not open. Reconnecting...");
      try {
        await this.connect();
        console.log("Reconnected. Sending event...");
      } catch (err) {
        console.error("Failed to reconnect:", err);
        return;
      }
    }

    // Check one more time if ws is open
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error(
        "WebSocket is still not open after reconnecting. Aborting send."
      );
      return;
    }

    this.ws.send(JSON.stringify(event));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default RealtimeAPIService;
