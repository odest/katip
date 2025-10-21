"use client";

import { useState, useEffect, useRef } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { invoke } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import { useTranslations } from "@workspace/i18n";
import {
  AudioFilePicker,
  SelectedFileInfo,
} from "@workspace/ui/components/common/audio-file-picker";
import {
  ModelFilePicker,
  SelectedModelInfo,
} from "@workspace/ui/components/common/model-file-picker";
import { BrowserCapabilitiesBadge } from "@workspace/ui/components/common/browser-capabilities-badge";
import { WebWhisperTranscriber } from "@workspace/ui/lib/whisper-web";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { FileAudio, FileCode2, AlertCircle, Loader2 } from "lucide-react";

interface TranscriptionSegment {
  start_time: number;
  end_time: number;
  text: string;
}

export function TranscriptionPanel() {
  const t = useTranslations("TranscriptionPanel");
  const [audioFile, setAudioFile] = useState<SelectedFileInfo | null>(null);
  const [modelFile, setModelFile] = useState<SelectedModelInfo | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>(
    []
  );
  const [isAndroid, setIsAndroid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTauriApp, setIsTauriApp] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Web-specific states
  const whisperRef = useRef<WebWhisperTranscriber | null>(null);
  const [isWhisperReady, setIsWhisperReady] = useState(false);
  const isInitializedRef = useRef(false);

  // Persist state to prevent loss on navigation
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load persisted state
    try {
      const saved = sessionStorage.getItem("transcription-state");
      if (saved) {
        const state = JSON.parse(saved);
        if (state.transcription) {
          setTranscription(state.transcription);
        }
      }
    } catch (e) {
      console.warn("Failed to load persisted state:", e);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Persist transcription results
    try {
      if (transcription.length > 0) {
        sessionStorage.setItem(
          "transcription-state",
          JSON.stringify({ transcription })
        );
      }
    } catch (e) {
      console.warn("Failed to persist state:", e);
    }
  }, [transcription]);

  // Client-side only check for Tauri
  useEffect(() => {
    setIsClient(true);
    setIsTauriApp(isTauri());
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkPlatform = async () => {
      const isTauriRuntime = isTauriApp;

      if (isTauriRuntime) {
        try {
          const platformType = await platform();
          setIsAndroid(platformType === "android");
        } catch (err) {
          console.error("Error detecting platform:", err);
        }
      } else {
        // Web - Initialize Whisper only once
        if (!isInitializedRef.current) {
          isInitializedRef.current = true;
          initializeWebWhisper();
        }
      }
    };

    checkPlatform();

    // Cleanup on unmount
    return () => {
      if (whisperRef.current && !isTauriApp) {
        whisperRef.current.cleanup?.();
      }
    };
  }, [isClient, isTauriApp]);

  const initializeWebWhisper = async () => {
    try {
      setIsLoading(true);
      const transcriber = new WebWhisperTranscriber();
      await transcriber.initialize("base");
      whisperRef.current = transcriber;
      setIsWhisperReady(true);
    } catch (err) {
      console.error("Error initializing Whisper:", err);
      const errorMsg = `Failed to initialize Whisper: ${err instanceof Error ? err.message : "Unknown error"}`;
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // When modelFile changes, load it into Whisper (Web only)
  useEffect(() => {
    const loadWebModel = async () => {
      if (!isTauriApp && modelFile?.webFile && whisperRef.current) {
        try {
          setIsLoading(true);
          await whisperRef.current.loadModelFile(modelFile.webFile);
        } catch (err) {
          console.error("Error loading model:", err);
          const errorMsg = `Failed to load model: ${err instanceof Error ? err.message : "Unknown error"}`;
          setError(errorMsg);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadWebModel();
  }, [modelFile, isTauriApp]);

  const handleTranscribe = async () => {
    if (!audioFile) {
      setError(t("errorSelectAudio"));
      return;
    }

    if (!modelFile) {
      setError(t("errorSelectModel"));
      return;
    }

    try {
      setIsTranscribing(true);
      setError(null);
      setTranscription([]);

      if (isTauriApp) {
        // Tauri - Rust backend
        const result = await invoke<TranscriptionSegment[]>(
          "transcribe_audio",
          {
            audioPath: audioFile.path,
            modelPath: modelFile.path,
          }
        );
        setTranscription(result);
      } else {
        // Web - Client-side WASM transcription
        if (!audioFile.webFile) {
          throw new Error("No audio file selected");
        }

        if (!modelFile.webFile) {
          throw new Error("No model file selected");
        }

        if (!whisperRef.current || !isWhisperReady) {
          throw new Error("Whisper not initialized");
        }

        const result = await whisperRef.current.transcribeAudioFile(
          audioFile.webFile
        );

        setTranscription(result.segments);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
      console.error("Error transcribing:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const secs = seconds % 60;
    const mins = minutes % 60;

    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const canTranscribe =
    audioFile &&
    modelFile &&
    !isTranscribing &&
    !isAndroid &&
    (isTauriApp || isWhisperReady);

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle>{t("title")}</CardTitle>
                <CardDescription>{t("description")}</CardDescription>
              </div>
              {isClient && !isTauriApp && <BrowserCapabilitiesBadge />}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isAndroid && (
              <div className="flex items-start gap-3 p-4 border border-yellow-500 rounded-lg bg-yellow-500/10">
                <AlertCircle className="size-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                    {t("androidPlatformTitle")}
                  </p>
                  <p className="text-sm text-yellow-600/90 dark:text-yellow-500/90">
                    {t("androidPlatformMessage")}
                  </p>
                </div>
              </div>
            )}

            {/* File Selection Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Audio File Picker */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileAudio className="size-4 text-muted-foreground" />
                  <h3 className="font-medium">{t("audioFile")}</h3>
                </div>
                <AudioFilePicker
                  onFileSelect={setAudioFile}
                  disabled={isAndroid || isTranscribing}
                />
                {audioFile && (
                  <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("selectedFile")}
                    </p>
                    <p className="text-sm font-mono break-all">
                      {audioFile.path.split(/[/\\]/).pop()}
                    </p>
                  </div>
                )}
              </div>

              {/* Model File Picker */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileCode2 className="size-4 text-muted-foreground" />
                  <h3 className="font-medium">{t("whisperModel")}</h3>
                </div>

                <ModelFilePicker
                  onModelSelect={setModelFile}
                  disabled={isAndroid || isTranscribing}
                />

                {modelFile && (
                  <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("selectedModel")}
                    </p>
                    <p className="text-sm font-mono break-all">
                      {modelFile.path.split(/[/\\]/).pop()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Transcribe Button */}
            <Button
              onClick={handleTranscribe}
              disabled={!canTranscribe || isLoading}
              className="w-full"
              size="lg"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("transcribing")}
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("loadingWhisper")}
                </>
              ) : (
                t("startTranscription")
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-3 p-4 border border-destructive rounded-lg bg-destructive/10">
                <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    {t("error")}
                  </p>
                  <p className="text-sm text-destructive/90">{error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transcription Results */}
        {transcription.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("transcriptionResults")}</CardTitle>
              <CardDescription>
                {transcription.length}{" "}
                {transcription.length !== 1
                  ? t("segmentsFoundPlural")
                  : t("segmentsFound")}{" "}
                {t("found")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transcription.map((segment, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted/50 space-y-2"
                  >
                    <p className="text-xs text-muted-foreground font-mono">
                      [{formatTime(segment.start_time)} →{" "}
                      {formatTime(segment.end_time)}]
                    </p>
                    <p className="text-sm leading-relaxed">{segment.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
