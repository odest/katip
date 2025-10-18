"use client";

import { useState, useEffect } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { stat } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

interface FileInfo {
  path: string;
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  isSymlink: boolean;
  mtime: Date | null;
  atime: Date | null;
  birthtime: Date | null;
}

interface TranscriptionSegment {
  start_time: number;
  end_time: number;
  text: string;
}

export function AudioFilePicker() {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTauriApp, setIsTauriApp] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [modelPath, setModelPath] = useState<string>("");
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>(
    []
  );
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    const checkPlatform = async () => {
      const isTauriRuntime = isTauri();
      setIsTauriApp(isTauriRuntime);

      if (isTauriRuntime) {
        try {
          const platformType = await platform();
          setIsAndroid(platformType === "android");
        } catch (err) {
          console.error("Error detecting platform:", err);
        }
      }
    };

    checkPlatform();
  }, []);

  const handleSelectFile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTranscription([]);

      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Audio Files",
            extensions: [
              "m4a",
              "wav",
              "mp3",
              "flac",
              "aac",
              "ogg",
              "wma",
              "aiff",
              "ape",
              "opus",
            ],
          },
        ],
      });

      if (selected) {
        const fileStats = await stat(selected);

        const fileInfo: FileInfo = {
          path: selected,
          size: fileStats.size,
          isFile: fileStats.isFile,
          isDirectory: fileStats.isDirectory,
          isSymlink: fileStats.isSymlink,
          mtime: fileStats.mtime,
          atime: fileStats.atime,
          birthtime: fileStats.birthtime,
        };

        setSelectedFile(fileInfo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error selecting file:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectModel = async () => {
    try {
      setError(null);

      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Whisper Model",
            extensions: ["bin"],
          },
        ],
      });

      if (selected) {
        setModelPath(selected);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error selecting model:", err);
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile || !modelPath) {
      setError("Please select both an audio file and a model");
      return;
    }

    try {
      setIsTranscribing(true);
      setError(null);
      setTranscription([]);

      const result = await invoke<TranscriptionSegment[]>("transcribe_audio", {
        audioPath: selectedFile.path,
        modelPath: modelPath,
      });

      setTranscription(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
      console.error("Error transcribing:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const secs = seconds % 60;
    const mins = minutes % 60;

    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-2xl space-y-6 p-6 border rounded-lg">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Audio File Transcription</h2>
        <p className="text-sm text-muted-foreground">
          Select an audio file and a Whisper model to transcribe
        </p>
      </div>

      {isAndroid && (
        <div className="p-4 border border-yellow-500 rounded-md bg-yellow-500/10">
          <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">
            Android Platform Detected
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-500">
            Speech-to-text transcription is not yet available on Android. This
            feature is currently only supported on desktop platforms (Windows,
            macOS, Linux).
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Button
            onClick={handleSelectFile}
            disabled={isLoading || !isTauriApp || isAndroid}
            className="w-full"
          >
            {isLoading
              ? "Loading..."
              : !isTauriApp
                ? "Desktop only - This version under development"
                : isAndroid
                  ? "Desktop only - This version under development"
                  : "Select Audio File"}
          </Button>
          {selectedFile && (
            <p className="text-sm text-muted-foreground mt-2">
              Selected: {selectedFile.path.split(/[/\\]/).pop()}
            </p>
          )}
        </div>

        <div>
          <Button
            onClick={handleSelectModel}
            disabled={!isTauriApp || isAndroid}
            className="w-full"
            variant="secondary"
          >
            {modelPath ? "Change Model" : "Select Whisper Model (.bin)"}
          </Button>
          {modelPath && (
            <p className="text-sm text-muted-foreground mt-2">
              Model: {modelPath.split(/[/\\]/).pop()}
            </p>
          )}
        </div>

        <Button
          onClick={handleTranscribe}
          disabled={
            !selectedFile ||
            !modelPath ||
            isTranscribing ||
            !isTauriApp ||
            isAndroid
          }
          className="w-full"
        >
          {isTranscribing ? "Transcribing..." : "Transcribe"}
        </Button>
      </div>

      {error && (
        <div className="p-4 border border-destructive rounded-md bg-destructive/10">
          <p className="text-sm text-destructive font-medium">Error:</p>
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {transcription.length > 0 && (
        <ScrollArea className="h-64">
          <div className="space-y-4 p-4 border rounded-md bg-muted/50 mx-auto">
            <h3 className="text-lg font-semibold">Transcription Results</h3>
            <div className="space-y-3">
              {transcription.map((segment, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-xs text-muted-foreground font-mono">
                    [{formatTime(segment.start_time)} →{" "}
                    {formatTime(segment.end_time)}]
                  </p>
                  <p className="text-sm">{segment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}

      {selectedFile && transcription.length === 0 && !isTranscribing && (
        <ScrollArea className="h-64">
          <div className="space-y-4 p-4 border rounded-md bg-muted/50 mx-auto">
            <h3 className="text-lg font-semibold">File Information</h3>

            <div className="space-y-2 font-mono text-sm">
              -
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="font-semibold text-muted-foreground">
                  Full Path:
                </span>
                <span className="break-all">{selectedFile.path}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="font-semibold text-muted-foreground">
                  File Size:
                </span>
                <span>
                  {formatBytes(selectedFile.size)} (
                  {selectedFile.size.toLocaleString()} bytes)
                </span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="font-semibold text-muted-foreground">
                  Is File:
                </span>
                <span>{selectedFile.isFile ? "Yes" : "No"}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="font-semibold text-muted-foreground">
                  Is Directory:
                </span>
                <span>{selectedFile.isDirectory ? "Yes" : "No"}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="font-semibold text-muted-foreground">
                  Is Symlink:
                </span>
                <span>{selectedFile.isSymlink ? "Yes" : "No"}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="font-semibold text-muted-foreground">
                  Modified:
                </span>
                <span>{formatDate(selectedFile.mtime)}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="font-semibold text-muted-foreground">
                  Accessed:
                </span>
                <span>{formatDate(selectedFile.atime)}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="font-semibold text-muted-foreground">
                  Created:
                </span>
                <span>{formatDate(selectedFile.birthtime)}</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
