"use client";

import { useState, useEffect } from "react";

export interface BrowserCapabilities {
  webAssembly: boolean;
  simd: boolean;
  threads: boolean;
  sharedArrayBuffer: boolean;
  audioContext: boolean;
  offlineAudioContext: boolean;
  isSupported: boolean;
  score: number;
}

export function useBrowserCapabilities() {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities>({
    webAssembly: false,
    simd: false,
    threads: false,
    sharedArrayBuffer: false,
    audioContext: false,
    offlineAudioContext: false,
    isSupported: false,
    score: 0,
  });

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkCapabilities = async () => {
      setIsChecking(true);

      try {
        const caps: BrowserCapabilities = {
          webAssembly: false,
          simd: false,
          threads: false,
          sharedArrayBuffer: false,
          audioContext: false,
          offlineAudioContext: false,
          isSupported: false,
          score: 0,
        };

        // Check WebAssembly
        caps.webAssembly =
          typeof WebAssembly !== "undefined" &&
          typeof WebAssembly.instantiate === "function";

        // Check SIMD
        if (caps.webAssembly) {
          try {
            const simdTestModule = new Uint8Array([
              0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0,
              10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
            ]);
            caps.simd = WebAssembly.validate(simdTestModule);
          } catch (e) {
            caps.simd = false;
          }
        }

        // Check Threads (Web Workers + SharedArrayBuffer)
        caps.threads =
          typeof Worker !== "undefined" &&
          typeof SharedArrayBuffer !== "undefined";

        // Check SharedArrayBuffer
        caps.sharedArrayBuffer = typeof SharedArrayBuffer !== "undefined";

        // Check AudioContext
        caps.audioContext =
          typeof AudioContext !== "undefined" ||
          typeof (window as any).webkitAudioContext !== "undefined";

        // Check OfflineAudioContext
        caps.offlineAudioContext =
          typeof OfflineAudioContext !== "undefined" ||
          typeof (window as any).webkitOfflineAudioContext !== "undefined";

        // Calculate score
        let score = 0;
        if (caps.webAssembly) score += 30;
        if (caps.simd) score += 25;
        if (caps.threads) score += 20;
        if (caps.sharedArrayBuffer) score += 10;
        if (caps.audioContext) score += 10;
        if (caps.offlineAudioContext) score += 5;

        caps.score = score;

        // Check if browser is fully supported
        caps.isSupported =
          caps.webAssembly && caps.audioContext && caps.offlineAudioContext;

        setCapabilities(caps);
      } catch (error) {
        console.error("Error checking browser capabilities:", error);
      } finally {
        setIsChecking(false);
      }
    };

    // Only run on client side
    if (typeof window !== "undefined") {
      checkCapabilities();
    }
  }, []);

  return { capabilities, isChecking };
}
