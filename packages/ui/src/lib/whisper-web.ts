// Web WASM Transcription Helper

declare global {
  interface Window {
    Module: any;
    whisperScriptLoaded?: boolean;
  }
}

export interface TranscriptionSegment {
  start_time: number;
  end_time: number;
  text: string;
}

export interface TranscriptionResult {
  segments: TranscriptionSegment[];
  processingTime: number;
  modelUsed: string;
}

export class WebWhisperTranscriber {
  private module: any = null;
  private instance: any = null;
  private modelLoaded: boolean = false;
  private modelType: string = "base";
  private outputCallback: ((text: string) => void) | null = null;

  async initialize(modelType: "tiny" | "base" = "base") {
    this.modelType = modelType;

    // Global Module setup
    if (typeof window !== "undefined" && !window.Module) {
      (window as any).Module = {
        print: (text: string) => {
          console.log("WASM:", text);
          if (this.outputCallback) {
            this.outputCallback(text);
          }
        },
        printErr: (text: string) => {
          console.log("WASM Info:", text);
          if (this.outputCallback) {
            this.outputCallback(text);
          }
        },
      };
    }

    // Load WASM module only once
    if (!window.whisperScriptLoaded) {
      await this.loadWasmModule();
      window.whisperScriptLoaded = true;
    } else if (window.Module) {
      // Reuse existing module
      this.module = window.Module;
    }
  }

  async loadModelFile(modelFile: File): Promise<void> {
    if (!this.module) {
      throw new Error("Module not loaded. Call initialize() first.");
    }

    // Read model file
    const arrayBuffer = await modelFile.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Write to WASM FileSystem
    try {
      this.module.FS_unlink("whisper.bin");
    } catch (e) {
      // File not found error is ignored
    }

    this.module.FS_createDataFile("/", "whisper.bin", data, true, true);

    // Initialize Whisper instance
    this.instance = this.module.init("whisper.bin");

    if (!this.instance) {
      throw new Error("Failed to initialize whisper");
    }

    this.modelLoaded = true;
    this.modelType = modelFile.name;
  }

  private async loadWasmModule(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof document === "undefined") {
        reject(new Error("This can only run in browser"));
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(
        'script[src="/whisper/libmain.js"]'
      );
      if (existingScript) {
        // Wait for module to be ready
        setTimeout(() => {
          if (typeof window !== "undefined" && (window as any).Module) {
            this.module = (window as any).Module;
            resolve();
          } else {
            reject(new Error("Module not found"));
          }
        }, 100);
        return;
      }

      const script = document.createElement("script");
      script.src = "/whisper/libmain.js";
      script.async = true;

      script.onload = () => {
        setTimeout(() => {
          if (typeof window !== "undefined" && (window as any).Module) {
            this.module = (window as any).Module;
            resolve();
          } else {
            reject(new Error("Module not found"));
          }
        }, 100);
      };

      script.onerror = () => {
        reject(new Error("Failed to load WASM module"));
      };

      document.body.appendChild(script);
    });
  }

  async transcribeAudioFile(audioFile: File): Promise<TranscriptionResult> {
    if (!this.modelLoaded || !this.module || !this.instance) {
      throw new Error("Whisper not initialized. Call initialize() first.");
    }

    const startTime = performance.now();

    // Read audio file
    const arrayBuffer = await audioFile.arrayBuffer();

    // Decode with Web Audio API
    const audioCtx = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Resample to 16kHz mono
    const offlineCtx = new OfflineAudioContext(1, audioBuffer.length, 16000);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    const audioData = renderedBuffer.getChannelData(0);

    // Transcription process
    return new Promise((resolve, reject) => {
      const outputLines: string[] = [];
      let isComplete = false;

      this.outputCallback = (text: string) => {
        outputLines.push(text);

        if (text.includes("total time") && !isComplete) {
          isComplete = true;

          setTimeout(() => {
            const segments = this.parseTranscriptionOutput(outputLines);
            const processingTime = performance.now() - startTime;

            this.outputCallback = null;

            console.log(
              "✅ Transcription complete! Output lines:",
              outputLines.length
            );
            console.log("📊 Parsed segments:", segments.length);

            resolve({
              segments,
              processingTime,
              modelUsed: this.modelType,
            });
          }, 100);
        }
      };

      // Start transcription
      setTimeout(() => {
        try {
          const ret = this.module.full_default(
            this.instance,
            audioData,
            "en",
            8, // 8 thread for testing
            false
          );

          if (ret !== 0) {
            this.outputCallback = null;
            reject(new Error(`Transcription failed with code: ${ret}`));
            return;
          }
        } catch (error) {
          this.outputCallback = null;
          reject(error);
        }
      }, 100);
    });
  }

  private parseTranscriptionOutput(lines: string[]): TranscriptionSegment[] {
    const segments: TranscriptionSegment[] = [];

    for (const line of lines) {
      // [00:00:00.000 --> 00:00:05.000]
      const match = line.match(
        /\[(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})\]\s*(.+)/
      );

      if (match && match[1] && match[2] && match[3]) {
        const [, startStr, endStr, text] = match;
        segments.push({
          start_time: this.timeStringToMs(startStr),
          end_time: this.timeStringToMs(endStr),
          text: text.trim(),
        });
      }
    }

    return segments;
  }

  private timeStringToMs(timeStr: string): number {
    // "00:00:05.000" -> milliseconds
    const parts = timeStr.split(":");
    if (parts.length !== 3) return 0;

    const hours = parts[0];
    const minutes = parts[1];
    const seconds = parts[2];

    if (!seconds) return 0;

    const secParts = seconds.split(".");
    if (secParts.length !== 2) return 0;

    const secs = secParts[0];
    const ms = secParts[1];

    return (
      parseInt(hours || "0") * 3600000 +
      parseInt(minutes || "0") * 60000 +
      parseInt(secs || "0") * 1000 +
      parseInt(ms || "0")
    );
  }

  isReady(): boolean {
    return this.modelLoaded && !!this.module && !!this.instance;
  }

  cleanup(): void {
    // Cancel any ongoing callbacks
    this.outputCallback = null;

    // Clean up instance if it exists
    if (this.instance && this.module?.free) {
      try {
        this.module.free(this.instance);
      } catch (e) {
        console.warn("Error freeing whisper instance:", e);
      }
    }

    // Reset state
    this.instance = null;
    this.modelLoaded = false;

    // Note: We don't reset this.module because the WASM module is global
    // and will cause the "ExitStatus already declared" error if reloaded
  }
}
