// pcm-processor.js

class PCMProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    // Get the first input channel (assume mono audio)
    const input = inputs[0];
    if (input && input.length > 0) {
      const samples = input[0]; // Float32Array of audio samples
      // Allocate an ArrayBuffer for PCM16 data (2 bytes per sample)
      const buffer = new ArrayBuffer(samples.length * 2);
      const view = new DataView(buffer);
      // Convert each sample from Float32 (range -1 to 1) to 16-bit integer
      for (let i = 0; i < samples.length; i++) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        // Little-endian conversion:
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
      // Post the raw PCM16 ArrayBuffer to the main thread
      this.port.postMessage(buffer);
    }
    // Keep the processor alive
    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
