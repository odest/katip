"use client";

import { useState, useEffect } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { stat } from "@tauri-apps/plugin-fs";
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

export function AudioFilePicker() {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTauriApp, setIsTauriApp] = useState(false);

  useEffect(() => {
    setIsTauriApp(isTauri());
  }, []);

  const handleSelectFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

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

  return (
    <div className="w-full max-w-2xl space-y-6 p-6 border rounded-lg">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Audio File Picker</h2>
        <p className="text-sm text-muted-foreground">
          Select an audio file to view its details
        </p>
      </div>

      <Button
        onClick={handleSelectFile}
        disabled={isLoading || !isTauriApp}
        className="w-full"
      >
        {isLoading
          ? "Loading..."
          : !isTauriApp
            ? "Native only - Web version under development"
            : "Select Audio File"}
      </Button>

      {error && (
        <div className="p-4 border border-destructive rounded-md bg-destructive/10">
          <p className="text-sm text-destructive font-medium">Error:</p>
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {selectedFile && (
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
